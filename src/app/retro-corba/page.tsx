'use client';

import { useState } from 'react';

export default function RetroCORBADemo() {
  const [selectedAgent, setSelectedAgent] = useState<string>('router');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '> CORBA ORB initialized...',
    '> Naming Service connected on port 2809',
    '> Agent interfaces registered',
    '> System ready'
  ]);

  const agents = {
    router: {
      name: 'RouterAgent',
      module: 'RouterSystem',
      methods: ['routeMessage', 'registerAgent', 'getWorkflowState', 'handleError']
    },
    support: {
      name: 'SupportAgent',
      module: 'SupportSystem',
      methods: ['classifyIntent', 'searchFAQ', 'createTicket', 'escalateTicket']
    },
    research: {
      name: 'ResearchAgent',
      module: 'ResearchSystem',
      methods: ['retrieveDocuments', 'summarizeDocument', 'generateCitations']
    }
  };

  const invokeMethod = (method: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [
      ...prev,
      `[${timestamp}] Invoking ${agents[selectedAgent as keyof typeof agents].module}::${agents[selectedAgent as keyof typeof agents].name}::${method}()`,
      `[${timestamp}] Request marshalled to IIOP`,
      `[${timestamp}] Response received: SUCCESS`,
      ''
    ]);
  };

  return (
    <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono">
      {/* Window Title Bar */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <span>CORBA Multi-Agent System - Netscape Navigator</span>
          </div>
          <div className="flex gap-1">
            <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">_</button>
            <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">□</button>
            <button className="bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black">✕</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border-4 border-[#808080] p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ 
              textShadow: '2px 2px #ff00ff, 4px 4px #00ffff',
              color: '#ff0000'
            }}>
              🌐 CORBA Multi-Agent System 🌐
            </h1>
            <p className="text-sm">
              <blink className="animate-pulse">*** Powered by CORBA 2.0 ***</blink>
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%23000' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ENetscape%3C/text%3E%3C/svg%3E" alt="Netscape Now" />
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='31'%3E%3Crect fill='%230000ff' width='88' height='31'/%3E%3Ctext x='44' y='20' fill='%23fff' font-family='monospace' font-size='12' text-anchor='middle'%3ECORBA 2.0%3C/text%3E%3C/svg%3E" alt="CORBA 2.0" />
            </div>
          </div>

          <hr className="border-2 border-dashed border-black mb-6" />

          {/* Agent Selection */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-[#000080]">
              ⚙️ Select Agent Interface
            </h2>
            <div className="flex gap-4">
              {Object.entries(agents).map(([key, agent]) => (
                <button
                  key={key}
                  onClick={() => setSelectedAgent(key)}
                  className={`px-4 py-2 border-4 font-bold ${
                    selectedAgent === key
                      ? 'bg-[#000080] text-white border-[#000080]'
                      : 'bg-[#c0c0c0] border-white border-b-black border-r-black'
                  }`}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>

          {/* IDL Interface Display */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#008000]">
              📄 IDL Interface: {agents[selectedAgent as keyof typeof agents].module}
            </h3>
            <div className="bg-black text-[#00ff00] p-4 font-mono text-sm overflow-auto">
              <pre>{`module ${agents[selectedAgent as keyof typeof agents].module} {
  interface ${agents[selectedAgent as keyof typeof agents].name} {
${agents[selectedAgent as keyof typeof agents].methods.map(m => `    void ${m}();`).join('\n')}
  };
};`}</pre>
            </div>
          </div>

          {/* Method Invocation */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#800080]">
              🔧 Invoke Methods
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {agents[selectedAgent as keyof typeof agents].methods.map(method => (
                <button
                  key={method}
                  onClick={() => invokeMethod(method)}
                  className="bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-4 py-2 hover:bg-[#a0a0a0] active:border-black active:border-b-white active:border-r-white"
                >
                  {method}()
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Output */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#ff0000]">
              💻 CORBA ORB Terminal
            </h3>
            <div className="bg-black text-[#00ff00] p-4 font-mono text-xs h-64 overflow-auto">
              {terminalOutput.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              <div className="animate-pulse inline-block">█</div>
            </div>
            <button
              onClick={() => setTerminalOutput(['> Terminal cleared', '> System ready'])}
              className="mt-2 bg-[#c0c0c0] border-4 border-white border-b-black border-r-black px-4 py-1"
            >
              Clear Terminal
            </button>
          </div>

          {/* Info Section */}
          <div className="bg-[#ffff00] border-4 border-black p-4">
            <h3 className="text-xl font-bold mb-2">ℹ️ About This System</h3>
            <p className="mb-2">
              This multi-agent system uses <strong>CORBA (Common Object Request Broker Architecture)</strong> 
              for distributed object communication. Each agent is a CORBA object with an IDL-defined interface.
            </p>
            <p className="text-sm">
              <strong>Technology Stack (1995):</strong> CORBA 2.0, IIOP Protocol, Naming Service, 
              IDL Compiler, C++/Java Stubs
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs">
            <hr className="border-2 border-dashed border-black mb-4" />
            <p>
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
              {' '}Best viewed in Netscape Navigator 2.0 or higher{' '}
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext y='15' font-size='16'%3E🔥%3C/text%3E%3C/svg%3E" alt="fire" className="inline" />
            </p>
            <p className="mt-2">
              This page has been visited <span className="bg-red-600 text-white px-2">42,069</span> times
            </p>
            <p className="mt-2 animate-pulse">
              ⚠️ Under Construction ⚠️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
