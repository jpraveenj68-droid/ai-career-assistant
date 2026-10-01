import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AnalysisRecord } from '../types';
import { api, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeAnalysis: AnalysisRecord | null;
  setActiveAnalysis: (analysis: AnalysisRecord | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; education?: string; graduationYear?: string; preferredRole?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  aiProvider: string;
  voiceAssistantOpen: boolean;
  setVoiceAssistantOpen: (open: boolean) => void;
  subramaniBotEnabled: boolean;
  setSubramaniBotEnabled: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisRecord | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('Local NLP Engine');
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [subramaniBotEnabled, setSubramaniBotEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('subramani_bot_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const setSubramaniBotEnabled = (enabled: boolean) => {
    setSubramaniBotEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subramani_bot_enabled', String(enabled));
    }
  };

  const refreshUser = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (err) {
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check health & ai status
    api.getHealth()
      .then((res) => {
        setAiProvider(res.aiProvider);
      })
      .catch(() => {});

    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    authStorage.setToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: { name: string; email: string; password: string; education?: string; graduationYear?: string; preferredRole?: string }) => {
    const res = await api.register(payload);
    authStorage.setToken(res.token);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    authStorage.setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
    setActiveAnalysis(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeAnalysis,
        setActiveAnalysis,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        aiProvider,
        voiceAssistantOpen,
        setVoiceAssistantOpen,
        subramaniBotEnabled,
        setSubramaniBotEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
