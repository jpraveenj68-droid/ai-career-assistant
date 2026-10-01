import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthenticatedRequest, optionalAuth } from './auth';
import { db } from '../db';

export const voiceRouter = Router();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    // Silent failover to deterministic engine
  }
}

// Transcribe audio using gemini-3.5-transcribe
async function transcribeAudioWithAI(base64Audio: string, mimeType: string, languageHint: string): Promise<string> {
  if (!aiClient) return '';

  let cleanMime = mimeType ? mimeType.split(';')[0].trim() : 'audio/webm';
  if (cleanMime === 'audio/x-wav') cleanMime = 'audio/wav';

  const audioPart = {
    inlineData: {
      mimeType: cleanMime,
      data: base64Audio,
    },
  };

  try {
    const prompt = `Transcribe this audio clip accurately into text. The user may be speaking in ${languageHint || 'English, Tamil, Hindi, or a mix of languages'}. Return ONLY the verbatim transcript text, with no additional commentary.`;
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, { text: prompt }],
      },
    });

    return response.text?.trim() || '';
  } catch (err: any) {
    // If transcribe has rate limits or overload, try flash fallback silently
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [audioPart, { text: 'Transcribe this spoken speech accurately. Return only the transcript text.' }],
        },
      });
      return response.text?.trim() || '';
    } catch (e) {
      return '';
    }
  }
}

// Generate spoken response audio using gemini-3.8-flash-lite-tts
async function generateSpeechAudioWithAI(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  if (!aiClient) return null;

  try {
    // Truncate spoken text to avoid excessive latency (max 400 characters for conversational audio)
    const spokenText = text.slice(0, 400);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: spokenText,
              speechMetadata: {
                style: 'Clear, encouraging, intelligent professional career mentor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err: any) {
    // Graceful silent fallback to client-side Web Speech synthesis on 429 quota exhaustion or 503
    return null;
  }
}

// Generate smart career advice if external models are busy
function generateLocalCareerGuidance(userQuery: string, language: string, context: { targetRole: string; score: number; gaps: string[] }): string {
  const q = userQuery.toLowerCase();
  const gapsStr = context.gaps.slice(0, 3).join(', ') || 'TypeScript, Node.js';

  if (language === 'ta') {
    if (q.includes('skill') || q.includes('gap') || q.includes('படிக்க') || q.includes('முக்கியம்')) {
      return `உங்கள் Profile-க்கு ${context.targetRole} ரோலுக்கு முக்கியமான gaps ${gapsStr} ஆகும். உங்கள் Roadmap-ல் Week 1-ஐ முடித்து, Real-Time Project ஒன்றை உடனே build பண்ணுங்கள்!`;
    }
    if (q.includes('interview') || q.includes('கேள்வி')) {
      return `Technical Interview-ல் உங்களிடம் React State Management, REST vs GraphQL, மற்றும் Database Indexing பற்றி அதிகம் கேட்பார்கள். Star Method பயன்படுத்தி project அனுபவத்தை விளக்குங்கள்!`;
    }
    return `உங்களுடைய Profile Readiness Score ${context.score}% ஆக உள்ளது. ${gapsStr} skills-ஐ complete செய்தால் உங்கள் score 90%+ உயர்ந்து Interview வாய்ப்புகள் அதிகரிக்கும்!`;
  }

  if (language === 'hi') {
    if (q.includes('skill') || q.includes('gap') || q.includes('सीख')) {
      return `आपकी प्रोफाइल के लिए सबसे जरूरी स्किल्स ${gapsStr} हैं। अपने रोडमैप का वीक 1 पूरा करें और एक प्रैक्टिकल प्रोजेक्ट बनाएं!`;
    }
    return `आपका जॉब रेडीनेस स्कोर ${context.score}% है। ${gapsStr} को बेहतर बनाकर आप आसानी से ${context.targetRole} के इंटरव्यू क्लियर कर सकते हैं!`;
  }

  // English fallback
  if (q.includes('interview')) {
    return `For ${context.targetRole}, expect core questions around system design, RESTful APIs, and your project architecture. Focus on answering with the STAR method and mentioning measurable outcomes.`;
  }
  if (q.includes('gap') || q.includes('learn') || q.includes('skill')) {
    return `Your top priority skill gaps are ${gapsStr}. Tackling these in Week 1 and 2 will boost your alignment score past 90% for ${context.targetRole}.`;
  }
  return `Your current alignment for ${context.targetRole} is ${context.score}%. Closing gaps in ${gapsStr} with practical portfolio projects is your fastest path to interviews!`;
}

// POST /api/voice/interact (Multi-language Voice Assistant Pipeline)
voiceRouter.post('/interact', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user-1';
    const resume = db.getResume(userId);
    const analysis = db.getLatestAnalysis(userId) || db.getAnalysis('demo-analysis-1');

    const { audio, mimeType, text, language = 'en', voice = 'Kore' } = req.body;

    let userQuery = (text || '').trim();

    // If audio is provided, transcribe with Gemini 3.5 Transcribe
    if (audio && audio.length > 50) {
      const langHintMap: Record<string, string> = {
        ta: 'Tamil (தமிழ்) or Tanglish (Tamil-English)',
        hi: 'Hindi (हिंदी) or Hinglish',
        en: 'English',
        es: 'Spanish (Español)',
        fr: 'French (Français)',
        de: 'German (Deutsch)',
        te: 'Telugu (తెలుగు)',
      };
      const langHint = langHintMap[language] || 'English';
      const transcribed = await transcribeAudioWithAI(audio, mimeType, langHint);
      if (transcribed) {
        userQuery = transcribed;
      }
    }

    // Gracefully handle silent or un-transcribed clips without returning 400
    if (!userQuery) {
      const emptyPrompts: Record<string, string> = {
        ta: 'குரல் தெளிவாக கேட்கவில்லை. தயவுசெய்து மைக்கை அழுத்தி மீண்டும் பேசவும், அல்லது கீழே உள்ள கேள்விகளை தேர்வு செய்யவும்!',
        hi: 'आवाज साफ नहीं आई। कृपया माइक दबाकर फिर से बोलें या नीचे दिए गए सुझाव चुनें!',
        en: 'I could not detect any speech in that recording. Please speak clearly into your mic, or select a prompt below!',
      };
      return res.json({
        userTranscript: '',
        replyText: emptyPrompts[language] || emptyPrompts['en'],
        replyAudio: null,
        language,
        voice,
      });
    }

    const targetRole = analysis?.targetRole || 'Full Stack Developer';
    const score = analysis?.alignmentScore || 82;
    const gaps = analysis?.missingCriticalSkills || ['TypeScript', 'Node.js', 'PostgreSQL'];

    // Build context-aware prompt with candidate's actual profile and target role
    const candidateContext = `Candidate Info:
Name: ${resume?.name || 'Candidate'}
Target Role: ${targetRole}
Readiness Score: ${score}%
Strengths: ${analysis?.matchedSkills.slice(0, 5).join(', ') || 'React, SQL, Git'}
Critical Gaps to Close: ${gaps.join(', ')}
Current Week in Roadmap: Week 1 (${analysis?.roadmap[0]?.title || 'TypeScript Fundamentals'})
Featured Project: ${analysis?.recommendedProjects[0]?.title || 'Real-Time Job Tracker'}`;

    const languageInstructionMap: Record<string, string> = {
      ta: 'Respond warmly and professionally in Tamil (தமிழ்) or conversational Tanglish, giving practical, encouraging career guidance.',
      hi: 'Respond warmly and professionally in Hindi (हिंदी) or conversational Hinglish, giving clear, actionable career advice.',
      en: 'Respond warmly, concisely, and professionally in English as an elite technical career mentor.',
      es: 'Respond clearly and professionally in Spanish (Español) as a technical career advisor.',
      fr: 'Respond clearly and professionally in French (Français) as a technical career advisor.',
      de: 'Respond clearly and professionally in German (Deutsch) as a technical career advisor.',
      te: 'Respond clearly and professionally in Telugu (తెలుగు) as a technical career advisor.',
    };

    const langInstruction = languageInstructionMap[language] || languageInstructionMap['en'];

    const prompt = `You are the interactive AI Career Voice Coach inside the "AI Career Assistant Command Center".
${langInstruction}
Keep your answer concise (2-3 sentences max so it sounds natural and fast when spoken aloud over audio), motivating, and directly relevant to their resume and target role.

${candidateContext}

User Query: "${userQuery}"`;

    let replyText = '';

    if (aiClient) {
      // Try candidate models with graceful fallbacks
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      for (const m of candidateModels) {
        try {
          const aiResponse = await aiClient.models.generateContent({
            model: m,
            contents: prompt,
          });
          replyText = aiResponse.text?.trim() || '';
          if (replyText) break;
        } catch (e: any) {
          // Model busy or overloaded, continue to next fallback
        }
      }
    }

    // High quality deterministic career advice if external API is busy or overloaded
    if (!replyText) {
      replyText = generateLocalCareerGuidance(userQuery, language, { targetRole, score, gaps });
    }

    // Attempt Gemini TTS generation (returns null on 429 quota exhaustion so client seamlessly falls back to Web Speech)
    const replyAudio = await generateSpeechAudioWithAI(replyText, voice);

    return res.json({
      userTranscript: userQuery,
      replyText,
      replyAudio, // base64 encoded audio/wav if available, otherwise null
      language,
      voice,
    });
  } catch (err: any) {
    // Never fail with 500 in voice chat; always give a friendly conversational reply
    return res.json({
      userTranscript: req.body.text || '',
      replyText: 'I am here to guide your career path! Feel free to ask about your skill gaps, roadmap, or interview questions.',
      replyAudio: null,
      language: req.body.language || 'en',
      voice: req.body.voice || 'Kore',
    });
  }
});
