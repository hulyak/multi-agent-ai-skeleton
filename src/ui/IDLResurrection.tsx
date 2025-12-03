'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resurrectIDL } from '@/utils/idl-parser';

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    
    // Start resurrection animation
    setState({ ...state, status: 'parsing', idlContent: content });
    
    setTimeout(() => {
      setState(prev => ({ ...prev, status: 'converting' }));
      
      setTimeout(() => {
        try {
          const { specs, yaml } = resurrectIDL(content);
          const agentNames = specs.map(s => s.agent);
          
          setState({
            status: 'complete',
            idlContent: content,
            yamlSpecs: yaml,
            agentNames
          });
        } catch (error) {
          console.error('Resurrection failed:', error);
          setState(prev => ({ ...prev, status: 'idle' }));
        }
      }, 1500);
    }, 1000);
  };

  const loadDemoIDL = async (filename: string) => {
    try {
      const response = await fetch(`/demo/corba-idl/${filename}`);
      const content = await response.text();
      
      setState({ ...state, status: 'parsing', idlContent: content });
      
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'converting' }));
        
        setTimeout(() => {
          const { specs, yaml } = resurrectIDL(content);
          const agentNames = specs.map(s => s.agent);
          
          setState({
            status: 'complete',
            idlContent: content,
            yamlSpecs: yaml,
            agentNames
          });
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error('Failed to load demo:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
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
            
            <label className="inline-block px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium cursor-pointer transition-all duration-200 hover:scale-105">
              <input
                type="file"
                accept=".idl"
                onChange={handleFileUpload}
                className="hidden"
              />
              Choose IDL File
            </label>
            
            <div className="mt-8">
              <p className="text-sm text-spooky-text-muted mb-4">Or try a demo:</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => loadDemoIDL('SupportAgent.idl')}
                  className="px-4 py-2 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-colors"
                >
                  Support Agent
                </button>
                <button
                  onClick={() => loadDemoIDL('ResearchAgent.idl')}
                  className="px-4 py-2 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-colors"
                >
                  Research Agent
                </button>
                <button
                  onClick={() => loadDemoIDL('RouterAgent.idl')}
                  className="px-4 py-2 bg-spooky-bg-tertiary border border-spooky-border-subtle rounded-lg hover:border-spooky-accent-green transition-colors"
                >
                  Router Agent
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Parsing Animation */}
      <AnimatePresence>
        {state.status === 'parsing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-8xl mb-6"
            >
              💀
            </motion.div>
            <h3 className="text-3xl font-bold text-spooky-accent-purple mb-4">
              Parsing Dead IDL...
            </h3>
            <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm max-w-2xl mx-auto">
              <div className="animate-pulse">&gt; Reading CORBA IDL file...</div>
              <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>&gt; Extracting interfaces...</div>
              <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>&gt; Parsing method signatures...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Converting Animation */}
      <AnimatePresence>
        {state.status === 'converting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              ⚡
            </motion.div>
            <h3 className="text-3xl font-bold text-spooky-neon-accent mb-4">
              Resurrecting Agents...
            </h3>
            <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm max-w-2xl mx-auto">
              <div className="animate-pulse">&gt; Converting to Kiro YAML...</div>
              <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>&gt; Generating agent specs...</div>
              <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>&gt; Breathing life into dead code...</div>
            </div>
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
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="text-8xl mb-4"
              >
                ✨
              </motion.div>
              <h3 className="text-3xl font-bold text-spooky-accent-green mb-2">
                Resurrection Complete!
              </h3>
              <p className="text-spooky-text-secondary">
                {state.agentNames.length} agent{state.agentNames.length !== 1 ? 's' : ''} brought back to life
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dead IDL */}
              <div className="bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">⚰️</span>
                  <h4 className="text-xl font-bold text-spooky-accent-purple">Dead CORBA IDL</h4>
                </div>
                <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                  <pre>{state.idlContent}</pre>
                </div>
                <p className="text-xs text-spooky-text-muted mt-3">
                  {state.idlContent.split('\n').length} lines of legacy complexity
                </p>
              </div>

              {/* Living Kiro YAML */}
              <div className="bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✨</span>
                  <h4 className="text-xl font-bold text-spooky-accent-green">Living Kiro YAML</h4>
                </div>
                <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                  <pre>{state.yamlSpecs.join('\n\n---\n\n')}</pre>
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
              <div className="flex flex-wrap gap-3">
                {state.agentNames.map((name, idx) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-4 py-2 bg-spooky-accent-green/10 border border-spooky-accent-green/30 rounded-lg text-spooky-accent-green font-medium"
                  >
                    ✓ {name}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setState({ status: 'idle', idlContent: '', yamlSpecs: [], agentNames: [] })}
                className="px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
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
