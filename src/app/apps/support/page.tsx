'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SpookyCard,
  SpookyButton,
  SpookyFloatingBones,
  NeonPulseButton,
  SpookySpinner,
  HauntedGhost,
  CreepyEyes,
  SkeletonCursor,
  CrawlingSpider,
  BloodDrip,
  HauntedBackground
} from '@/ui';

interface SupportQuery {
  id: string;
  query: string;
  intent: string;
  confidence: number;
  response: string;
  citations: string[];
  timestamp: Date;
}

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<SupportQuery[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simulate agent processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newQuery: SupportQuery = {
      id: `query-${Date.now()}`,
      query: query.trim(),
      intent: detectIntent(query),
      confidence: 0.85 + Math.random() * 0.15,
      response: generateResponse(query),
      citations: ['Help Doc #123', 'FAQ Database'],
      timestamp: new Date()
    };
    
    setHistory(prev => [newQuery, ...prev]);
    setQuery('');
    setIsProcessing(false);
  };
  
  const detectIntent = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('password') || lower.includes('reset')) return 'password_reset';
    if (lower.includes('account') || lower.includes('login')) return 'account_access';
    if (lower.includes('billing') || lower.includes('payment')) return 'billing';
    if (lower.includes('bug') || lower.includes('error')) return 'technical_issue';
    return 'general_inquiry';
  };
  
  const generateResponse = (q: string): string => {
    const intent = detectIntent(q);
    const responses: Record<string, string> = {
      password_reset: 'To reset your password, visit the account settings page and click "Forgot Password". You\'ll receive an email with reset instructions within 5 minutes.',
      account_access: 'If you\'re having trouble accessing your account, please verify your email address and ensure you\'re using the correct credentials. Contact support if issues persist.',
      billing: 'For billing inquiries, please visit your account dashboard where you can view invoices, update payment methods, and manage your subscription.',
      technical_issue: 'We\'ve logged your technical issue. Our engineering team will investigate and respond within 24 hours. Please include any error messages or screenshots.',
      general_inquiry: 'Thank you for your inquiry. Our support team has received your message and will respond within 24 hours during business days.'
    };
    return responses[intent] || responses.general_inquiry;
  };
  
  return (
    <div className="spooky-theme min-h-screen">
      {/* Haunted Background */}
      <HauntedBackground />
      
      {/* Scary Effects */}
      <SpookyFloatingBones count={4} />
      <SkeletonCursor />
      <BloodDrip count={8} />
      
      {/* Floating Ghosts */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute top-32 right-10">
          <HauntedGhost size="md" delay={1} />
        </div>
        <div className="absolute bottom-20 left-20">
          <HauntedGhost size="sm" delay={3} />
        </div>
      </div>
      
      {/* Crawling Spiders */}
      <CrawlingSpider startX={20} startY={30} delay={2} />
      <CrawlingSpider startX={70} startY={60} delay={8} />
      
      {/* Header */}
      <header className="border-b border-spooky-border-subtle bg-spooky-bg-secondary/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-spooky-text-primary mb-2 font-display tracking-tight">
              💀 Support Copilot
            </h1>
            <p className="text-spooky-text-secondary/60 text-lg">
              AI-powered customer support with intelligent routing
            </p>
          </div>
          <Link href="/">
            <button className="px-4 py-2 bg-spooky-bg-tertiary/50 hover:bg-spooky-bg-tertiary text-spooky-text-primary rounded-lg text-sm font-medium transition-colors border border-spooky-border-subtle">
              ← Back to Home
            </button>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Query Input */}
          <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="support-query" 
                  className="block text-lg font-semibold text-spooky-text-primary mb-3 font-display tracking-tight"
                >
                  How can we help you today?
                </label>
                <textarea
                  id="support-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe your issue or question..."
                  className="w-full px-5 py-4 bg-spooky-bg-tertiary/50 border border-spooky-border-subtle rounded-xl text-spooky-text-primary placeholder-spooky-text-muted/50 focus:outline-none focus:ring-2 focus:ring-spooky-accent-purple/50 focus:border-spooky-accent-purple/50 resize-none transition-all"
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!query.trim() || isProcessing}
                  className="px-8 py-3 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 disabled:bg-spooky-accent-purple/50 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-purple/50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <SpookySpinner size="sm" />
                      Processing...
                    </span>
                  ) : (
                    '🚀 Submit Query'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Agent Workflow Info */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { name: 'Intent Detection', icon: '🎯', desc: 'Classifies query type', color: 'purple' },
              { name: 'FAQ Matching', icon: '📚', desc: 'Searches knowledge base', color: 'green' },
              { name: 'Response Gen', icon: '✨', desc: 'Generates answer', color: 'orange' },
              { name: 'Citation', icon: '🔗', desc: 'Adds sources', color: 'neon' }
            ].map((agent, idx) => (
              <div
                key={idx}
                className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6 text-center hover:border-spooky-accent-purple/50 transition-all duration-300 hover:shadow-lg hover:shadow-spooky-accent-purple/10"
              >
                <div className="text-4xl mb-3">{agent.icon}</div>
                <div className="text-sm font-semibold text-spooky-text-primary mb-2 font-display tracking-tight">
                  {agent.name}
                </div>
                <div className="text-xs text-spooky-text-muted/70">
                  {agent.desc}
                </div>
              </div>
            ))}
          </div>
          
          {/* Query History */}
          {history.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-spooky-text-primary mb-6 font-display tracking-tight">
                Query History
              </h2>
              
              {history.map((item) => (
                <div key={item.id} className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 space-y-6 hover:border-spooky-accent-purple/30 transition-colors">
                  {/* Query */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-spooky-accent-purple">
                        Your Query
                      </h3>
                      <span className="text-xs text-spooky-text-muted/70 font-mono bg-spooky-bg-tertiary/30 px-3 py-1 rounded-lg">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-spooky-text-secondary/90 leading-relaxed">
                      {item.query}
                    </p>
                  </div>
                  
                  {/* Intent Detection */}
                  <div className="border-t border-spooky-border-subtle pt-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold text-spooky-text-muted uppercase tracking-wider">
                        Detected Intent:
                      </span>
                      <span className="px-3 py-1.5 bg-spooky-accent-orange/10 text-spooky-accent-orange text-sm rounded-lg border border-spooky-accent-orange/20 font-medium">
                        {item.intent}
                      </span>
                      <span className="text-sm text-spooky-text-muted/70">
                        {Math.round(item.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  
                  {/* Response */}
                  <div className="border-t border-spooky-border-subtle pt-6">
                    <h4 className="text-sm font-semibold text-spooky-accent-green mb-3 uppercase tracking-wider">
                      Response
                    </h4>
                    <p className="text-spooky-text-secondary/90 leading-relaxed">
                      {item.response}
                    </p>
                  </div>
                  
                  {/* Citations */}
                  <div className="border-t border-spooky-border-subtle pt-6">
                    <h4 className="text-sm font-semibold text-spooky-text-muted mb-3 uppercase tracking-wider">
                      Sources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.citations.map((citation, idx) => (
                        <span
                          key={idx}
                          className="text-sm px-3 py-1.5 bg-spooky-bg-tertiary/50 text-spooky-text-secondary rounded-lg border border-spooky-border-subtle"
                        >
                          📄 {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {history.length === 0 && !isProcessing && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👻</div>
              <h3 className="text-xl font-semibold text-spooky-text-primary mb-2">
                No queries yet
              </h3>
              <p className="text-spooky-text-secondary">
                Submit a support query above to see the multi-agent system in action
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
