'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ResearchQuery {
  id: string;
  query: string;
  documents: Array<{ id: string; title: string; relevance: number }>;
  summary: string;
  citations: string[];
  timestamp: Date;
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<ResearchQuery[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simulate agent processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newQuery: ResearchQuery = {
      id: `research-${Date.now()}`,
      query: query.trim(),
      documents: generateDocuments(query),
      summary: generateSummary(query),
      citations: generateCitations(),
      timestamp: new Date()
    };
    
    setHistory(prev => [newQuery, ...prev]);
    setQuery('');
    setIsProcessing(false);
  };
  
  const generateDocuments = (q: string): Array<{ id: string; title: string; relevance: number }> => {
    return [
      { id: 'doc-001', title: `Research on ${q.split(' ')[0]}: A Comprehensive Study`, relevance: 0.95 },
      { id: 'doc-002', title: `${q.split(' ')[1] || 'Advanced'} Techniques in Modern Systems`, relevance: 0.87 },
      { id: 'doc-003', title: `Historical Perspectives on ${q.split(' ')[0]}`, relevance: 0.78 }
    ];
  };
  
  const generateSummary = (q: string): string => {
    return `Based on the retrieved documents, ${q} represents a significant area of research with multiple applications across various domains. Recent studies have shown promising results in implementing these concepts, with particular emphasis on scalability and performance optimization. The literature suggests that further investigation into distributed architectures and agent-based systems could yield valuable insights for practical implementations.`;
  };
  
  const generateCitations = (): string[] => {
    return [
      'Smith et al. (1995) - Journal of Distributed Computing',
      'Johnson & Lee (1994) - ACM Transactions',
      'Brown (1996) - IEEE Computer Society'
    ];
  };
  
  return (
    <div className="min-h-screen bg-[#c0c0c0] font-mono">
      {/* Window Title Bar */}
      <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">📁</span>
          <span>CORBA Research Agent - Netscape Navigator</span>
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
            textShadow: '2px 2px #00ff00, 4px 4px #ff00ff',
            color: '#0000ff'
          }}>
            🌐 CORBA Research Agent 🌐
          </h1>
          <p className="text-sm mb-4">
            <span className="animate-pulse">*** Academic Research via Distributed Objects ***</span>
          </p>
          <div className="flex justify-center gap-4">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%23000' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ENetscape%3C/text%3E%3C/svg%3E" alt="Netscape Now" />
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%23008000' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ECORBA 2.0%3C/text%3E%3C/svg%3E" alt="CORBA 2.0" />
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
                  htmlFor="research-query" 
                  className="block text-lg font-bold mb-2 text-[#008000]"
                >
                  📚 Research Query
                </label>
                <textarea
                  id="research-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your research topic here..."
                  className="w-full px-3 py-2 bg-white border-2 border-[#808080] font-mono text-sm focus:outline-none focus:border-[#008000] resize-none"
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
                  {isProcessing ? '⏳ Processing via IIOP...' : '🔍 Search Documents'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Agent Workflow Info */}
          <div className="bg-[#00ffff] border-4 border-black p-4 mb-4">
            <h2 className="text-xl font-bold mb-3 text-[#000080]">⚙️ CORBA Agent Pipeline</h2>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { name: 'RetrievalAgent', icon: '⚰️', desc: 'retrieveDocuments()' },
                { name: 'SummarizationAgent', icon: '👻', desc: 'summarizeDocument()' },
                { name: 'CitationAgent', icon: '🦴', desc: 'generateCitations()' },
                { name: 'CoordinatorAgent', icon: '🔮', desc: 'coordinateWorkflow()' }
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
          
          {/* Research History */}
          {history.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white border-4 border-[#808080] p-4">
                <h2 className="text-2xl font-bold mb-4 text-[#008000]">
                  📋 Research History (CORBA Transaction Log)
                </h2>
              </div>
              
              {history.map((item) => (
                <div key={item.id} className="bg-white border-4 border-[#808080] p-6 space-y-4">
                  {/* Query */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#800080]">
                        &gt;&gt; Research Query
                      </h3>
                      <span className="text-xs font-mono bg-[#c0c0c0] px-2 py-1 border-2 border-[#808080]">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-[#f0f0f0] border-2 border-[#808080] p-3 font-mono text-sm">
                      {item.query}
                    </div>
                  </div>
                  
                  {/* CORBA Processing Log */}
                  <div className="bg-black text-[#00ff00] p-3 font-mono text-xs">
                    <div>&gt; CORBA ORB: Marshalling request...</div>
                    <div>&gt; Invoking ResearchSystem::RetrievalAgent::retrieveDocuments()</div>
                    <div>&gt; Retrieved {item.documents.length} documents from repository</div>
                    <div>&gt; Invoking ResearchSystem::SummarizationAgent::summarizeDocument()</div>
                    <div>&gt; Invoking ResearchSystem::CitationAgent::generateCitations()</div>
                    <div>&gt; Invoking ResearchSystem::CoordinatorAgent::coordinateWorkflow()</div>
                    <div>&gt; Response unmarshalled successfully</div>
                  </div>
                  
                  {/* Retrieved Documents */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <h4 className="text-sm font-bold mb-2 text-[#0000ff]">
                      &gt;&gt; RETRIEVED DOCUMENTS:
                    </h4>
                    <div className="space-y-2">
                      {item.documents.map((doc) => (
                        <div key={doc.id} className="bg-[#f0f0f0] border-2 border-[#808080] p-3">
                          <div className="flex items-start justify-between">
                            <div className="font-mono text-sm">
                              <span className="text-[#0000ff] font-bold">[{doc.id}]</span> {doc.title}
                            </div>
                            <span className="text-xs bg-[#00ff00] text-black px-2 py-1 font-bold">
                              {Math.round(doc.relevance * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <h4 className="text-sm font-bold mb-2 text-[#008000]">
                      &gt;&gt; SUMMARY:
                    </h4>
                    <div className="bg-[#f0f0f0] border-2 border-[#808080] p-3 font-mono text-sm">
                      {item.summary}
                    </div>
                  </div>
                  
                  {/* Citations */}
                  <div className="border-t-2 border-dashed border-[#808080] pt-4">
                    <h4 className="text-sm font-bold mb-2">
                      &gt;&gt; CITATIONS:
                    </h4>
                    <div className="space-y-1">
                      {item.citations.map((citation, idx) => (
                        <div
                          key={idx}
                          className="text-sm px-3 py-2 bg-[#c0c0c0] border-2 border-[#808080] font-mono"
                        >
                          [{idx + 1}] {citation}
                        </div>
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
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2 text-[#008000]">
                No CORBA Transactions Yet
              </h3>
              <p className="text-sm mb-4">
                Submit a research query above to invoke the distributed agent objects
              </p>
              <div className="text-xs text-[#808080] font-mono">
                CORBA ORB Status: <span className="text-[#008000]">READY</span>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t-4 border-[#808080] p-4 text-center text-xs">
        <hr className="border-2 border-dashed border-black mb-4" />
        <p>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
          {' '}Best viewed in Netscape Navigator 2.0 or higher{' '}
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
        </p>
        <p className="mt-2">
          Powered by CORBA 2.0 • IIOP Protocol • IDL Interfaces
        </p>
        <p className="mt-2 animate-pulse">
          ⚠️ Under Construction ⚠️
        </p>
      </footer>
    </div>
  );
}
