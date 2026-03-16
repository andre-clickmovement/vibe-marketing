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

  // Pass userId to brandStore for Supabase persistence
  const brandStore = useBrandStore(user?.id);
  const chat = useChat();
  const chatHistory = useChatHistory(user?.id, activeSkillId);

  // Load chat history when opening a skill
  useEffect(() => {
    if (chatHistory.currentMessages.length > 0 && chat.messages.length === 0) {
      // Restore messages from history
      chat.setMessages?.(chatHistory.currentMessages);
    }
  }, [chatHistory.currentMessages]);

  // Save chat history when messages change
  useEffect(() => {
    if (chat.messages.length > 0 && activeSkillId) {
      chatHistory.saveSession(chat.messages);
    }
  }, [chat.messages, activeSkillId]);

  // Show loading state while auth initializes
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

  // Show login if Supabase is configured but user isn't authenticated
  if (isConfigured && !isAuthenticated) {
    return <Login />;
  }

  // Navigation helpers
  const goSplash = () => setView('splash');
  const goOnboarding = () => setView('onboarding');
  const goDashboard = () => setView('dashboard');

  const openSkill = useCallback((skillId) => {
    setActiveSkillId(skillId);
    chat.resetChat();
    chatHistory.startNewSession();
    setView('skill');
  }, [chat, chatHistory]);

  const openWorkflow = useCallback((workflowId) => {
    setActiveWorkflow(WORKFLOWS.find((w) => w.id === workflowId));
    setView('workflow');
  }, []);

  // Onboarding Complete
  const handleOnboardingComplete = useCallback(({ businessDesc, businessUrl, selectedGoal, apiKeys }) => {
    brandStore.updateBrand('stack', JSON.stringify({
      businessDesc,
      businessUrl,
      goal: selectedGoal,
      apiKeys: Object.fromEntries(Object.entries(apiKeys).filter(([_, v]) => v)),
    }, null, 2));
    goDashboard();
  }, [brandStore]);

  // Send Message to Skill
  const handleSendMessage = useCallback(async (userMessage) => {
    if (!activeSkillId) return;

    const systemPrompt = buildSystemPrompt(activeSkillId, brandStore.getBrandContext());
    const response = await chat.sendMessage(userMessage, systemPrompt);

    // Auto-save foundation skill outputs to brand memory
    const skill = getSkillById(activeSkillId);
    if (skill?.brandKey && response && !response.startsWith('Error:')) {
      brandStore.updateBrand(skill.brandKey, response);
    }

    return response;
  }, [activeSkillId, brandStore, chat]);

  // Reset
  const handleReset = useCallback(() => {
    brandStore.resetBrand();
    chat.resetChat();
    setView('onboarding');
  }, [brandStore, chat]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setView('splash');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [signOut]);

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
      if (!activeSkill) { goDashboard(); return null; }
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
      if (!activeWorkflow) { goDashboard(); return null; }
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
