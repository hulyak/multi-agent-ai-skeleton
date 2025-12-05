'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  SpookyFloatingBones,
  HauntedGhost,
  SkeletonCursor,
  CrawlingSpider,
  BloodDrip,
  HauntedBackground,
  GraveyardScene,
  FlyingBats,
  FlickeringLantern,
  CreepyEyes,
  MiniConjurations
} from '@/ui';

export default function Home() {
  return (
    <main className="landing-page spooky-theme relative" role="main" aria-label="CrewOS: CORBA Reborn Landing Page">
      {/* Haunted Background Effects */}
      <HauntedBackground />
      <GraveyardScene />
      
      {/* Spooky Effects */}
      <SpookyFloatingBones count={5} />
      <SkeletonCursor />
      <BloodDrip count={8} />
      <FlyingBats frequency={25} />
      
      {/* Floating Ghosts */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute top-20 left-10">
          <HauntedGhost size="md" delay={0} />
        </div>
        <div className="absolute top-40 right-20">
          <HauntedGhost size="lg" delay={2} />
        </div>
        <div className="absolute bottom-40 left-1/4">
          <HauntedGhost size="sm" delay={4} />
        </div>
      </div>
      
      {/* Crawling Spiders */}
      <CrawlingSpider startX={10} startY={20} delay={0} />
      <CrawlingSpider startX={80} startY={40} delay={5} />
      <CrawlingSpider startX={30} startY={70} delay={10} />
      
      {/* Flickering Lanterns */}
      <div className="fixed top-20 left-5 z-20 pointer-events-none">
        <FlickeringLantern />
      </div>
      <div className="fixed top-40 right-10 z-20 pointer-events-none">
        <FlickeringLantern />
      </div>
      
      {/* Creepy Eyes */}
      <div className="fixed top-1/3 left-0 z-20 opacity-30">
        <CreepyEyes />
      </div>
      <div className="fixed top-2/3 right-0 z-20 opacity-30">
        <CreepyEyes />
      </div>

      {/* Hero Section */}
      <section 
        className="flex flex-col items-center justify-center min-h-screen text-center relative z-10 px-6"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div
            className="text-9xl mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            💀
          </motion.div>
          
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              id="hero-heading"
              className="text-5xl md:text-6xl lg:text-7xl font-bold relative font-display tracking-tight"
            >
              <span className="bg-gradient-to-r from-spooky-accent-purple via-spooky-neon-accent to-spooky-accent-green bg-clip-text text-transparent">
                CrewOS Agents
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-spooky-text-secondary/90 font-display font-medium tracking-tight">
              Reviving 1990s distributed agents with Kiro specs
            </p>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-spooky-text-secondary/70 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Dead CORBA interfaces resurrected as living Kiro agents. Watch 10,000 lines of IDL become 50 lines of YAML.
          </motion.p>
          
          <motion.nav 
            aria-label="Demo applications" 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/apps/support" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-purple/50">
                💀 CORBA Support Router
              </button>
            </Link>
            
            <Link href="/apps/research" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-spooky-accent-green hover:bg-spooky-accent-green/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-green/50">
                👻 CORBA Research Agent
              </button>
            </Link>
            
            <Link href="/resurrection" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-spooky-neon-accent hover:bg-spooky-neon-accent/90 text-black rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-neon-accent/50">
                ⚡ Resurrection Lab (LIVE!)
              </button>
            </Link>
          </motion.nav>
        </div>
      </section>

      {/* What We Resurrected */}
      <section 
        className="py-24 px-6 relative z-10 bg-spooky-bg-secondary/30"
        aria-labelledby="resurrected-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="resurrected-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              What Died in 1995
            </h2>
            <p className="text-lg text-spooky-text-secondary/70 max-w-2xl mx-auto">
              CORBA's complexity killed distributed agents. We're bringing them back.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-purple/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-4">⚰️</div>
              <h3 className="text-xl font-bold text-spooky-accent-purple mb-3">
                CORBA IDL Complexity
              </h3>
              <p className="text-spooky-text-secondary/80 text-sm leading-relaxed">
                10,000+ lines of verbose IDL definitions. Required IDL compiler, stub generation, and ORB configuration just to get started.
              </p>
            </motion.article>
            
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-green/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-5xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-spooky-accent-green mb-3">
                Manual Stub Generation
              </h3>
              <p className="text-spooky-text-secondary/80 text-sm leading-relaxed">
                Every interface change required regenerating stubs in C++, Java, and Ada. Recompile everything. Deploy everywhere.
              </p>
            </motion.article>
            
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-orange/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-spooky-accent-orange mb-3">
                XML Configuration Hell
              </h3>
              <p className="text-spooky-text-secondary/80 text-sm leading-relaxed">
                Massive XML files for ORB configuration, naming services, and deployment descriptors. One typo = runtime failure.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section 
        className="py-24 px-6 relative z-10"
        aria-labelledby="comparison-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="comparison-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              From Legacy to Modern
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚰️</span>
                <h3 className="text-xl font-bold text-spooky-accent-purple">
                  Legacy IDL (1995)
                </h3>
              </div>
              <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-xs overflow-auto">
                <pre>{`// CORBA IDL
module SupportSystem {
  struct CustomerInquiry {
    string inquiryId;
    string customerId;
    string subject;
    long priority;
  };
  
  interface SupportAgent {
    IntentResult classifyIntent(
      in CustomerInquiry inquiry
    ) raises (Exception);
  };
};`}</pre>
              </div>
              <p className="text-xs text-spooky-text-muted mt-3">
                Requires IDL compiler, stub generation, ORB configuration...
              </p>
            </motion.div>
            
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✨</span>
                <h3 className="text-xl font-bold text-spooky-accent-green">
                  Kiro Spec (2024)
                </h3>
              </div>
              <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-xs overflow-auto">
                <pre>{`# .kiro/specs/support/design.md

## Agent: IntentDetection

**Input**: CustomerInquiry
**Output**: IntentResult

**Properties**:
- P1: Confidence > 0.7
- P2: Response < 500ms`}</pre>
              </div>
              <p className="text-xs text-spooky-text-muted mt-3">
                Hooks auto-generate TypeScript types and tests
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Applications */}
      <section 
        className="py-24 px-6 relative z-10 bg-spooky-bg-secondary/30"
        aria-labelledby="demos-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="demos-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              Resurrected Demos
            </h2>
            <p className="text-lg text-spooky-text-secondary/70 max-w-2xl mx-auto">
              Experience legacy agent patterns reborn with modern capabilities
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-purple/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-6xl mb-6 text-center">💀</div>
              <h3 className="text-2xl font-bold text-spooky-accent-purple mb-3 text-center">
                Legacy Support Console
              </h3>
              <p className="text-spooky-text-secondary/80 mb-6 text-center">
                Classic ticket router reborn with Kiro specs. Experience 1995 CORBA-style agents with modern LLM capabilities.
              </p>
              <Link href="/apps/support">
                <button className="w-full px-6 py-3 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105">
                  Open Support Demo →
                </button>
              </Link>
            </motion.article>
            
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-green/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-6xl mb-6 text-center">👻</div>
              <h3 className="text-2xl font-bold text-spooky-accent-green mb-3 text-center">
                Legacy Research Console
              </h3>
              <p className="text-spooky-text-secondary/80 mb-6 text-center">
                Old-school knowledge assistant, now powered by LLMs. Distributed document retrieval meets modern AI.
              </p>
              <Link href="/apps/research">
                <button className="w-full px-6 py-3 bg-spooky-accent-green hover:bg-spooky-accent-green/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105">
                  Open Research Demo →
                </button>
              </Link>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Mini Conjurations Demo */}
      <section 
        className="spooky-section py-20 px-6 relative z-10 bg-spooky-bg-secondary/30"
        aria-labelledby="conjurations-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            id="conjurations-heading"
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-spooky-text-primary font-gothic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            CORBA Resurrection in Action
          </motion.h2>
          
          <motion.p 
            className="text-center text-spooky-text-secondary mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Watch dead CORBA patterns come alive as modern Kiro agents
          </motion.p>
          
          <MiniConjurations />
        </div>
      </section>

      {/* How We Used Kiro */}
      <section 
        className="py-24 px-6 relative z-10"
        aria-labelledby="kiro-usage-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="kiro-usage-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              How We Used Kiro
            </h2>
            <p className="text-lg text-spooky-text-secondary/70 max-w-2xl mx-auto">
              Modern tooling for resurrecting legacy patterns
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📋</span>
                <h3 className="text-xl font-bold text-spooky-accent-purple">Specs</h3>
              </div>
              <p className="text-sm text-spooky-text-secondary/80 leading-relaxed">
                Legacy-style interfaces expressed as concise YAML/Markdown. Each agent has a spec defining inputs, outputs, and correctness properties.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🪝</span>
                <h3 className="text-xl font-bold text-spooky-accent-green">Hooks</h3>
              </div>
              <p className="text-sm text-spooky-text-secondary/80 leading-relaxed">
                Auto-convert specs to runtime TypeScript + property-based tests. Hooks validate on file save and regenerate types automatically.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h3 className="text-xl font-bold text-spooky-accent-orange">Steering</h3>
              </div>
              <p className="text-sm text-spooky-text-secondary/80 leading-relaxed">
                Enforces patterns so resurrected designs stay consistent. Steering docs guide agent behavior and maintain architectural integrity.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔌</span>
                <h3 className="text-xl font-bold text-spooky-neon-accent">MCP</h3>
              </div>
              <p className="text-sm text-spooky-text-secondary/80 leading-relaxed">
                Plugs old patterns into modern tools and APIs. Model Context Protocol enables agents to access external services seamlessly.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-spooky-text-muted mt-6">
              Built with 💀 for Kiroween 2024 • Resurrection Category
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation to All Pages */}
      <section 
        className="py-20 px-6 relative z-10 bg-spooky-bg-secondary/50 border-t border-spooky-border-subtle"
        aria-labelledby="nav-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="nav-heading"
              className="text-3xl md:text-4xl font-bold mb-4 text-spooky-text-primary"
            >
              Explore All Pages
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Main Demos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href="/apps/support">
                <button className="w-full px-6 py-3 bg-spooky-accent-purple hover:bg-spooky-accent-purple/90 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm">
                  💀 Support Agent
                </button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              <Link href="/apps/research">
                <button className="w-full px-6 py-3 bg-spooky-accent-green hover:bg-spooky-accent-green/90 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm">
                  👻 Research Agent
                </button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/resurrection">
                <button className="w-full px-6 py-3 bg-spooky-neon-accent hover:bg-spooky-neon-accent/90 text-black rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm">
                  ⚡ Resurrection Lab
                </button>
              </Link>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-center text-xs text-spooky-text-muted mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Start with the Resurrection Lab to convert CORBA IDL to Kiro specs.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
