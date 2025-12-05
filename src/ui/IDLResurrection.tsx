'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resurrectIDL } from '@/utils/idl-parser';

// Syntax highlighting helpers
const highlightIDL = (code: string): React.ReactElement => {
  const lines = code.split('\n');
  
  return (
    <>
      {lines.map((line, idx) => {
        // Comments
        if (line.trim().startsWith('//')) {
          return <div key={idx} className="text-gray-500">{line}</div>;
        }
        if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          return <div key={idx} className="text-gray-500">{line}</div>;
        }
        
        // Keywords
        const highlighted = line
          .replace(/\b(module|interface|struct|exception|sequence|in|out|inout|raises|void|string|long|short|double|float|boolean|any)\b/g, 
            '<span class="text-spooky-accent-purple font-bold">$1</span>')
          // Type names (capitalized words)
          .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, 
            '<span class="text-spooky-accent-green">$1</span>')
          // Braces and punctuation
          .replace(/([{}();,<>])/g, 
            '<span class="text-spooky-neon-accent">$1</span>');
        
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />;
      })}
    </>
  );
};

const highlightYAML = (code: string): React.ReactElement => {
  const lines = code.split('\n');
  
  return (
    <>
      {lines.map((line, idx) => {
        // Comments
        if (line.trim().startsWith('#')) {
          return <div key={idx} className="text-gray-500 italic">{line}</div>;
        }
        
        // Separator
        if (line.trim() === '---') {
          return <div key={idx} className="text-spooky-accent-orange font-bold">{line}</div>;
        }
        
        // Keys (before colon)
        const highlighted = line
          .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, 
            '$1<span class="text-spooky-accent-purple font-bold">$2</span>:')
          // String values (in quotes)
          .replace(/"([^"]*)"/g, 
            '<span class="text-spooky-accent-green">"$1"</span>')
          // Array indicators
          .replace(/^(\s*)(- )/g, 
            '$1<span class="text-spooky-neon-accent">$2</span>');
        
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />;
      })}
    </>
  );
};

interface ResurrectionState {
  status: 'idle' | 'parsing' | 'converting' | 'complete';
  idlContent: string;
  yamlSpecs: string[];
  agentNames: string[];
}

export const IDLResurrection: React.FC = () => {
  const [state, setState] = useState<ResurrectionState>({
    status: 'idle',
    idlContent: '',
    yamlSpecs: [],
    agentNames: []
  });

  // Announce state changes to screen readers - Requirement: 5.1, 5.2, 5.3, 5.4
  const getStatusMessage = () => {
    switch (state.status) {
      case 'parsing':
        return 'Parsing CORBA IDL file. Please wait.';
      case 'converting':
        return 'Converting to Kiro YAML specifications. Please wait.';
      case 'complete':
        return `Resurrection complete! ${state.agentNames.length} agent${state.agentNames.length !== 1 ? 's' : ''} successfully converted.`;
      default:
        return '';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      
      // Start resurrection animation
      setState({ status: 'parsing', idlContent: content, yamlSpecs: [], agentNames: [] });
      
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'converting' }));
        
        setTimeout(() => {
          try {
            const result = resurrectIDL(content);
            if (!result || !result.specs || !result.yaml) {
              throw new Error('Invalid resurrection result');
            }
            const agentNames = result.specs.map(s => s.agent);
            
            // Ensure we have valid data
            if (agentNames.length === 0) {
              throw new Error('No agents found in IDL file');
            }
            
            setState({
              status: 'complete',
              idlContent: content,
              yamlSpecs: result.yaml,
              agentNames
            });
          } catch (error) {
            console.error('Resurrection failed:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error parsing IDL: ${errorMsg}`);
            setState({ status: 'idle', idlContent: '', yamlSpecs: [], agentNames: [] });
          }
        }, 800);
      }, 600);
    } catch (error) {
      console.error('File read failed:', error);
      setState({ status: 'idle', idlContent: '', yamlSpecs: [], agentNames: [] });
    }
  };

  const loadDemoIDL = async (filename: string) => {
    try {
      const response = await fetch(`/demo/corba-idl/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load demo: ${response.statusText}`);
      }
      const content = await response.text();
      
      setState({ status: 'parsing', idlContent: content, yamlSpecs: [], agentNames: [] });
      
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'converting' }));
        
        setTimeout(() => {
          try {
            const result = resurrectIDL(content);
            if (!result || !result.specs || !result.yaml) {
              throw new Error('Invalid resurrection result');
            }
            const agentNames = result.specs.map(s => s.agent);
            
            // Ensure we have valid data
            if (agentNames.length === 0) {
              throw new Error('No agents found in IDL file');
            }
            
            setState({
              status: 'complete',
              idlContent: content,
              yamlSpecs: result.yaml,
              agentNames
            });
          } catch (error) {
            console.error('Demo resurrection failed:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Full error:', error);
            alert(`Error parsing demo IDL: ${errorMsg}`);
            setState({ status: 'idle', idlContent: '', yamlSpecs: [], agentNames: [] });
          }
        }, 800);
      }, 600);
    } catch (error) {
      console.error('Failed to load demo:', error);
      alert(`Failed to load demo file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadSpec = (yaml: string, agentName: string) => {
    // Requirements: 6.1, 6.2, 6.3, 6.4
    // Generate filename based on agent name with .yaml extension
    const filename = `${agentName}.yaml`;
    
    // Create blob from YAML content
    const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="w-full max-w-6xl mx-auto"
      role="region"
      aria-label="IDL Resurrection Tool"
    >
      {/* Screen reader announcements for state changes - Requirement: 5.4 */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {getStatusMessage()}
      </div>
      {/* Upload Area */}
      {state.status === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="border-4 border-dashed border-spooky-accent-purple/50 rounded-2xl p-12 bg-spooky-bg-secondary/50 backdrop-blur-sm hover:border-spooky-accent-purple transition-colors">
            <div className="text-6xl mb-4">⚰️</div>
            <h3 className="text-2xl font-bold text-spooky-text-primary mb-4">
              Drop Dead CORBA IDL Here
            </h3>
            <p className="text-spooky-text-secondary mb-6">
              Watch 10,000 lines of legacy IDL become 50 lines of living Kiro YAML
            </p>
            
            <label 
              className="inline-block px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium cursor-pointer transition-all duration-200 hover:scale-105"
              htmlFor="idl-file-upload"
              aria-label="Upload CORBA IDL file"
            >
              <input
                id="idl-file-upload"
                type="file"
                accept=".idl"
                onChange={handleFileUpload}
                className="hidden"
                aria-describedby="file-upload-description"
              />
              Choose IDL File
            </label>
            <p id="file-upload-description" className="sr-only">
              Upload a CORBA IDL file to convert it to Kiro YAML specifications
            </p>
            
            <div className="mt-8">
              <p className="text-sm text-spooky-text-muted mb-4">Or try a demo:</p>
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <button
                  onClick={() => loadDemoIDL('SupportAgent.idl')}
                  className="px-4 py-3 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-all hover:scale-105 text-left"
                  aria-label="Load Support Agent demo - Customer support with intent classification, FAQ search, and ticket management"
                >
                  <div className="font-bold text-spooky-text-primary mb-1">Support Agent</div>
                  <div className="text-xs text-spooky-text-muted">Customer support with intent classification, FAQ search, and ticket management</div>
                </button>
                <button
                  onClick={() => loadDemoIDL('ResearchAgent.idl')}
                  className="px-4 py-3 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-all hover:scale-105 text-left"
                  aria-label="Load Research Agent demo - Academic research with document retrieval, summarization, and citation generation"
                >
                  <div className="font-bold text-spooky-text-primary mb-1">Research Agent</div>
                  <div className="text-xs text-spooky-text-muted">Academic research with document retrieval, summarization, and citation generation</div>
                </button>
                <button
                  onClick={() => loadDemoIDL('RouterAgent.idl')}
                  className="px-4 py-3 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-all hover:scale-105 text-left"
                  aria-label="Load Router Agent demo - Message routing with agent registration, discovery, and availability checking"
                >
                  <div className="font-bold text-spooky-text-primary mb-1">Router Agent</div>
                  <div className="text-xs text-spooky-text-muted">Message routing with agent registration, discovery, and availability checking</div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Parsing Animation - Requirements: 5.1, 5.3 */}
      <AnimatePresence>
        {state.status === 'parsing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity, 
                ease: 'linear',
                // Respect prefers-reduced-motion
                ...(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                  ? { duration: 0, repeat: 0 } 
                  : {})
              }}
              className="text-8xl mb-6"
            >
              💀
            </motion.div>
            <motion.h3 
              className="text-3xl font-bold text-spooky-accent-purple mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Parsing Dead IDL...
            </motion.h3>
            <motion.div 
              className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                &gt; Reading CORBA IDL file...
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                &gt; Extracting interfaces...
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                &gt; Parsing method signatures...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Converting Animation - Requirements: 5.2, 5.3 */}
      <AnimatePresence>
        {state.status === 'converting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3],
                rotate: 360
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity,
                ease: 'easeInOut',
                // Respect prefers-reduced-motion
                ...(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                  ? { duration: 0, repeat: 0 } 
                  : {})
              }}
              className="text-8xl mb-6"
            >
              ⚡
            </motion.div>
            <motion.h3 
              className="text-3xl font-bold text-spooky-neon-accent mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Resurrecting Agents...
            </motion.h3>
            <motion.div 
              className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                &gt; Converting to Kiro YAML...
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                &gt; Generating agent specs...
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                &gt; Breathing life into dead code...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete - Show Results */}
      <AnimatePresence>
        {state.status === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Celebration - Requirements: 5.3 */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1,
                  rotate: 0
                }}
                transition={{ 
                  type: 'tween',
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                className="text-8xl mb-4"
              >
                ✨
              </motion.div>
              <motion.h3 
                className="text-3xl font-bold text-spooky-accent-green mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Resurrection Complete!
              </motion.h3>
              <motion.p 
                className="text-spooky-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {state.agentNames.length} agent{state.agentNames.length !== 1 ? 's' : ''} brought back to life
              </motion.p>
              
              {/* Celebration particles */}
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{ 
                      x: '50%', 
                      y: '50%',
                      opacity: 1,
                      scale: 0
                    }}
                    animate={{ 
                      x: `${50 + Math.cos(i * Math.PI / 4) * 40}%`,
                      y: `${50 + Math.sin(i * Math.PI / 4) * 40}%`,
                      opacity: 0,
                      scale: 1
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: 0.3,
                      ease: 'easeOut',
                      // Respect prefers-reduced-motion
                      ...(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                        ? { duration: 0, opacity: 0 } 
                        : {})
                    }}
                  >
                    {['✨', '⚡', '💀', '👻'][i % 4]}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dead IDL */}
              <div className="bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="coffin">⚰️</span>
                  <h4 className="text-xl font-bold text-spooky-accent-purple">Dead CORBA IDL</h4>
                </div>
                <div 
                  className="bg-black p-4 rounded-lg font-mono text-xs overflow-auto max-h-96 leading-relaxed"
                  role="region"
                  aria-label="Original CORBA IDL code"
                  tabIndex={0}
                >
                  {highlightIDL(state.idlContent)}
                </div>
                <p className="text-xs text-spooky-text-muted mt-3">
                  {state.idlContent.split('\n').length} lines of legacy complexity
                </p>
              </div>

              {/* Living Kiro YAML */}
              <div className="bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="sparkles">✨</span>
                  <h4 className="text-xl font-bold text-spooky-accent-green">Living Kiro YAML</h4>
                </div>
                <div 
                  className="bg-black p-4 rounded-lg font-mono text-xs overflow-auto max-h-96 leading-relaxed"
                  role="region"
                  aria-label="Generated Kiro YAML specifications"
                  tabIndex={0}
                >
                  {highlightYAML(state.yamlSpecs.join('\n\n---\n\n'))}
                </div>
                <p className="text-xs text-spooky-text-muted mt-3">
                  {state.yamlSpecs.join('\n').split('\n').length} lines of modern simplicity
                </p>
              </div>
            </div>

            {/* Resurrected Agents */}
            <div className="bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-6">
              <h4 className="text-xl font-bold text-spooky-text-primary mb-4">
                Resurrected Agents
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.agentNames.map((name, idx) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-spooky-accent-green/10 border border-spooky-accent-green/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-spooky-accent-green font-bold text-lg">
                        ✓ {name}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadSpec(state.yamlSpecs[idx], name)}
                      className="w-full px-4 py-2 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      aria-label={`Download ${name} spec`}
                    >
                      <span>📥</span>
                      <span>Download YAML</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setState({ status: 'idle', idlContent: '', yamlSpecs: [], agentNames: [] })}
                className="px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                aria-label="Reset and resurrect another IDL file"
              >
                Resurrect Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
