import { useState, useCallback } from 'react';
import Splash from './components/Splash.jsx';
import Onboarding from './components/Onboarding.jsx';
import Dashboard from './components/Dashboard.jsx';
import SkillChat from './components/SkillChat.jsx';
import WorkflowView from './components/WorkflowView.jsx';
import { useBrandStore } from './hooks/useBrandStore.js';
import { useChat } from './hooks/useChat.js';
import { SKILLS, WORKFLOWS, getSkillById } from './data/skills.js';
import { buildSystemPrompt } from './data/prompts.js';

export default function App() {
  const [view, setView] = useState('splash');
  const [activeSkillId, setActiveSkillId] = useState(null);
  const [activeWorkflow, setActiveWorkflow] = useState(null);

  const brandStore = useBrandStore();
  const chat = useChat();

  // ─── Navigation ───
  const goSplash = () => setView('splash');
  const goOnboarding = () => setView('onboarding');
  const goDashboard = () => setView('dashboard');

  const openSkill = useCallback((skillId) => {
    setActiveSkillId(skillId);
    chat.resetChat();
    setView('skill');
  }, [chat]);

  const openWorkflow = useCallback((workflowId) => {
    setActiveWorkflow(WORKFLOWS.find((w) => w.id === workflowId));
    setView('workflow');
  }, []);

  // ─── Onboarding Complete ───
  const handleOnboardingComplete = useCallback(({ businessDesc, businessUrl, selectedGoal, apiKeys }) => {
    brandStore.updateBrand('stack', JSON.stringify({
      businessDesc,
      businessUrl,
      goal: selectedGoal,
      apiKeys: Object.fromEntries(Object.entries(apiKeys).filter(([_, v]) => v)),
    }, null, 2));
    goDashboard();
  }, [brandStore]);

  // ─── Send Message to Skill ───
  const handleSendMessage = useCallback(async (userMessage) => {
    if (!activeSkillId) return;

    const systemPrompt = buildSystemPrompt(activeSkillId, brandStore.getBrandContext());
    const response = await chat.sendMessage(userMessage, systemPrompt);

    // Auto-save foundation skill outputs to brand memory
    const skill = getSkillById(activeSkillId);
    if (skill?.brandKey && response && !response.startsWith('⚠')) {
      brandStore.updateBrand(skill.brandKey, response);
    }

    return response;
  }, [activeSkillId, brandStore, chat]);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    brandStore.resetBrand();
    chat.resetChat();
    setView('onboarding');
  }, [brandStore, chat]);

  // ─── Render ───
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
