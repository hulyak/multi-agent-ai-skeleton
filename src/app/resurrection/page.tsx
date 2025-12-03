'use client';

import Link from 'next/link';
import { IDLResurrection } from '@/ui';

export default function ResurrectionPage() {
  return (
    <div className="min-h-screen bg-spooky-bg-primary">
      {/* Header */}
      <header className="border-b border-spooky-border-subtle bg-spooky-bg-secondary/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-spooky-text-primary mb-2 font-display tracking-tight">
              ⚡ CORBA Resurrection Lab
            </h1>
            <p className="text-spooky-text-secondary/60 text-lg">
              Watch dead IDL become living Kiro agents
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
        <div className="max-w-7xl mx-auto">
          {/* Info Banner */}
          <div className="bg-spooky-accent-purple/10 border border-spooky-accent-purple/30 rounded-2xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-spooky-accent-purple mb-3">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-3xl mb-2">⚰️</div>
                <h3 className="font-bold text-spooky-text-primary mb-2">1. Dead CORBA IDL</h3>
                <p className="text-spooky-text-secondary">
                  Upload your legacy CORBA IDL files from the 1990s. 10,000+ lines of verbose interface definitions.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-spooky-text-primary mb-2">2. Kiro Resurrection</h3>
                <p className="text-spooky-text-secondary">
                  Our parser extracts interfaces, methods, and types, then converts them to concise Kiro YAML specs.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-bold text-spooky-text-primary mb-2">3. Living Agents</h3>
                <p className="text-spooky-text-secondary">
                  50 lines of modern YAML. Ready to run with Kiro hooks, TypeScript types, and JSON message bus.
                </p>
              </div>
            </div>
          </div>

          {/* Resurrection Component */}
          <IDLResurrection />

          {/* Technical Details */}
          <div className="mt-12 bg-spooky-bg-secondary/50 border border-spooky-border-subtle rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-spooky-text-primary mb-6">
              What Gets Resurrected
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-spooky-accent-green mb-3">From CORBA IDL:</h3>
                <ul className="space-y-2 text-spooky-text-secondary">
                  <li>✓ Module declarations</li>
                  <li>✓ Interface definitions</li>
                  <li>✓ Method signatures (in/out/inout params)</li>
                  <li>✓ Struct and exception types</li>
                  <li>✓ Raises clauses</li>
                  <li>✓ Return types</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-spooky-accent-purple mb-3">To Kiro YAML:</h3>
                <ul className="space-y-2 text-spooky-text-secondary">
                  <li>✓ Agent specifications</li>
                  <li>✓ Input/output types</li>
                  <li>✓ Method definitions</li>
                  <li>✓ Type definitions</li>
                  <li>✓ Error handling</li>
                  <li>✓ Ready for hooks & code generation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
