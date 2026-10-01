import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mic,
  Compass,
  FileText,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  Moon,
  Sun,
  Send,
  Loader2,
  Heart,
  Smile,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Power,
  Gamepad2,
  Navigation,
  MousePointer,
  Anchor,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  RotateCw,
  Activity,
} from 'lucide-react';

interface CuteRoamingBotProps {
  onOpenVoiceAssistant: () => void;
}

interface BotChatMessage {
  id: string;
  sender: 'user' | 'subramani';
  text: string;
  timestamp: string;
}

const CUTE_TIPS = [
  { text: "வணக்கம்! நான் Subramani! Resume skills review பண்ணனுமா?", icon: "📄", action: "/resume" },
  { text: "Hey! I am Subramani. Your Week 1 roadmap is ready! Let's build momentum.", icon: "🚀", action: "/roadmap" },
  { text: "Adding real-time projects can boost your job fit score by 15%!", icon: "💡", action: "/projects" },
  { text: "Practice mock interview questions with me in Tamil or English!", icon: "🎙️", voice: true },
  { text: "Closing TypeScript & Node.js will unlock 40+ job openings for you!", icon: "🎯", action: "/skill-gap" },
  { text: "Drink some water and keep coding, you're doing amazing! ✨", icon: "💧" },
];

const QUICK_PROMPTS = [
  { label: '🎯 Mock Interview கேள்வி கேளு', prompt: 'சுப்பிரமணி, ஒரு Technical Mock Interview கேள்வி கேட்டு, நான் சொல்லும் பதிலுக்கு feedback கொடு!' },
  { label: '📄 Resume Tip சொல்லு', prompt: 'சுப்பிரமணி, என் Resume இன்னும் strong ஆக என்ன 2 முக்கியமான விஷயங்கள் சேர்க்கணும்?' },
  { label: '🚀 இன்னைக்கு என்ன படிக்கலாம்?', prompt: 'சுப்பிரமணி, Full Stack Developer ஆக இன்னைக்கு நான் எதை focus பண்ணி படிக்கலாம்?' },
  { label: '😄 ஒரு Tech Joke சொல்லு!', prompt: 'சுப்பிரமணி, ஒரு நல்ல Tech அல்லது Coding joke சொல்லு, சிரிக்கலாம்!' },
];

// Cute web-audio bleep/chime
function playCuteChime(type: 'chirp' | 'happy' | 'think' | 'pop') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'happy') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.22); // D6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'chirp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.09);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    }
  } catch (e) {
    // Audio optional; ignore if not permitted
  }
}

export const CuteRoamingBot: React.FC<CuteRoamingBotProps> = ({ onOpenVoiceAssistant }) => {
  const navigate = useNavigate();
  const { setSubramaniBotEnabled } = useAuth();

  // Position state (screen coordinates)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [controlMode, setControlMode] = useState<'auto' | 'manual' | 'follow' | 'park'>('park');
  const [showController, setShowController] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [isManualMoving, setIsManualMoving] = useState(false);
  const [isRoaming, setIsRoaming] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [eyeExpression, setEyeExpression] = useState<'happy' | 'blink' | 'wink' | 'curious' | 'sleep' | 'hearts'>('happy');
  const [tipIndex, setTipIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [isGliding, setIsGliding] = useState(false);

  // Direct Interaction & Chat state
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<BotChatMessage[]>([
    {
      id: 'welcome',
      sender: 'subramani',
      text: 'வணக்கம்! நான் சுப்பிரமணி (Subramani) 🤖✨ உங்கள் AI Career Buddy! Resume tips, Mock Interview, Coding doubts... எதுவானாலும் என்கிட்ட கேளுங்க, நான் ரெடி!',
      timestamp: 'just now',
    },
  ]);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialBotX: 0, initialBotY: 0 });
  const roamTimerRef = useRef<any>(null);
  const eyeTimerRef = useRef<any>(null);
  const bubbleTimerRef = useRef<any>(null);
  const tiltTimerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Reset Subramani to safe home base (bottom right)
  const resetToHome = useCallback(() => {
    if (typeof window === 'undefined') return;
    const homeX = Math.max(20, window.innerWidth - 120);
    const homeY = Math.max(120, window.innerHeight - 170);
    setPos({ x: homeX, y: homeY });
    setControlMode('park');
    setIsRoaming(false);
    setTilt(0);
    setIsGliding(false);
    setIsManualMoving(false);
  }, []);

  // Initialize position to bottom right, safely below upper frame
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initX = Math.max(20, window.innerWidth - 120);
      const initY = Math.max(120, window.innerHeight - 170);
      setPos({ x: initX, y: initY });
      setIsInitialized(true);
    }
  }, []);

  // Eye animation loop (blink, wink, look around)
  useEffect(() => {
    if (isSleeping) {
      setEyeExpression('sleep');
      return;
    }
    if (eyeExpression === 'hearts' || isLoadingReply) return;

    const triggerRandomExpression = () => {
      const rand = Math.random();
      if (rand < 0.5) {
        setEyeExpression('blink');
        setTimeout(() => setEyeExpression('happy'), 250);
      } else if (rand < 0.75) {
        setEyeExpression('curious');
        setTimeout(() => setEyeExpression('happy'), 1200);
      } else {
        setEyeExpression('wink');
        setTimeout(() => setEyeExpression('happy'), 600);
      }
      eyeTimerRef.current = setTimeout(triggerRandomExpression, 3500 + Math.random() * 4000);
    };

    eyeTimerRef.current = setTimeout(triggerRandomExpression, 3000);
    return () => clearTimeout(eyeTimerRef.current);
  }, [isSleeping, eyeExpression, isLoadingReply]);

  // Periodic Cute Speech Bubble Popup when closed
  useEffect(() => {
    const showRandomTip = () => {
      if (!isOpenChat && !isSleeping && !isDragging) {
        setTipIndex((prev) => (prev + 1) % CUTE_TIPS.length);
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 5500);
      }
      bubbleTimerRef.current = setTimeout(showRandomTip, 14000 + Math.random() * 8000);
    };

    bubbleTimerRef.current = setTimeout(showRandomTip, 6000);
    return () => clearTimeout(bubbleTimerRef.current);
  }, [isOpenChat, isSleeping, isDragging]);

  // Smooth Free Roaming (Only when explicitly enabled by user)
  useEffect(() => {
    if (controlMode !== 'auto' || !isRoaming || isSleeping || isDragging || isOpenChat) {
      if (controlMode !== 'follow' && !isManualMoving) {
        setTilt(0);
        setIsGliding(false);
      }
      return;
    }

    const moveBotToNextSpot = () => {
      if (typeof window === 'undefined') return;

      // Safe boundaries: stay cleanly below upper frame (minY = 130)
      const minX = 30;
      const maxX = Math.max(minX, window.innerWidth - 100);
      const minY = 130;
      const maxY = Math.max(minY, window.innerHeight - 160);

      const currentX = pos.x;
      const currentY = pos.y;

      let nextX: number;
      let nextY: number;

      // 60% chance to gently cruise, 40% local hover
      if (Math.random() < 0.6) {
        nextX = Math.round(minX + Math.random() * (maxX - minX));
        nextY = Math.round(minY + Math.random() * (maxY - minY));
      } else {
        const deltaX = (Math.random() - 0.5) * 350;
        const deltaY = (Math.random() - 0.5) * 200;
        nextX = Math.round(Math.min(maxX, Math.max(minX, currentX + deltaX)));
        nextY = Math.round(Math.min(maxY, Math.max(minY, currentY + deltaY)));
      }

      // Dynamic flight banking tilt based on direction
      const dx = nextX - currentX;
      if (dx > 35) {
        setTilt(12);
      } else if (dx < -35) {
        setTilt(-12);
      } else {
        setTilt(0);
      }

      setIsGliding(true);
      setPos({ x: nextX, y: nextY });

      setTimeout(() => {
        setTilt(0);
        setIsGliding(false);
      }, 2600);

      roamTimerRef.current = setTimeout(moveBotToNextSpot, 5000 + Math.random() * 3000);
    };

    roamTimerRef.current = setTimeout(moveBotToNextSpot, 2000);
    return () => clearTimeout(roamTimerRef.current);
  }, [controlMode, isRoaming, isSleeping, isDragging, isOpenChat, pos.x, pos.y, isManualMoving]);

  // Manual Flight Movement (D-Pad & Keyboard Controls)
  const moveManual = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (isSleeping) {
        setIsSleeping(false);
      }
      setControlMode('manual');
      setIsRoaming(false);
      setIsManualMoving(true);

      const step = isTurbo ? 75 : 45;
      const minX = 20;
      const maxX = Math.max(minX, window.innerWidth - 90);
      const minY = 120; // Safe distance below upper frame
      const maxY = Math.max(minY, window.innerHeight - 150);

      setPos((prev) => {
        let nextX = prev.x;
        let nextY = prev.y;

        if (dir === 'up') {
          nextY = Math.max(minY, prev.y - step);
          setTilt(0);
        } else if (dir === 'down') {
          nextY = Math.min(maxY, prev.y + step);
          setTilt(0);
        } else if (dir === 'left') {
          nextX = Math.max(minX, prev.x - step);
          setTilt(-18);
        } else if (dir === 'right') {
          nextX = Math.min(maxX, prev.x + step);
          setTilt(18);
        }

        return { x: nextX, y: nextY };
      });

      if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current);
      tiltTimerRef.current = setTimeout(() => {
        setTilt(0);
        setIsManualMoving(false);
      }, 250);
    },
    [isTurbo, isSleeping]
  );

  // Stunt Animations & Tricks
  const performStunt = (type: 'flip' | 'dance' | 'heart' | 'sleep') => {
    if (type === 'flip') {
      playCuteChime('pop');
      setSpinDeg((prev) => prev + 360);
      setEyeExpression('wink');
      setTimeout(() => setEyeExpression('happy'), 1000);
    } else if (type === 'dance') {
      playCuteChime('happy');
      setIsDancing(true);
      setEyeExpression('happy');
      setTimeout(() => setIsDancing(false), 2200);
    } else if (type === 'heart') {
      playCuteChime('happy');
      setEyeExpression('hearts');
      setTimeout(() => setEyeExpression('happy'), 2500);
    } else if (type === 'sleep') {
      setIsSleeping((prev) => !prev);
      setEyeExpression(isSleeping ? 'happy' : 'sleep');
      playCuteChime('pop');
    }
  };

  // Keyboard Controller (Arrow keys & WASD to fly)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      let handled = false;

      if (key === 'arrowup' || key === 'w') {
        moveManual('up');
        handled = true;
      } else if (key === 'arrowdown' || key === 's') {
        moveManual('down');
        handled = true;
      } else if (key === 'arrowleft' || key === 'a') {
        moveManual('left');
        handled = true;
      } else if (key === 'arrowright' || key === 'd') {
        moveManual('right');
        handled = true;
      } else if (key === ' ' && !isOpenChat) {
        // Spacebar stunt 360° flip
        performStunt('flip');
        handled = true;
      }

      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveManual, isOpenChat, isSleeping]);

  // Follow Mouse Mode
  useEffect(() => {
    if (controlMode !== 'follow' || isSleeping || isDragging || isOpenChat) return;

    let animId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        const targetX = Math.max(20, Math.min(window.innerWidth - 90, e.clientX + 35));
        const targetY = Math.max(120, Math.min(window.innerHeight - 150, e.clientY - 40));

        setPos((prev) => {
          const dx = targetX - prev.x;
          if (dx > 20) setTilt(12);
          else if (dx < -20) setTilt(-12);
          else setTilt(0);

          return { x: targetX, y: targetY };
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [controlMode, isSleeping, isDragging, isOpenChat]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isLoadingReply]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialBotX: pos.x,
      initialBotY: pos.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      initialBotX: pos.x,
      initialBotY: pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPos({
        x: Math.max(20, Math.min(window.innerWidth - 90, dragStartRef.current.initialBotX + dx)),
        y: Math.max(120, Math.min(window.innerHeight - 150, dragStartRef.current.initialBotY + dy)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;
      setPos({
        x: Math.max(20, Math.min(window.innerWidth - 90, dragStartRef.current.initialBotX + dx)),
        y: Math.max(120, Math.min(window.innerHeight - 150, dragStartRef.current.initialBotY + dy)),
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Click on Bot: toggle chat, or multiple clicks trigger happy heart reaction
  const handleBotClick = () => {
    if (isDragging) return;

    playCuteChime('pop');
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // If clicked quickly 3 times, show hearts & love reaction!
    if (newCount >= 3) {
      setEyeExpression('hearts');
      playCuteChime('happy');
      setTimeout(() => {
        setEyeExpression('happy');
        setClickCount(0);
      }, 2000);
    }

    if (!isOpenChat) {
      setIsOpenChat(true);
      setShowBubble(false);
      playCuteChime('chirp');
    }
  };

  // Speak aloud via SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean emojis and symbols for speech
    const clean = text.replace(/[*#_~`•🛸🤖✨🚀📄💡🎯☕]/g, ' ').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    // Detect if Tamil script is present
    const hasTamil = /[\u0B80-\u0BFF]/.test(clean);
    utterance.lang = hasTamil ? 'ta-IN' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.15; // slightly higher friendly pitch for cute bot!

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Send message to Subramani
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoadingReply) return;

    stopSpeaking();
    playCuteChime('chirp');

    const userMsg: BotChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoadingReply(true);
    setEyeExpression('curious');

    try {
      // Detect language
      const isTamil = /[\u0B80-\u0BFF]/.test(textToSend) || textToSend.toLowerCase().includes('subramani') || textToSend.toLowerCase().includes('solu');
      const lang = isTamil ? 'ta' : 'en';

      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: textToSend,
          language: lang,
          context: {
            customPersona: 'You are Subramani (சுப்பிரமணி), a friendly, energetic, cute AI Career Companion in Mike Career Assistant. You speak warmly in Tamil, conversational Tanglish, and English with practical tips, encouraging vibes, and clear answers.',
          },
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.replyText;
      }

      if (!reply) {
        // Fallback witty Subramani replies
        if (textToSend.toLowerCase().includes('mock') || textToSend.includes('கேள்வி')) {
          reply = 'சூப்பர்! இதோ முதல் கேள்வி: "React-ல் useEffect எதற்கு பயன்படுகிறது மற்றும் அதன் Dependency Array எப்படி வேலை செய்கிறது?" யோசிச்சு பதில் சொல்லுங்க!';
        } else if (textToSend.toLowerCase().includes('resume') || textToSend.includes('skills')) {
          reply = 'Resume-ல் முக்கியமானது: 1. நீங்கள் பயன்படுத்திய தொழில்நுட்பங்கள் (React, TypeScript), 2. Measurable Results ("Improved performance by 30%")! இதை சேர்த்தால் shortlist ஆவது உறுதி!';
        } else if (textToSend.toLowerCase().includes('joke') || textToSend.includes('சிரிக்க')) {
          reply = '😄 "ப்ரோக்ராமர்களுக்கு ஏன் இருட்டு பிடிக்கும் தெரியுமா? ஏன்னா Light-ல Bugs அதிகம் வரும்!" ஹா ஹா! நல்லா இருக்கா?';
        } else {
          reply = 'அருமை! இதை நாம் சுலபமாக கத்துக்கலாம். Mike Career Assistant Roadmap-ஐ தொடர்ந்து follow பண்ணுங்க, வெற்றி நிச்சயம்!';
        }
      }

      const botMsg: BotChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'subramani',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
      setEyeExpression('happy');
      playCuteChime('happy');

      if (autoSpeak) {
        speakText(reply);
      }
    } catch (err) {
      const errorMsg: BotChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'subramani',
        text: 'சின்ன connection issue ப்ரோ! மீண்டும் ஒருமுறை கேளுங்க, நான் ரெடி!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      setEyeExpression('blink');
    } finally {
      setIsLoadingReply(false);
    }
  };

  // Voice Mic input for Subramani
  const toggleMicListening = () => {
    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'ta-IN'; // Default Tamil; supports English accents too
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningMic(true);
        playCuteChime('chirp');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch (e) {
      setIsListeningMic(false);
    }
  };

  if (!isInitialized) return null;

  // Safe coordinates: NEVER allow Subramani to enter the upper frame or outside screen
  const safeX = typeof window !== 'undefined'
    ? Math.max(20, Math.min(window.innerWidth - 90, pos.x || window.innerWidth - 120))
    : 0;
  const safeY = typeof window !== 'undefined'
    ? Math.max(120, Math.min(window.innerHeight - 150, pos.y || window.innerHeight - 170))
    : 0;

  // Determine if popup should open downward (if Subramani is in top half of screen)
  const isUpperHalf = safeY < 480;
  const isFarRight = typeof window !== 'undefined' && safeX > window.innerWidth - 380;
  const isFarLeft = safeX < 140;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: `${safeX}px`,
          top: `${safeY}px`,
          zIndex: 50,
          transition: isDragging
            ? 'none'
            : controlMode === 'manual' || isManualMoving
            ? 'left 0.12s ease-out, top 0.12s ease-out, transform 0.25s ease-out'
            : controlMode === 'follow'
            ? 'left 0.15s ease-out, top 0.15s ease-out, transform 0.25s ease-out'
            : controlMode === 'auto' && isRoaming && !isOpenChat
            ? 'left 3s cubic-bezier(0.34, 1.15, 0.64, 1), top 3s cubic-bezier(0.34, 1.15, 0.64, 1), transform 0.4s ease-out'
            : 'left 0.25s ease-out, top 0.25s ease-out',
          transform: `rotate(${tilt + spinDeg}deg) ${isDancing ? 'translateY(-6px)' : ''}`,
        }}
        className="select-none"
      >
        {/* FULL INTERACTIVE CHAT PANEL WITH SUBRAMANI */}
        {isOpenChat && (
          <div
            className={`absolute ${
              isUpperHalf ? 'top-full mt-3' : 'bottom-full mb-3'
            } ${
              isFarRight
                ? 'right-0'
                : isFarLeft
                ? 'left-0'
                : '-left-20 sm:-left-36'
            } w-80 sm:w-96 bg-slate-950/95 border border-cyan-500/40 rounded-3xl p-3.5 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-2xl text-xs text-slate-100 transition-all z-50 flex flex-col h-[420px] ring-1 ring-cyan-500/30 animate-in fade-in zoom-in-95`}
          >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 block" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  Subramani (சுப்பிரமணி)
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[10px] text-cyan-400 font-mono">
                  {isSpeaking ? 'Speaking... 🔊' : isLoadingReply ? 'Thinking... 🤔' : 'Your Live AI Buddy'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Flight Pilot Gamepad Toggle */}
              <button
                type="button"
                onClick={() => setShowController((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow-sm ${
                  showController
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Open Subramani Flight Controller (D-Pad & Keyboard Remote)"
              >
                <Gamepad2 className="w-3 h-3 text-amber-400" />
                <span>Pilot 🎮</span>
              </button>

              {/* Full Voice Assistant Link */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpenChat(false);
                  onOpenVoiceAssistant();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-[10px] shadow-sm shadow-cyan-500/25 transition-all hover:scale-105 shrink-0"
                title="Open Subramani Full Voice Assistant"
              >
                <Mic className="w-3 h-3 animate-pulse" />
                <span>Voice Coach</span>
              </button>

              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setAutoSpeak(!autoSpeak);
                }}
                className={`p-1.5 rounded-lg border text-[10px] transition-colors ${
                  autoSpeak
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={autoSpeak ? 'Auto-voice ON' : 'Auto-voice OFF'}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Roaming Toggle */}
              <button
                type="button"
                onClick={() => setIsRoaming(!isRoaming)}
                className={`p-1.5 rounded-lg border text-[10px] transition-colors ${
                  isRoaming
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isRoaming ? 'Roaming ON (click to park)' : 'Parked (click to roam)'}
              >
                {isRoaming ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Power OFF Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpenChat(false);
                  setSubramaniBotEnabled(false);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Turn Subramani OFF"
              >
                <Power className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpenChat(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoadingReply}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-cyan-300 font-medium transition-all shrink-0 hover:scale-105"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-[11px] scrollbar-thin scrollbar-thumb-slate-800"
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 border border-cyan-500/20 text-slate-200 rounded-bl-xs shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 px-1 text-[9px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'subramani' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="hover:text-cyan-400 transition-colors"
                      title="Speak aloud"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoadingReply && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 max-w-[80%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="text-[11px]">சுப்பிரமணி யோசிக்கிறார்...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center gap-1.5">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask Subramani in Tamil or English..."
              disabled={isLoadingReply}
              className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleMicListening}
              className={`p-2 rounded-xl border transition-all ${
                isListeningMic
                  ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
              title="Speak to Subramani"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoadingReply}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speech Bubble Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950" />
        </div>
      )}

      {/* MINIMIZED FLOATING BUBBLE (Periodic Tips) */}
      {!isOpenChat && (showBubble || isHovered) && (
        <div
          className={`absolute ${
            isUpperHalf ? 'top-full mt-3' : 'bottom-full mb-3'
          } ${
            isFarRight
              ? 'right-0'
              : isFarLeft
              ? 'left-0'
              : '-left-16 sm:-left-20'
          } w-64 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl text-xs text-slate-100 transition-all z-50 animate-in fade-in slide-in-from-bottom-2`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-[11px] text-cyan-300 flex items-center gap-1">
              Subramani (சுப்பிரமணி)
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[9px] text-slate-400 font-mono ml-auto">
              {controlMode === 'auto' ? 'Roaming 🛸' : controlMode === 'follow' ? 'Following 🧲' : 'Parked ⚓'}
            </span>
          </div>

          {/* Content */}
          <p className="text-[12px] leading-relaxed text-slate-200 mb-2 flex items-start gap-1.5">
            <span className="text-base leading-none">{CUTE_TIPS[tipIndex].icon}</span>
            <span>{CUTE_TIPS[tipIndex].text}</span>
          </p>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleBotClick}
              className="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-[10px] text-center shadow-sm cursor-pointer"
            >
              பேசுவோம் (Chat) 💬
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBubble(false);
                onOpenVoiceAssistant();
              }}
              className="py-1 px-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
              title="Open Subramani Voice Coach"
            >
              <Mic className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Voice 🎙️</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBubble(false);
                setShowController((prev) => !prev);
              }}
              className="py-1 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
              title="Open Subramani Flight Controller"
            >
              <Gamepad2 className="w-3 h-3 text-amber-400" />
              <span>Pilot 🎮</span>
            </button>
            <button
              type="button"
              onClick={() => setTipIndex((prev) => (prev + 1) % CUTE_TIPS.length)}
              className="py-1 px-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] cursor-pointer"
              title="Next Tip"
            >
              Next 🎲
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBubble(false);
                setSubramaniBotEnabled(false);
              }}
              className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[10px] transition-colors cursor-pointer"
              title="Turn Subramani OFF"
            >
              <Power className="w-3 h-3" />
            </button>
          </div>

          {/* Speech Bubble Arrow */}
          <div
            className={`absolute ${
              isUpperHalf
                ? 'bottom-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-slate-950'
                : 'top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-slate-950'
            } w-0 h-0`}
          />
        </div>
      )}

      {/* CUTE FLOATING SUBRAMANI ROBOT CHARACTER */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleBotClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110"
        title="வணக்கம்! நான் Subramani! Drag me anywhere or click to chat with me!"
      >
        {/* Floating Mini Action Badges (Pilot & Home) */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowController(!showController);
            }}
            className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer ${
              showController
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30 scale-105'
                : 'bg-slate-900/95 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
            }`}
            title="Open Subramani Flight Controller"
          >
            <Gamepad2 className="w-2.5 h-2.5 text-amber-400" />
            <span>Pilot 🎮</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetToHome();
            }}
            className="px-1.5 py-0.5 rounded-full border border-slate-700 bg-slate-900/95 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-[9px] font-bold flex items-center gap-0.5 shadow-md transition-all cursor-pointer"
            title="Reset Subramani to Home Base (Safe bottom right)"
          >
            <span>🏠</span>
          </button>
        </div>

        {/* Antenna with Pulsing Beacon */}
        <div className="flex flex-col items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isSleeping
                ? 'bg-slate-600'
                : isSpeaking
                ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-ping'
                : 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse'
            }`}
          />
          <div className="w-0.5 h-2 bg-slate-500" />
        </div>

        {/* Head / Body Chassis */}
        <div className="relative w-16 h-14 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center p-1.5 backdrop-blur-md overflow-hidden">
          {/* Cute Visor Glass Screen */}
          <div className="w-full h-full rounded-xl bg-[#050811] border border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
            {/* Visor Scanline shimmer */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Expressive LED Eyes */}
            <div className="flex items-center gap-2.5 z-10">
              {/* Left Eye */}
              {isSleeping || eyeExpression === 'sleep' ? (
                <div className="w-2.5 h-0.5 bg-indigo-400/80 rounded-full" />
              ) : eyeExpression === 'hearts' ? (
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-bounce" />
              ) : eyeExpression === 'blink' ? (
                <div className="w-3 h-0.5 bg-cyan-400 rounded-full" />
              ) : eyeExpression === 'wink' ? (
                <div className="w-3 h-0.5 bg-cyan-400 rounded-full" />
              ) : eyeExpression === 'curious' ? (
                <div className="w-2.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              ) : (
                <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)] flex items-center justify-center">
                  <span className="w-1 h-1 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                </div>
              )}

              {/* Right Eye */}
              {isSleeping || eyeExpression === 'sleep' ? (
                <div className="w-2.5 h-0.5 bg-indigo-400/80 rounded-full" />
              ) : eyeExpression === 'hearts' ? (
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-bounce" />
              ) : eyeExpression === 'blink' ? (
                <div className="w-3 h-0.5 bg-cyan-400 rounded-full" />
              ) : eyeExpression === 'curious' ? (
                <div className="w-3 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              ) : (
                <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)] flex items-center justify-center">
                  <span className="w-1 h-1 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                </div>
              )}
            </div>

            {/* Speaking / Audio Equalizer in mouth position */}
            {isSpeaking && (
              <div className="absolute bottom-1 flex items-center gap-0.5 h-1.5 z-10">
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1 bg-emerald-400 rounded-full animate-pulse delay-150" />
              </div>
            )}

            {/* Cute Cheek Blushes */}
            {!isSleeping && (
              <>
                <span className="absolute bottom-1 left-1.5 w-1.5 h-1 bg-rose-400/50 rounded-full blur-[0.5px]" />
                <span className="absolute bottom-1 right-1.5 w-1.5 h-1 bg-rose-400/50 rounded-full blur-[0.5px]" />
              </>
            )}
          </div>
        </div>

        {/* Floating Thruster / Hover Light */}
        <div className="flex justify-center -mt-0.5">
          <div
            className={`transition-all duration-300 ${
              isSleeping
                ? 'w-3 h-1 bg-slate-700/40 rounded-full'
                : isGliding
                ? 'w-7 h-2 bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400 shadow-[0_0_20px_rgba(6,182,212,1)] rounded-full animate-pulse'
                : 'w-4 h-1.5 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] rounded-full animate-ping opacity-75'
            }`}
          />
        </div>

        {/* Hover Mini Hint */}
        {isHovered && !isOpenChat && !showBubble && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[9px] text-cyan-300 font-mono whitespace-nowrap shadow-md pointer-events-none">
            Click to Chat with Subramani! 🤖
          </div>
        )}
      </div>
    </div>

    {/* SUBRAMANI PILOT & FLIGHT REMOTE CONTROLLER */}
    {showController && (
      <div className="fixed bottom-20 md:bottom-8 left-4 md:left-8 z-50 w-72 sm:w-80 bg-slate-950/95 border border-cyan-500/40 rounded-3xl p-4 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-2xl text-xs text-slate-100 ring-1 ring-cyan-500/30 animate-in fade-in zoom-in-95 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                Subramani Flight Pilot
              </h4>
              <p className="text-[10px] text-cyan-400 font-mono">
                {controlMode === 'auto'
                  ? 'Auto Roaming 🛸'
                  : controlMode === 'manual'
                  ? 'Manual Pilot 🎮'
                  : controlMode === 'follow'
                  ? 'Following Cursor 🧲'
                  : 'Parked / Hover ⚓'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowController(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Close Controller"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Row */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/90 rounded-xl mb-3 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setControlMode('park');
              setIsRoaming(false);
              setTilt(0);
            }}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              controlMode === 'park'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Parked / Hover in place"
          >
            <span>⚓</span>
            <span>Park</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('manual');
              setIsRoaming(false);
            }}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              controlMode === 'manual'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Manual flight control via D-Pad or Arrow keys"
          >
            <span>🎮</span>
            <span>Pilot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('follow');
              setIsRoaming(false);
            }}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              controlMode === 'follow'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Follows your mouse cursor across the screen"
          >
            <span>🧲</span>
            <span>Follow</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('auto');
              setIsRoaming(true);
            }}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              controlMode === 'auto'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Autonomous roaming across the screen"
          >
            <span>🛸</span>
            <span>Auto</span>
          </button>

          <button
            type="button"
            onClick={resetToHome}
            className="py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
            title="Reset Subramani to Home Base"
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
        </div>

        {/* D-PAD DIRECTIONAL CONTROLS */}
        <div className="flex flex-col items-center justify-center my-2">
          {/* UP */}
          <button
            type="button"
            onClick={() => moveManual('up')}
            className="w-11 h-10 rounded-xl bg-slate-900 hover:bg-cyan-500/20 active:bg-cyan-500 active:text-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md active:scale-95 transition-all mb-1 cursor-pointer"
            title="Fly Up (or Up Arrow / W)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* LEFT - CENTER - RIGHT */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveManual('left')}
              className="w-11 h-10 rounded-xl bg-slate-900 hover:bg-cyan-500/20 active:bg-cyan-500 active:text-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              title="Fly Left (or Left Arrow / A)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* CENTER: TURBO BOOST */}
            <button
              type="button"
              onClick={() => setIsTurbo(!isTurbo)}
              className={`w-11 h-10 rounded-xl border flex flex-col items-center justify-center text-[9px] font-bold active:scale-95 transition-all cursor-pointer ${
                isTurbo
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-amber-300'
              }`}
              title={isTurbo ? 'Turbo Speed 2x ACTIVE (Click for 1x)' : 'Toggle Turbo Speed (2x)'}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isTurbo ? 'TURBO' : 'NORM'}</span>
            </button>

            <button
              type="button"
              onClick={() => moveManual('right')}
              className="w-11 h-10 rounded-xl bg-slate-900 hover:bg-cyan-500/20 active:bg-cyan-500 active:text-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              title="Fly Right (or Right Arrow / D)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* DOWN */}
          <button
            type="button"
            onClick={() => moveManual('down')}
            className="w-11 h-10 rounded-xl bg-slate-900 hover:bg-cyan-500/20 active:bg-cyan-500 active:text-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md active:scale-95 transition-all mt-1 cursor-pointer"
            title="Fly Down (or Down Arrow / S)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* TRICKS & STUNTS BAR */}
        <div className="pt-2 mt-2 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 block">
            Tricks & Actions:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => performStunt('flip')}
              className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-indigo-300 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              title="Do a 360° Barrel Roll"
            >
              <RotateCw className="w-3 h-3" />
              <span>360° Flip</span>
            </button>

            <button
              type="button"
              onClick={() => performStunt('dance')}
              className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-fuchsia-500/20 border border-slate-800 hover:border-fuchsia-500/40 text-[10px] text-fuchsia-300 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              title="Do a Joy Dance"
            >
              <span>💃</span>
              <span>Dance</span>
            </button>

            <button
              type="button"
              onClick={() => performStunt('heart')}
              className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-[10px] text-rose-300 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              title="Show Love & Heart Eyes"
            >
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Hearts</span>
            </button>

            <button
              type="button"
              onClick={() => performStunt('sleep')}
              className={`py-1 px-1 rounded-lg border text-[10px] flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                isSleeping
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={isSleeping ? 'Wake Up Subramani' : 'Put Subramani to Sleep'}
            >
              <span>{isSleeping ? '☀️' : '😴'}</span>
              <span>{isSleeping ? 'Wake' : 'Sleep'}</span>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-2.5 pt-2 border-t border-slate-900 text-[9px] text-slate-400 font-mono flex items-center justify-between">
          <span>⌨️ Keys: ⬆️⬇️⬅️➡️ / WASD • Space: Flip</span>
          <span className="text-cyan-400 font-semibold">{isTurbo ? '⚡ Turbo' : 'Normal'}</span>
        </div>
      </div>
    )}
  </>
  );
};
