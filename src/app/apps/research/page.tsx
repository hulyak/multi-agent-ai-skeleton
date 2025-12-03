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

interface Document {
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
}

interface ResearchResult {
  id: string;
  query: string;
  documents: Document[];
  summary: string;
  citations: string[];
  timestamp: Date;
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simulate agent processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockDocs: Document[] = [
      {
        id: 'doc-1',
        title: 'Multi-Agent Systems: A Survey',
        excerpt: 'This paper provides a comprehensive overview of multi-agent systems, including coordination mechanisms, communication protocols, and real-world applications...',
        relevance: 0.95
      },
      {
        id: 'doc-2',
        title: 'Event-Driven Architecture Patterns',
        excerpt: 'Event-driven architectures enable loose coupling between components through asynchronous message passing. This approach is particularly effective for...',
        relevance: 0.88
      },
      {
        id: 'doc-3',
        title: 'AI Agent Orchestration Best Practices',
        excerpt: 'Orchestrating multiple AI agents requires careful consideration of state management, error handling, and resource allocation. Key patterns include...',
        relevance: 0.82
      }
    ];
    
    const newResult: ResearchResult = {
      id: `result-${Date.now()}`,
      query: query.trim(),
      documents: mockDocs,
      summary: generateSummary(query, mockDocs),
      citations: mockDocs.map(d => d.title),
      timestamp: new Date()
    };
    
    setResults(prev => [newResult, ...prev]);
    setQuery('');
    setIsProcessing(false);
  };
  
  const generateSummary = (q: string, docs: Document[]): string => {
    return `Based on ${docs.length} relevant documents, multi-agent systems utilize event-driven architectures to coordinate autonomous agents. Key findings include the importance of message bus patterns for agent communication, shared state management for context preservation, and robust error handling mechanisms. These systems excel at complex workflows requiring specialized capabilities distributed across multiple agents.`;
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
        <div className="absolute top-24 left-16">
          <HauntedGhost size="lg" delay={0} />
        </div>
        <div className="absolute bottom-32 right-24">
          <HauntedGhost size="md" delay={4} />
        </div>
      </div>
      
      {/* Crawling Spiders */}
      <CrawlingSpider startX={15} startY={25} delay={1} />
      <CrawlingSpider startX={75} startY={55} delay={7} />
      
      {/* Header */}
      <header className="border-b border-spooky-border-subtle bg-spooky-bg-secondary/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-spooky-text-primary font-gothic">
              👻 Research Copilot
            </h1>
            <p className="text-spooky-text-secondary mt-1">
              AI-powered research with document retrieval and summarization
            </p>
          </div>
          <Link href="/">
            <SpookyButton variant="ghost" size="sm">
              ← Back to Home
            </SpookyButton>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="spooky-section">
        <div className="max-w-5xl mx-auto">
          {/* Query Input */}
          <SpookyCard className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="research-query" 
                  className="block text-sm font-semibold text-spooky-text-primary mb-2"
                >
                  What would you like to research?
                </label>
                <textarea
                  id="research-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your research question or topic..."
                  className="w-full px-4 py-3 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg text-spooky-text-primary placeholder-spooky-text-muted focus:outline-none focus:ring-2 focus:ring-spooky-accent-green focus:border-transparent resize-none"
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex justify-end">
                <NeonPulseButton
                  type="submit"
                  variant="green"
                  disabled={!query.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <SpookySpinner size="sm" />
                      Researching...
                    </span>
                  ) : (
                    'Start Research'
                  )}
                </NeonPulseButton>
              </div>
            </form>
          </SpookyCard>
          
          {/* Agent Workflow Info */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Retrieval', icon: '🔍', desc: 'Finds relevant docs' },
              { name: 'Ranking', icon: '📊', desc: 'Scores by relevance' },
              { name: 'Summarization', icon: '📝', desc: 'Synthesizes info' },
              { name: 'Citation', icon: '🔗', desc: 'Tracks sources' }
            ].map((agent, idx) => (
              <div
                key={idx}
                className="bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-4 text-center hover:border-spooky-accent-green transition-colors"
              >
                <div className="text-3xl mb-2">{agent.icon}</div>
                <div className="text-sm font-semibold text-spooky-text-primary mb-1">
                  {agent.name}
                </div>
                <div className="text-xs text-spooky-text-muted">
                  {agent.desc}
                </div>
              </div>
            ))}
          </div>
          
          {/* Research Results */}
          {results.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-spooky-text-primary mb-4">
                Research Results
              </h2>
              
              {results.map((result) => (
                <SpookyCard key={result.id} className="space-y-6">
                  {/* Query */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-spooky-accent-green">
                        Research Query
                      </h3>
                      <span className="text-xs text-spooky-text-muted font-mono">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-spooky-text-secondary">
                      {result.query}
                    </p>
                  </div>
                  
                  {/* Summary */}
                  <div className="border-t border-spooky-border-subtle pt-4">
                    <h4 className="text-sm font-semibold text-spooky-accent-purple mb-3">
                      Summary
                    </h4>
                    <p className="text-spooky-text-secondary leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                  
                  {/* Retrieved Documents */}
                  <div className="border-t border-spooky-border-subtle pt-4">
                    <h4 className="text-sm font-semibold text-spooky-text-muted mb-3">
                      Retrieved Documents ({result.documents.length})
                    </h4>
                    <div className="space-y-3">
                      {result.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-spooky-text-primary">
                              {doc.title}
                            </h5>
                            <span className="text-xs px-2 py-1 bg-spooky-bg-secondary text-spooky-accent-green rounded border border-spooky-border-subtle">
                              {Math.round(doc.relevance * 100)}% match
                            </span>
                          </div>
                          <p className="text-sm text-spooky-text-secondary">
                            {doc.excerpt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Citations */}
                  <div className="border-t border-spooky-border-subtle pt-4">
                    <h4 className="text-sm font-semibold text-spooky-text-muted mb-2">
                      Citations
                    </h4>
                    <ol className="space-y-1">
                      {result.citations.map((citation, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-spooky-text-secondary"
                        >
                          [{idx + 1}] {citation}
                        </li>
                      ))}
                    </ol>
                  </div>
                </SpookyCard>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {results.length === 0 && !isProcessing && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-spooky-text-primary mb-2">
                No research yet
              </h3>
              <p className="text-spooky-text-secondary">
                Enter a research query above to see document retrieval and summarization in action
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
