'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[#c0c0c0] font-mono">
      {/* Window Title Bar */}
      <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">📁</span>
          <span>CORBA Support Agent - Netscape Navigator</span>
        </div>
        <div className="flex gap-1">
          <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">_</button>
          <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">□</button>
          <Link href="/">
            <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">✕</button>
          </Link>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-[#c0c0c0] border-b-2 border-[#808080] px-2 py-1 flex gap-2">
        <Link href="/">
          <button className="bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-3 py-1 hover:bg-[#a0a0a0] active:border-black active:border-b-white active:border-r-white">
            ← Back
          </button>
        </Link>
        <button className="bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-3 py-1 hover:bg-[#a0a0a0] active:border-black active:border-b-white active:border-r-white">
          🔄 Refresh
        </button>
        <button className="bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-3 py-1 hover:bg-[#a0a0a0] active:border-black active:border-b-white active:border-r-white">
          🏠 Home
        </button>
      </div>
      
      {/* Header */}
      <header className="bg-white border-4 border-[#808080] m-4 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            textShadow: '2px 2px #ff00ff, 4px 4px #00ffff',
            color: '#ff0000'
          }}>
            🌐 CORBA Support Agent 🌐
          </h1>
          <p className="text-sm mb-4">
            <span className="animate-pulse">*** Customer Support via Distributed Objects ***</span>
          </p>
          <div className="flex justify-center gap-4">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%23000' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ENetscape%3C/text%3E%3C/svg%3E" alt="Netscape Now" />
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%230000ff' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ECORBA 2.0%3C/text%3E%3C/svg%3E" alt="CORBA 2.0" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Query Input */}
          <div className="bg-white border-4 border-[#808080] p-6 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="support-query" 
                  className="block text-lg font-bold mb-2 text-[#000080]"
                >
                  📝 Customer Support Query
                </label>
                <textarea
                  id="support-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your support question here..."
                  className="w-full px-3 py-2 bg-white border-2 border-[#808080] font-mono text-sm text-black focus:outline-none focus:border-[#000080] resize-none placeholder-gray-600"
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!query.trim() || isProcessing}
                  className="bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-6 py-2 font-bold hover:bg-[#a0a0a0] active:border-black active:border-b-white active:border-r-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '⏳ Processing via IIOP...' : '🚀 Submit Query'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Example Queries */}
          <div className="bg-white border-4 border-[#808080] p-4 mb-4">
            <p className="text-sm font-bold mb-3 text-[#008000]">💡 Try these example queries:</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "I forgot my password and can't log into my account. How do I reset it?",
                "I was charged twice for my subscription. Can you help me?",
                "How do I update my payment method?",
                "I'm getting an error when trying to upload files. What should I do?"
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(example);
                  }}
                  className="text-left px-3 py-2 bg-[#f0f0f0] border-2 border-[#808080] hover:bg-[#e0e0e0] text-sm text-black font-mono transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Agent Workflow Info */}
          <div className="bg-[#ffff00] border-4 border-black p-4 mb-4">
            <h2 className="text-xl font-bold mb-3 text-[#000080]">⚙️ CORBA Agent Pipeline</h2>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { name: 'IntentDetection', icon: '🎯', desc: 'classifyIntent()' },
                { name: 'FAQAgent', icon: '📚', desc: 'searchFAQ()' },
                { name: 'ResponseGen', icon: '✨', desc: 'generateResponse()' },
                { name: 'CitationAgent', icon: '🔗', desc: 'addCitations()' }
              ].map((agent, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-[#808080] p-3 text-center"
                >
                  <div className="text-3xl mb-2">{agent.icon}</div>
                  <div className="text-sm font-bold mb-1">
                    {agent.name}
                  </div>
                  <div className="text-xs text-[#008000] font-mono">
                    {agent.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Query History */}
          {history.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white border-4 border-[#808080] p-4">
                <h2 className="text-2xl font-bold mb-4 text-[#000080]">
                  📋 Query History (CORBA Transaction Log)
                </h2>
              </div>
              
              {history.map((item) => (
                <div key={item.id} className="bg-white border-4 border-[#808080] p-6 space-y-4">
                  {/* Query */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#800080]">
                        &gt;&gt; Customer Query
                      </h3>
                      <span className="text-xs font-mono bg-[#c0c0c0] px-2 py-1 border-2 border-[#808080]">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-[#f0f0f0] border-2 border-[#808080] p-3 font-mono text-sm text-black">
                      {item.query}
                    </div>
                  </div>
                  
                  {/* CORBA Processing Log */}
                  <div className="bg-black text-[#00ff00] p-3 font-mono text-xs">
                    <div>&gt; CORBA ORB: Marshalling request...</div>
                    <div>&gt; Invoking SupportSystem::IntentDetectionAgent::classifyIntent()</div>
                    <div>&gt; Intent: {item.intent} (confidence: {Math.round(item.confidence * 100)}%)</div>
                    <div>&gt; Invoking SupportSystem::FAQAgent::searchFAQ()</div>
                    <div>&gt; Invoking SupportSystem::ResponseAgent::generateResponse()</div>
                    <div>&gt; Invoking SupportSystem::CitationAgent::addCitations()</div>
                    <div>&gt; Response unmarshalled successfully</div>
                  </div>
                  
                  {/* Intent Detection */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold">
                        DETECTED INTENT:
                      </span>
                      <span className="px-3 py-1 bg-[#0000ff] text-white text-sm font-bold">
                        {item.intent}
                      </span>
                      <span className="text-sm bg-[#00ff00] text-black px-2 py-1 font-bold">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Response */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <h4 className="text-sm font-bold mb-2 text-[#008000]">
                      &gt;&gt; AGENT RESPONSE:
                    </h4>
                    <div className="bg-[#f0f0f0] border-2 border-[#808080] p-3 font-mono text-sm text-black">
                      {item.response}
                    </div>
                  </div>
                  
                  {/* Citations */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <h4 className="text-sm font-bold mb-2">
                      &gt;&gt; CITATIONS:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.citations.map((citation, idx) => (
                        <span
                          key={idx}
                          className="text-sm px-3 py-1 bg-[#c0c0c0] border-2 border-[#808080] font-mono text-black"
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
            <div className="bg-white border-4 border-[#808080] p-12 text-center">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-xl font-bold mb-2 text-[#000080]">
                No CORBA Transactions Yet
              </h3>
              <p className="text-sm mb-4">
                Submit a support query above to invoke the distributed agent objects
              </p>
              <div className="text-xs text-[#808080] font-mono">
                CORBA ORB Status: <span className="text-[#008000]">READY</span>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t-4 border-[#808080] p-4 text-center text-xs text-black">
        <hr className="border-2 border-dashed border-black mb-4" />
        <p>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
          {' '}Best viewed in Netscape Navigator 2.0 or higher{' '}
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
        </p>
        <p className="mt-2">
          Powered by CORBA 2.0 • IIOP Protocol • IDL Interfaces
        </p>
      </footer>
    </div>
  );
}
