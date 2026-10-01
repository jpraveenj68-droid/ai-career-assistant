import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Send,
  X,
  Bot,
  User,
  Radio,
  Play,
  Languages,
  Loader2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioUrl?: string;
  timestamp: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', speechLang: 'en-US', samplePrompt: 'What are my top 3 skill gaps?' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳', speechLang: 'ta-IN', samplePrompt: 'என் skills-ஐ review பண்ணி சொல்லுங்க' },
  { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳', speechLang: 'hi-IN', samplePrompt: 'मुझे सबसे पहले क्या सीखना चाहिए?' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', speechLang: 'es-ES', samplePrompt: '¿Cuáles son mis brechas de habilidades?' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', speechLang: 'fr-FR', samplePrompt: 'Quelles compétences me manquent ?' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', speechLang: 'de-DE', samplePrompt: 'Welche Fähigkeiten sollte ich lernen?' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳', speechLang: 'te-IN', samplePrompt: 'నా స్కిల్ గ్యాప్స్ ఏమిటి?' },
];

const VOICES = [
  { id: 'Kore', name: 'Kore (Balanced & Warm)' },
  { id: 'Puck', name: 'Puck (Engaging & Clear)' },
  { id: 'Charon', name: 'Charon (Deep & Professional)' },
  { id: 'Zephyr', name: 'Zephyr (Smooth & Natural)' },
];

export const VoiceAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Voice Career Coach powered by Gemini 3.5 Multilingual Voice. Tap the microphone and speak in English, Tamil (தமிழ்), Hindi (हिंदी), or any language!',
      timestamp: 'Just now',
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const hasCapturedSpeechRef = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

  const stopAudioPlayback = () => {
    if (currentlyPlayingAudio) {
      try {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio.currentTime = 0;
      } catch (e) {}
      setCurrentlyPlayingAudio(null);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsPlayingAudioId(null);
  };

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      stopAudioPlayback();
    }
  }, [isOpen]);

  const cleanupRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const speakWithWebSpeech = (text: string, langCode: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langConfig = LANGUAGES.find((l) => l.code === langCode);
      utterance.lang = langConfig?.speechLang || 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setIsPlayingAudioId(msgId);

      utterance.onend = () => {
        setIsPlayingAudioId(null);
      };
      utterance.onerror = () => {
        setIsPlayingAudioId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsPlayingAudioId(null);
    }
  };

  const playBase64Audio = (base64Audio: string, msgId: string) => {
    try {
      if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const audioSrc = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioSrc);
      setCurrentlyPlayingAudio(audio);
      setIsPlayingAudioId(msgId);

      audio.play().catch(() => {
        setIsPlayingAudioId(null);
      });

      audio.onended = () => {
        setIsPlayingAudioId(null);
      };
    } catch (e) {
      setIsPlayingAudioId(null);
    }
  };

  // Setup visualizer using Web Audio API to prove mic is capturing audio
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      // Audio visualizer is optional; ignore if AudioContext not permitted
    }
  };

  const startVoiceRecording = async () => {
    stopAudioPlayback();
    setMicError(null);
    setMicPermissionDenied(false);
    setLiveTranscript('');
    hasCapturedSpeechRef.current = false;
    recordingStartTimeRef.current = Date.now();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const langObj = LANGUAGES.find((l) => l.code === selectedLanguage);
    const speechLang = langObj?.speechLang || 'en-US';

    // Attempt 1: Browser Native SpeechRecognition (Chrome, Edge, Safari)
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript;
          }
          if (accumulated.trim()) {
            hasCapturedSpeechRef.current = true;
            setLiveTranscript(accumulated);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setMicPermissionDenied(true);
            setMicError('Microphone access blocked. Click the lock/tune icon in your address bar and allow Microphone.');
          } else if (event.error !== 'no-speech') {
            console.warn('SpeechRecognition error:', event.error);
          }
          cleanupRecording();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();

        // Also start visualizer if mediaDevices is allowed
        if (navigator?.mediaDevices?.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              mediaStreamRef.current = stream;
              setupAudioVisualizer(stream);
            })
            .catch(() => {});
        }

        return;
      } catch (err) {
        console.warn('Native SpeechRecognition start error, falling back to MediaRecorder:', err);
      }
    }

    // Attempt 2: MediaRecorder fallback with Gemini 3.5 Transcribe
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicError('Microphone is not supported in this browser window. Please type your message below!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setupAudioVisualizer(stream);
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (!MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (audioBlob.size > 300) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            await sendVoicePayload({ audio: base64Data, mimeType });
          };
        } else if (!hasCapturedSpeechRef.current) {
          setMicError('Recording was very quiet or short. Speak closer to the microphone and try again!');
        }
      };

      recorder.start(250); // collect 250ms chunks continuously
      setIsRecording(true);
    } catch (err: any) {
      setMicPermissionDenied(true);
      setMicError('Microphone permission denied. Look at your browser address bar and enable microphone access.');
      cleanupRecording();
    }
  };

  const stopVoiceRecording = () => {
    const finalSpeech = liveTranscript.trim();
    cleanupRecording();

    // If native speech recognition captured words, send them immediately!
    if (finalSpeech) {
      sendVoicePayload({ text: finalSpeech });
      setLiveTranscript('');
      return;
    }

    // Otherwise if MediaRecorder is processing, onstop will dispatch
    const duration = Date.now() - recordingStartTimeRef.current;
    if (duration < 600) {
      setMicError('Recording was very short. Click the mic, speak your question, then click again when finished.');
    }
  };

  const sendVoicePayload = async (payload: { audio?: string; mimeType?: string; text?: string }) => {
    if (!payload.text && !payload.audio) return;

    setProcessing(true);
    const tempId = `turn-${Date.now()}`;

    // Show temporary user message immediately if text is known
    if (payload.text) {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${tempId}`,
          sender: 'user',
          text: payload.text!,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    try {
      const res = await api.interactVoice({
        audio: payload.audio,
        mimeType: payload.mimeType,
        text: payload.text,
        language: selectedLanguage,
        voice: selectedVoice,
      });

      // If text wasn't shown yet (because it came from audio transcribe), add it now
      if (!payload.text && res.userTranscript) {
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-${tempId}`,
            sender: 'user',
            text: res.userTranscript,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }

      // Add assistant response
      const assistantMsg: VoiceMessage = {
        id: `asst-${tempId}`,
        sender: 'assistant',
        text: res.replyText,
        audioUrl: res.replyAudio || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically play response audio (via Gemini 24kHz audio or Web Speech API fallback)
      if (res.replyAudio) {
        playBase64Audio(res.replyAudio, assistantMsg.id);
      } else if (res.replyText) {
        speakWithWebSpeech(res.replyText, selectedLanguage, assistantMsg.id);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${tempId}`,
          sender: 'assistant',
          text: 'I am here to guide your career path! Ask about your skill gaps, roadmap, or interview questions in your language.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setProcessing(false);
      setTextInput('');
      setLiveTranscript('');
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || processing) return;
    sendVoicePayload({ text: textInput.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col h-[85vh] max-h-[720px] overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Gemini 3.5 Multilingual Voice Assistant</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LIVE AUDIO
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Conversational career guidance in Tamil, Hindi, English, & 5+ languages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Stop Audio Button when Voice is Active */}
            {isPlayingAudioId && (
              <button
                type="button"
                onClick={stopAudioPlayback}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-rose-500/25 animate-pulse"
                title="Stop audio playback immediately"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                <span className="font-semibold">Stop Audio</span>
              </button>
            )}

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            {/* Voice Voice Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="text-xs hidden sm:block bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mic Permission Guidance Banner */}
        {micPermissionDenied && (
          <div className="px-4 py-3 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Microphone Blocked:</strong> Click the 🔒 lock or site icon next to your URL bar, set <strong>Microphone to Allow</strong>, then click Retry.
              </span>
            </div>
            <button
              type="button"
              onClick={startVoiceRecording}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Mic</span>
            </button>
          </div>
        )}

        {/* Mic Warning / Tip Banner */}
        {micError && !micPermissionDenied && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
            <span>{micError}</span>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="text-amber-400 hover:text-white ml-2 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Conversation Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isAsst = msg.sender === 'assistant';
            const isPlayingThis = isPlayingAudioId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isAsst ? 'justify-start' : 'justify-end'}`}
              >
                {isAsst && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                    isAsst
                      ? 'bg-slate-900/80 border border-slate-800 text-slate-100'
                      : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Audio Playback Controls for Assistant */}
                  {isAsst && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingThis) {
                            stopAudioPlayback();
                          } else if (msg.audioUrl) {
                            playBase64Audio(msg.audioUrl, msg.id);
                          } else {
                            speakWithWebSpeech(msg.text, selectedLanguage, msg.id);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1.5 transition-colors ${
                          isPlayingThis
                            ? 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 shadow-sm'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        {isPlayingThis ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-rose-400" />
                            <span className="font-semibold text-rose-300">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Listen to Answer</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.audioUrl ? 'Gemini 24kHz Audio' : 'Web Speech Voice'}
                      </span>
                    </div>
                  )}

                  <span className="text-[9px] opacity-60 block mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {!isAsst && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Live speech preview while speaking */}
          {isRecording && liveTranscript && (
            <div className="flex gap-3 text-xs justify-end">
              <div className="max-w-[80%] rounded-2xl p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 animate-pulse">
                <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-0.5">Hearing you speak:</span>
                "{liveTranscript}"
              </div>
            </div>
          )}

          {processing && (
            <div className="flex gap-3 text-xs items-center text-cyan-300 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing with Gemini 3.5 & synthesizing voice reply...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60 overflow-x-auto flex items-center gap-2 text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
          {LANGUAGES.find((l) => l.code === selectedLanguage)?.samplePrompt && (
            <button
              type="button"
              onClick={() => {
                const prompt = LANGUAGES.find((l) => l.code === selectedLanguage)?.samplePrompt;
                if (prompt) sendVoicePayload({ text: prompt });
              }}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 shrink-0 transition-colors"
            >
              "{LANGUAGES.find((l) => l.code === selectedLanguage)?.samplePrompt}"
            </button>
          )}
          <button
            type="button"
            onClick={() => sendVoicePayload({ text: 'Simulate a technical interview question for my target role' })}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 shrink-0 transition-colors"
          >
            "Mock interview question"
          </button>
          <button
            type="button"
            onClick={() => sendVoicePayload({ text: 'How do I close my skill gaps in 30 days?' })}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 shrink-0 transition-colors"
          >
            "Close skill gaps in 30 days"
          </button>
        </div>

        {/* Floating Audio Playback Controls Strip when Voice is Active */}
        {isPlayingAudioId && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-rose-950/70 via-slate-900 to-indigo-950/50 border-t border-rose-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-semibold text-rose-200">AI is speaking...</span>
            </div>
            <button
              type="button"
              onClick={stopAudioPlayback}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/30 hover:scale-105"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Audio</span>
            </button>
          </div>
        )}

        {/* Audio Controls & Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Record Voice Button */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={processing}
              className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.7)] ring-4 ring-rose-500/40'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105'
              } disabled:opacity-50`}
              title={isRecording ? 'Click to stop and send' : 'Click to speak'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Live Audio Visualizer / Status when recording */}
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <strong>
                    Listening in {LANGUAGES.find((l) => l.code === selectedLanguage)?.name}...
                  </strong>
                  {/* Real-time frequency bars */}
                  <div className="flex items-center gap-0.5 ml-2 h-4">
                    {[1, 2, 3, 4, 5].map((bar) => {
                      const h = Math.max(4, (audioLevel * (bar * 0.25)) % 16);
                      return (
                        <span
                          key={bar}
                          className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 transition-colors"
                >
                  Done Speaking
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Speak with mic, or type in ${LANGUAGES.find((l) => l.code === selectedLanguage)?.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || processing}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
