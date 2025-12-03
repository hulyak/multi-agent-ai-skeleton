'use client';

import { useState } from 'react';
import {
  ArchitectureDiagram,
  AgentConsole,
  AgentStatusSidebar,
  NeonPulseButton,
  WorkflowAnimation,
  SpookyFloatingBones,
  HauntedGhost,
  CreepyEyes,
  SkeletonCursor,
  CrawlingSpider,
  BloodDrip,
  HauntedBackground,
  type ConsoleMessage,
  type AgentStatus,
  type WorkflowStep
} from '@/ui';

export default function MultiAgentDemoPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-1');
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Sample agents with spooky personas
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'agent-1',
      name: '🔮 The Seer',
      status: 'idle',
      description: 'Gazes into queries to divine their true intent and purpose',
      lastAction: 'Awaiting visions...',
      lastUpdate: new Date()
    },
    {
      id: 'agent-2',
      name: '📚 The Oracle',
      status: 'idle',
      description: 'Keeper of ancient knowledge, matches questions to forgotten wisdom',
      lastAction: 'Consulting the tomes...',
      lastUpdate: new Date()
    },
    {
      id: 'agent-3',
      name: '🚪 The Gatekeeper',
      status: 'idle',
      description: 'Guards the threshold between automated and human realms',
      lastAction: 'Standing watch...',
      lastUpdate: new Date()
    },
    {
      id: 'agent-4',
      name: '🔗 The Skeletal Scribe',
      status: 'idle',
      description: 'Etches source citations into the bones of every response',
      lastAction: 'Quill at rest...',
      lastUpdate: new Date()
    }
  ]);
  
  // Workflow steps
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: '1', name: 'User Input', status: 'pending' },
    { id: '2', name: 'Intent Detection', status: 'pending' },
    { id: '3', name: 'Processing', status: 'pending' },
    { id: '4', name: 'Response', status: 'pending' }
  ]);
  
  // Simulate workflow execution
  const runWorkflow = async () => {
    setIsRunning(true);
    
    // Reset workflow
    setWorkflowSteps([
      { id: '1', name: 'User Input', status: 'active' },
      { id: '2', name: 'Intent Detection', status: 'pending' },
      { id: '3', name: 'Processing', status: 'pending' },
      { id: '4', name: 'Response', status: 'pending' }
    ]);
    
    // Add initial message
    addMessage({
      type: 'info',
      from: 'System',
      content: 'Workflow started'
    });
    
    // Step 1: User Input
    await delay(1000);
    setWorkflowSteps(prev => [
      { ...prev[0], status: 'complete' },
      { ...prev[1], status: 'active' },
      prev[2],
      prev[3]
    ]);
    updateAgentStatus('agent-1', 'running', 'Analyzing intent');
    addMessage({
      type: 'info',
      from: 'User',
      to: 'Intent Agent',
      content: 'How do I reset my password?',
      data: { query: 'password_reset', confidence: 0.95 }
    });
    
    // Step 2: Intent Detection
    await delay(1500);
    setWorkflowSteps(prev => [
      prev[0],
      { ...prev[1], status: 'complete' },
      { ...prev[2], status: 'active' },
      prev[3]
    ]);
    updateAgentStatus('agent-1', 'success', 'Intent detected: FAQ');
    updateAgentStatus('agent-2', 'running', 'Searching FAQ database');
    addMessage({
      type: 'info',
      from: 'Intent Agent',
      to: 'FAQ Agent',
      content: 'Intent: password_reset, confidence: 95%',
      data: { intent: 'password_reset', route: 'faq' }
    });
    
    // Step 3: Processing
    await delay(2000);
    setWorkflowSteps(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: 'complete' },
      { ...prev[3], status: 'active' }
    ]);
    updateAgentStatus('agent-2', 'success', 'FAQ match found');
    updateAgentStatus('agent-4', 'running', 'Adding citations');
    addMessage({
      type: 'info',
      from: 'FAQ Agent',
      to: 'Citation Agent',
      content: 'FAQ match found: Password Reset Guide',
      data: { faq_id: 'pwd_reset_001', match_score: 0.92 }
    });
    
    // Step 4: Response
    await delay(1000);
    setWorkflowSteps(prev => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], status: 'complete' }
    ]);
    updateAgentStatus('agent-4', 'success', 'Citations added');
    addMessage({
      type: 'info',
      from: 'Citation Agent',
      to: 'User',
      content: 'Response ready with citations',
      data: { 
        response: 'To reset your password, visit the account settings page...',
        citations: ['Help Doc #123', 'Security Guide']
      }
    });
    
    // Complete
    await delay(500);
    addMessage({
      type: 'info',
      from: 'System',
      content: 'Workflow completed successfully'
    });
    
    // Reset agents to idle
    await delay(1000);
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', lastAction: 'Ready' })));
    setIsRunning(false);
  };
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const addMessage = (msg: Omit<ConsoleMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }]);
  };
  
  const updateAgentStatus = (
    agentId: string, 
    status: AgentStatus['status'], 
    lastAction: string
  ) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId 
        ? { ...a, status, lastAction, lastUpdate: new Date() }
        : a
    ));
  };
  
  const handleClearConsole = () => {
    setMessages([]);
  };
  
  return (
    <div className="spooky-theme min-h-screen">
      {/* Haunted Background */}
      <HauntedBackground />
      
      {/* Scary Effects */}
      <SpookyFloatingBones count={3} />
      <SkeletonCursor />
      <BloodDrip count={6} />
      
      {/* Floating Ghosts */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute top-28 right-12">
          <HauntedGhost size="sm" delay={2} />
        </div>
        <div className="absolute bottom-24 left-16">
          <HauntedGhost size="md" delay={5} />
        </div>
      </div>
      
      {/* Crawling Spiders */}
      <CrawlingSpider startX={25} startY={35} delay={3} />
      <CrawlingSpider startX={65} startY={65} delay={9} />
      
      {/* Header */}
      <header className="border-b border-spooky-border-subtle bg-spooky-bg-secondary/30 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-spooky-text-primary mb-2 font-display tracking-tight">
            Multi-Agent System Demo
          </h1>
          <p className="text-spooky-text-secondary/60 text-lg">
            Interactive demonstration of multi-agent orchestration
          </p>
        </div>
      </header>
      
      {/* Architecture Diagram Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-spooky-text-primary mb-8 text-center font-display tracking-tight">
            System Architecture
          </h2>
          <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-purple/30 transition-colors">
            <ArchitectureDiagram animated />
          </div>
        </div>
      </section>
      
      {/* Workflow Animation Section */}
      <section className="py-12 px-6 bg-spooky-bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-spooky-text-primary font-display tracking-tight">
              Workflow Execution
            </h2>
            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className="px-6 py-3 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 disabled:bg-spooky-accent-purple/50 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-purple/50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRunning ? '⚡ Running...' : '▶️ Run Workflow'}
            </button>
          </div>
          
          <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8">
            <WorkflowAnimation steps={workflowSteps} />
          </div>
        </div>
      </section>
      
      {/* Three-Panel Layout */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-spooky-text-primary mb-8 text-center font-display tracking-tight">
            Agent Dashboard
          </h2>
          
          <div className="grid grid-cols-12 gap-6 h-[600px]">
            {/* Left Sidebar - Agent Status */}
            <div className="col-span-3">
              <AgentStatusSidebar
                agents={agents}
                selectedAgentId={selectedAgentId}
                onAgentSelect={setSelectedAgentId}
                className="h-full"
              />
            </div>
            
            {/* Main Content Panel */}
            <div className="col-span-6">
              <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 h-full overflow-y-auto hover:border-spooky-accent-purple/30 transition-colors">
                <h3 className="text-2xl font-bold text-spooky-text-primary mb-6">
                  Agent Details
                </h3>
                
                {(() => {
                  const agent = agents.find(a => a.id === selectedAgentId);
                  if (!agent) return null;
                  
                  return (
                    <div className="space-y-6">
                      <div className="bg-spooky-bg-tertiary/30 rounded-xl p-6 border border-spooky-border-subtle">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-spooky-accent-purple/10 flex items-center justify-center text-xl">
                            🤖
                          </div>
                          <h4 className="text-xl font-semibold text-spooky-accent-purple">
                            {agent.name}
                          </h4>
                        </div>
                        <p className="text-spooky-text-secondary/80 leading-relaxed">
                          {agent.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-spooky-bg-tertiary/30 rounded-xl p-4 border border-spooky-border-subtle">
                          <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">Status</dt>
                          <dd className="text-spooky-text-primary capitalize font-semibold text-lg">
                            {agent.status}
                          </dd>
                        </div>
                        <div className="bg-spooky-bg-tertiary/30 rounded-xl p-4 border border-spooky-border-subtle">
                          <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">Last Update</dt>
                          <dd className="text-spooky-text-primary font-mono text-sm">
                            {agent.lastUpdate?.toLocaleTimeString()}
                          </dd>
                        </div>
                      </div>
                      
                      <div className="bg-spooky-bg-tertiary/30 rounded-xl p-4 border border-spooky-border-subtle">
                        <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">Last Action</dt>
                        <dd className="text-spooky-text-primary">
                          {agent.lastAction}
                        </dd>
                      </div>
                      
                      <div className="bg-spooky-bg-tertiary/30 rounded-xl p-4 border border-spooky-border-subtle">
                        <h5 className="text-sm font-semibold text-spooky-text-primary mb-3 uppercase tracking-wider">
                          Capabilities
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                            <span className="text-spooky-accent-purple">✓</span> Message processing
                          </div>
                          <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                            <span className="text-spooky-accent-purple">✓</span> State management
                          </div>
                          <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                            <span className="text-spooky-accent-purple">✓</span> Event publishing
                          </div>
                          <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                            <span className="text-spooky-accent-purple">✓</span> Error handling
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Right Sidebar - Agent Console */}
            <div className="col-span-3">
              <AgentConsole
                messages={messages}
                onClear={handleClearConsole}
                autoScroll
                className="h-full"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 text-center bg-spooky-bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl font-bold text-spooky-text-primary">
            Ready to Build Your Own?
          </h2>
          <p className="text-xl text-spooky-text-secondary/80">
            Use this skeleton to create your own multi-agent applications
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-purple/50">
              📚 View Documentation
            </button>
            <button className="px-8 py-4 bg-spooky-accent-green hover:bg-spooky-accent-green/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-green/50">
              💻 Explore Code
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
