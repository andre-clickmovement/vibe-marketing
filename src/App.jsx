import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext.jsx';
import Login from './components/Login.jsx';
import Splash from './components/Splash.jsx';
import Onboarding from './components/Onboarding.jsx';
import Dashboard from './components/Dashboard.jsx';
import SkillChat from './components/SkillChat.jsx';
import WorkflowView from './components/WorkflowView.jsx';
import { useBrandStore } from './hooks/useBrandStore.js';
import { useChat } from './hooks/useChat.js';
import { useChatHistory } from './hooks/useChatHistory.js';
import { WORKFLOWS, getSkillById } from './data/skills.js';
import { buildSystemPrompt } from './data/prompts.js';

export default function App() {
  const { user, loading: authLoading, isAuthenticated, isConfigured, signOut } = useAuth();
  const [view, setView] = useState('splash');
  const [activeSkillId, setActiveSkillId] = useState(null);
  const [activeWorkflow, setActiveWorkflow] = useState(null);

  const userId = user?.id ? String(user.id) : null;
  const brandStore = useBrandStore(userId);
  const chat = useChat();
  const chatHistory = useChatHistory(userId, activeSkillId);

  // Load chat history when opening a skill
  useEffect(() => {
    if (chatHistory.currentMessages.length > 0 && chat.messages.length === 0) {
      chat.setMessages?.(chatHistory.currentMessages);
    }
  }, [chatHistory.currentMessages]);

  // Save chat history when messages change
  useEffect(() => {
    if (chat.messages.length > 0 && activeSkillId) {
      chatHistory.saveSession(chat.messages);
    }
  }, [chat.messages, activeSkillId]);

  // Navigation helpers
  const goSplash = useCallback(() => setView('splash'), []);
  const goOnboarding = useCallback(() => setView('onboarding'), []);
  const goDashboard = useCallback(() => setView('dashboard'), []);

  const openSkill = useCallback((skillId) => {
    setActiveSkillId(skillId);
    chat.resetChat();
    chatHistory.startNewSession();
    setView('skill');
  }, [chat.resetChat, chatHistory.startNewSession]);

  const openWorkflow = useCallback((workflowId) => {
    setActiveWorkflow(WORKFLOWS.find((w) => w.id === workflowId));
    setView('workflow');
  }, []);

  const handleOnboardingComplete = useCallback(({ businessDesc, businessUrl, selectedGoal, apiKeys }) => {
    brandStore.updateBrand('stack', JSON.stringify({
      businessDesc,
      businessUrl,
      goal: selectedGoal,
      apiKeys: Object.fromEntries(Object.entries(apiKeys).filter(([_, v]) => v)),
    }, null, 2));
    setView('dashboard');
  }, [brandStore.updateBrand]);

  const handleSendMessage = useCallback(async (userMessage) => {
    if (!activeSkillId) return;

    const systemPrompt = buildSystemPrompt(activeSkillId, brandStore.getBrandContext());
    const response = await chat.sendMessage(userMessage, systemPrompt);

    const skill = getSkillById(activeSkillId);
    if (skill?.brandKey && response && !response.startsWith('Error:')) {
      brandStore.updateBrand(skill.brandKey, response);
    }

    return response;
  }, [activeSkillId, brandStore.getBrandContext, brandStore.updateBrand, chat.sendMessage]);

  const handleReset = useCallback(() => {
    brandStore.resetBrand();
    chat.resetChat();
    setView('onboarding');
  }, [brandStore.resetBrand, chat.resetChat]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setView('splash');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [signOut]);

  // === Early returns AFTER all hooks ===

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (isConfigured && !isAuthenticated) {
    return <Login />;
  }

  // Render
  const activeSkill = activeSkillId ? getSkillById(activeSkillId) : null;

  switch (view) {
    case 'splash':
      return <Splash onStart={goOnboarding} onSkip={goDashboard} />;

    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} onBack={goSplash} />;

    case 'dashboard':
      return (
        <Dashboard
          brand={brandStore.brand}
          foundationComplete={brandStore.foundationComplete}
          foundationTotal={brandStore.foundationTotal}
          onOpenSkill={openSkill}
          onOpenWorkflow={openWorkflow}
          onReset={handleReset}
          onLogout={isAuthenticated ? handleLogout : null}
          user={user}
          syncing={brandStore.syncing}
        />
      );

    case 'skill':
      if (!activeSkill) { setView('dashboard'); return null; }
      return (
        <SkillChat
          skill={activeSkill}
          messages={chat.messages}
          isStreaming={chat.isStreaming}
          onSend={handleSendMessage}
          onStop={chat.stopStreaming}
          onBack={goDashboard}
        />
      );

    case 'workflow':
      if (!activeWorkflow) { setView('dashboard'); return null; }
      return (
        <WorkflowView
          workflow={activeWorkflow}
          onOpenSkill={openSkill}
          onBack={goDashboard}
        />
      );

    default:
      return <Splash onStart={goOnboarding} onSkip={goDashboard} />;
  }
}
