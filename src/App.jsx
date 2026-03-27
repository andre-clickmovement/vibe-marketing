import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext.jsx';
import Login from './components/Login.jsx';
import Splash from './components/Splash.jsx';
import Onboarding from './components/Onboarding.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import SkillChat from './components/SkillChat.jsx';
import WorkflowView from './components/WorkflowView.jsx';
import DocumentView from './components/DocumentView.jsx';
import MainContent from './components/layout/MainContent.jsx';
import AICMOChat from './components/AICMOChat.jsx';
import { useBrandStore } from './hooks/useBrandStore.js';
import { useChat } from './hooks/useChat.js';
import { useChatHistory } from './hooks/useChatHistory.js';
import { useDocuments } from './hooks/useDocuments.js';
import { WORKFLOWS, getSkillById } from './data/skills.js';
import { buildSystemPrompt, buildAICMOPrompt } from './data/prompts.js';

export default function App() {
  const { user, loading: authLoading, isAuthenticated, isConfigured, signOut } = useAuth();
  const [view, setView] = useState('splash');
  const [activeSkillId, setActiveSkillId] = useState(null);
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [showCMO, setShowCMO] = useState(false);

  // Pass userId to brandStore for Supabase persistence
  const userId = user?.id ? String(user.id) : null;
  const brandStore = useBrandStore(userId);
  const chat = useChat(); // For skill chats
  const cmoChat = useChat(); // Separate chat instance for AI CMO
  const chatHistory = useChatHistory(userId, activeSkillId);
  const { documents, createDocument, updateDocument, deleteDocument, getDocument } = useDocuments(userId);

  // Load chat history when opening a skill
  useEffect(() => {
    if (chatHistory.currentMessages.length > 0 && chat.messages.length === 0) {
      chat.setMessages?.(chatHistory.currentMessages);
    }
  }, [chatHistory.currentMessages, chat.messages.length, chat.setMessages]);

  // Save chat history when messages change
  useEffect(() => {
    if (chat.messages.length > 0 && activeSkillId) {
      chatHistory.saveSession(chat.messages);
    }
  }, [chat.messages, activeSkillId, chatHistory]);

  // Navigation helpers
  const goSplash = useCallback(() => setView('splash'), []);
  const goOnboarding = useCallback(() => setView('onboarding'), []);
  const goApp = useCallback(() => setView('app'), []);

  // Select skill from sidebar
  const handleSelectSkill = useCallback((skillId) => {
    setActiveSkillId(skillId);
    setActiveWorkflowId(null);
    setActiveDocumentId(null);
    chat.resetChat();
    chatHistory.startNewSession();
  }, [chat, chatHistory]);

  // Select workflow from sidebar
  const handleSelectWorkflow = useCallback((workflowId) => {
    setActiveWorkflowId(workflowId);
    setActiveSkillId(null);
    setActiveDocumentId(null);
  }, []);

  // Select document from sidebar
  const handleSelectDocument = useCallback((docId) => {
    setActiveDocumentId(docId);
    setActiveSkillId(null);
    setActiveWorkflowId(null);
  }, []);

  // Go back to overview (deselect skill/workflow/document)
  const handleBackToOverview = useCallback(() => {
    setActiveSkillId(null);
    setActiveWorkflowId(null);
    setActiveDocumentId(null);
  }, []);

  // Onboarding Complete
  const handleOnboardingComplete = useCallback(({ businessDesc, businessUrl, selectedGoal, apiKeys }) => {
    brandStore.updateBrand('stack', JSON.stringify({
      businessDesc,
      businessUrl,
      goal: selectedGoal,
      apiKeys: Object.fromEntries(Object.entries(apiKeys).filter(([_, v]) => v)),
    }, null, 2));
    goApp();
  }, [brandStore, goApp]);

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

  // AI CMO message handler
  const handleCMOMessage = useCallback(async (userMessage) => {
    const systemPrompt = buildAICMOPrompt(brandStore.getBrandContext());
    return await cmoChat.sendMessage(userMessage, systemPrompt);
  }, [brandStore, cmoChat]);

  // Logout
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

  // Get active skill/workflow/document objects
  const activeSkill = activeSkillId ? getSkillById(activeSkillId) : null;
  const activeWorkflow = activeWorkflowId ? WORKFLOWS.find(w => w.id === activeWorkflowId) : null;
  const activeDocument = activeDocumentId ? getDocument(activeDocumentId) : null;

  // Render based on view
  switch (view) {
    case 'splash':
      return <Splash onStart={goOnboarding} onSkip={goApp} />;

    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} onBack={goSplash} />;

    case 'app':
    default:
      return (
        <>
          <AppLayout
            activeSkillId={activeSkillId}
            activeWorkflowId={activeWorkflowId}
            activeDocumentId={activeDocumentId}
            onSelectSkill={handleSelectSkill}
            onSelectWorkflow={handleSelectWorkflow}
            documents={documents}
            onSelectDocument={handleSelectDocument}
            brand={brandStore.brand}
            user={user}
            syncing={brandStore.syncing}
            onLogout={isAuthenticated ? handleLogout : null}
            onOpenCMO={() => setShowCMO(true)}
          >
            {/* Render content based on selection */}
            {activeSkill ? (
              <SkillChat
                skill={activeSkill}
                messages={chat.messages}
                isStreaming={chat.isStreaming}
                isUploading={chat.isUploading}
                attachments={chat.attachments}
                onSend={handleSendMessage}
                onStop={chat.stopStreaming}
                onBack={handleBackToOverview}
                onSaveDocument={createDocument}
                onAddAttachments={chat.addAttachments}
                onRemoveAttachment={chat.removeAttachment}
              />
            ) : activeWorkflow ? (
              <WorkflowView
                workflow={activeWorkflow}
                onOpenSkill={handleSelectSkill}
                onBack={handleBackToOverview}
              />
            ) : activeDocument ? (
              <DocumentView
                document={activeDocument}
                onBack={handleBackToOverview}
                onUpdate={updateDocument}
                onDelete={deleteDocument}
              />
            ) : (
              <MainContent
                view="overview"
                brand={brandStore.brand}
                onSelectSkill={handleSelectSkill}
              />
            )}
          </AppLayout>

          {/* AI CMO Chat Panel */}
          <AICMOChat
            isOpen={showCMO}
            onClose={() => setShowCMO(false)}
            messages={cmoChat.messages}
            isStreaming={cmoChat.isStreaming}
            isFetchingUrl={cmoChat.isFetchingUrl}
            isUploading={cmoChat.isUploading}
            attachments={cmoChat.attachments}
            onSend={handleCMOMessage}
            onStop={cmoChat.stopStreaming}
            onAddAttachments={cmoChat.addAttachments}
            onRemoveAttachment={cmoChat.removeAttachment}
            onSelectSkill={(skillId) => {
              setShowCMO(false);
              handleSelectSkill(skillId);
            }}
          />

          {/* Backdrop for CMO panel */}
          {showCMO && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 420,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 999,
              }}
              onClick={() => setShowCMO(false)}
            />
          )}
        </>
      );
  }
}
