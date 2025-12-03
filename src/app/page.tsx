'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  AnatomicalSkeleton, 
  MiniConjurations, 
  SpookyFloatingBones,
  HauntedGhost,
  SkeletonCursor,
  CrawlingSpider,
  BloodDrip,
  HauntedBackground,
  GraveyardScene,
  FlyingBats
} from '@/ui';

export default function Home() {
  return (
    <main className="landing-page spooky-theme relative" role="main" aria-label="Multi-Agent AI Skeleton Landing Page">
      {/* Haunted Background Effects */}
      <HauntedBackground />
      <GraveyardScene />
      
      {/* Scary Halloween Effects */}
      <SpookyFloatingBones count={5} />
      <SkeletonCursor />
      <BloodDrip count={10} />
      
      {/* Easter Egg: Flying Bats */}
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
        <div className="absolute top-1/3 right-1/3">
          <HauntedGhost size="md" delay={6} />
        </div>
      </div>
      
      {/* Crawling Spiders */}
      <CrawlingSpider startX={10} startY={20} delay={0} />
      <CrawlingSpider startX={80} startY={40} delay={5} />
      <CrawlingSpider startX={30} startY={70} delay={10} />
      
      {/* Spectral mist effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(106, 27, 154, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(56, 142, 60, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4
          }}
        />
      </div>
      {/* Hero Section with Modern Clean Design */}
      <section 
        className="flex flex-col items-center justify-center min-h-screen text-center relative z-10 px-6"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Subtle floating skull particles */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${35 + (i % 2) * 20}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeInOut'
                }}
              >
                💀
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              id="hero-heading"
              className="text-6xl md:text-7xl lg:text-8xl font-bold relative font-display tracking-tight"
            >
              <span className="bg-gradient-to-r from-spooky-accent-purple via-spooky-neon-accent to-spooky-accent-green bg-clip-text text-transparent">
                Multi-Agent Skeleton
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-spooky-text-secondary/90 font-display font-medium tracking-tight">
              Build Your Wicked AI Crew
            </p>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-spooky-text-secondary/70 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            A production-ready framework for building multi-agent AI systems. Orchestrate autonomous agents with event-driven architecture, shared state, and robust error handling.
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
                💀 Support Copilot
              </button>
            </Link>
            
            <Link href="/apps/research" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-spooky-accent-green hover:bg-spooky-accent-green/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-green/50">
                👻 Research Copilot
              </button>
            </Link>
            
            <Link href="/multi-agent-demo" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-spooky-accent-orange hover:bg-spooky-accent-orange/90 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-spooky-accent-orange/50">
                🎃 Interactive Demo
              </button>
            </Link>
          </motion.nav>
          
          {/* Modern stats cards */}
          <motion.div
            className="grid grid-cols-3 gap-6 pt-16 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6 hover:border-spooky-accent-purple/50 transition-colors">
              <div className="text-4xl font-bold text-spooky-accent-purple mb-2">6+</div>
              <div className="text-sm text-spooky-text-muted">Specialized Agents</div>
            </div>
            <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6 hover:border-spooky-accent-green/50 transition-colors">
              <div className="text-4xl font-bold text-spooky-accent-green mb-2">2</div>
              <div className="text-sm text-spooky-text-muted">Demo Apps</div>
            </div>
            <div className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6 hover:border-spooky-neon-accent/50 transition-colors">
              <div className="text-4xl font-bold text-spooky-neon-accent mb-2">100%</div>
              <div className="text-sm text-spooky-text-muted">Open Source</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skeleton Network Section */}
      <section 
        className="spooky-section py-20 px-6 relative z-10"
        aria-labelledby="network-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            id="network-heading"
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-spooky-text-primary font-gothic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The Skeleton Network
          </motion.h2>
          
          <motion.p 
            className="text-center text-spooky-text-secondary mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Six bone joints connected by pulsating neural pathways. Hover to reveal each agent's dark powers, click to learn their secrets.
          </motion.p>
          
          <motion.div
            className="bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-8 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <AnatomicalSkeleton />
            
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-spooky-accent-purple/5 via-transparent to-spooky-accent-green/5 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Runtime Architecture Section */}
      <section 
        className="py-24 px-6 relative z-10 bg-spooky-bg-secondary/30"
        aria-labelledby="runtime-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="runtime-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              Skeleton Runtime Architecture
            </h2>
            <p className="text-lg text-spooky-text-secondary/70 max-w-2xl mx-auto">
              Event-driven architecture for scalable agent coordination
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-purple/50 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-spooky-accent-purple/10 flex items-center justify-center text-2xl">
                  🔄
                </div>
                <h3 className="text-2xl font-bold text-spooky-accent-purple">
                  Message Bus
                </h3>
              </div>
              <p className="text-spooky-text-secondary/80 leading-relaxed">
                The central communication hub that enables agents to exchange messages through a pub/sub pattern. 
                Agents publish events and subscribe to topics, allowing loose coupling and flexible orchestration.
              </p>
            </motion.article>
            
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-green/50 transition-all duration-300"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-spooky-accent-green/10 flex items-center justify-center text-2xl">
                  💾
                </div>
                <h3 className="text-2xl font-bold text-spooky-accent-green">
                  Shared State
                </h3>
              </div>
              <p className="text-spooky-text-secondary/80 leading-relaxed">
                A centralized state management system that maintains workflow state, agent context, and conversation history. 
                All agents have access to shared state, enabling coordination and context-aware decision making.
              </p>
            </motion.article>
          </div>
          
          {/* Architecture Diagram */}
          <figure className="spooky-card p-8" aria-label="System architecture diagram">
            <h3 className="text-2xl font-bold mb-8 text-center text-spooky-text-primary">
              System Architecture
            </h3>
            
            <div className="architecture-diagram flex flex-col items-center space-y-6" role="img" aria-label="Diagram showing message bus connecting agents to shared state">
              {/* Message Bus */}
              <div className="w-full max-w-2xl">
                <div className="spooky-card-inner p-6 text-center border-2 border-spooky-accent-purple">
                  <h4 className="text-xl font-bold text-spooky-accent-purple mb-2">
                    Message Bus (Central Hub)
                  </h4>
                  <ul className="text-sm text-spooky-text-secondary space-y-1" aria-label="Message bus capabilities">
                    <li>• Event routing</li>
                    <li>• Agent communication</li>
                    <li>• Pub/sub messaging</li>
                  </ul>
                </div>
              </div>
              
              {/* Connection Lines */}
              <div className="flex items-center justify-center">
                <svg width="2" height="60" className="mx-auto">
                  <line x1="1" y1="0" x2="1" y2="60" stroke="currentColor" strokeWidth="2" className="text-spooky-accent-purple" strokeDasharray="5,5" />
                </svg>
              </div>
              
              {/* Agents */}
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
                <div className="spooky-card-inner p-4 text-center flex-1 min-w-[140px] border border-spooky-accent-orange">
                  <h5 className="font-bold text-spooky-accent-orange">Agent 1</h5>
                </div>
                <div className="spooky-card-inner p-4 text-center flex-1 min-w-[140px] border border-spooky-accent-orange">
                  <h5 className="font-bold text-spooky-accent-orange">Agent 2</h5>
                </div>
                <div className="spooky-card-inner p-4 text-center flex-1 min-w-[140px] border border-spooky-accent-orange">
                  <h5 className="font-bold text-spooky-accent-orange">Agent N</h5>
                </div>
              </div>
              
              {/* Connection Lines */}
              <div className="flex items-center justify-center">
                <svg width="2" height="60" className="mx-auto">
                  <line x1="1" y1="0" x2="1" y2="60" stroke="currentColor" strokeWidth="2" className="text-spooky-accent-green" strokeDasharray="5,5" />
                </svg>
              </div>
              
              {/* Shared State */}
              <div className="w-full max-w-2xl">
                <div className="spooky-card-inner p-6 text-center border-2 border-spooky-accent-green">
                  <h4 className="text-xl font-bold text-spooky-accent-green mb-2">
                    Shared State (Centralized)
                  </h4>
                  <ul className="text-sm text-spooky-text-secondary space-y-1" aria-label="Shared state components">
                    <li>• Workflow state</li>
                    <li>• Agent context</li>
                    <li>• Conversation history</li>
                  </ul>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* What This Skeleton Gives You */}
      <section 
        className="py-24 px-6 relative z-10"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="features-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary font-display tracking-tight"
            >
              What This Skeleton Gives You
            </h2>
            <p className="text-lg text-spooky-text-secondary/60 max-w-2xl mx-auto">
              Everything you need to build production-ready multi-agent systems
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🦴',
                title: 'Core Runtime',
                description: 'Message bus and shared workflow state for seamless agent coordination',
                color: 'purple'
              },
              {
                icon: '📜',
                title: 'Spec-Driven',
                description: 'Define agents in .kiro/specs with automatic TypeScript generation',
                color: 'green'
              },
              {
                icon: '🪝',
                title: 'Automation',
                description: 'Auto typegen and testing hooks for continuous validation',
                color: 'orange'
              },
              {
                icon: '🌀',
                title: 'MCP Integration',
                description: 'Call external tools and APIs through Model Context Protocol',
                color: 'neon'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-6 hover:border-spooky-accent-purple/50 transition-all duration-300 hover:shadow-lg hover:shadow-spooky-accent-purple/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" role="img" aria-label={feature.title}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-spooky-text-primary mb-3 font-display tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-spooky-text-secondary/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Conjurations */}
      <section 
        className="spooky-section py-20 px-6 relative z-10"
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
            Mini Conjurations
          </motion.h2>
          
          <motion.p 
            className="text-center text-spooky-text-secondary mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Witness the dark magic of multi-agent orchestration in action
          </motion.p>
          
          <MiniConjurations />
        </div>
      </section>

      {/* Comparison Section */}
      <section 
        className="py-24 px-6 relative z-10"
        aria-labelledby="comparison-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 
              id="comparison-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-spooky-text-primary"
            >
              Explore the Demos
            </h2>
            
            <p className="text-lg text-spooky-text-secondary/70 max-w-2xl mx-auto">
              The same runtime powers multiple applications, demonstrating the skeleton&apos;s versatility
            </p>
          </motion.div>
          
          {/* Comparison Cards */}
          <div className="grid md:grid-cols-3 gap-8" role="region" aria-label="Application comparison">
            {/* Support Copilot */}
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-purple/50 transition-all duration-300 hover:shadow-lg hover:shadow-spooky-accent-purple/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-spooky-accent-purple/10 flex items-center justify-center text-2xl">
                    💀
                  </div>
                  <h3 className="text-2xl font-bold text-spooky-accent-purple">
                    Support Copilot
                  </h3>
                </div>
                <Link 
                  href="/apps/support" 
                  className="px-4 py-2 bg-spooky-accent-purple/10 hover:bg-spooky-accent-purple/20 text-spooky-accent-purple rounded-lg text-sm font-medium transition-colors"
                  aria-label="Open Support Copilot application"
                >
                  Launch →
                </Link>
              </header>
              
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">
                    Purpose
                  </dt>
                  <dd className="text-spooky-text-secondary/80">
                    Customer support automation with intelligent routing and escalation
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Key Features
                  </dt>
                  <dd>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-purple">✓</span> Intent detection
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-purple">✓</span> FAQ matching
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-purple">✓</span> Escalation
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-purple">✓</span> Citations
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Agents
                  </dt>
                  <dd>
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Support Copilot agents">
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-purple/10 text-spooky-accent-purple rounded-lg border border-spooky-accent-purple/20" role="listitem">
                        Intent
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-purple/10 text-spooky-accent-purple rounded-lg border border-spooky-accent-purple/20" role="listitem">
                        FAQ
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-purple/10 text-spooky-accent-purple rounded-lg border border-spooky-accent-purple/20" role="listitem">
                        Escalation
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-purple/10 text-spooky-accent-purple rounded-lg border border-spooky-accent-purple/20" role="listitem">
                        Citation
                      </span>
                    </div>
                  </dd>
                </div>
              </dl>
            </motion.article>
            
            {/* Research Copilot */}
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-spooky-accent-green/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-spooky-accent-green/10 flex items-center justify-center text-2xl">
                    👻
                  </div>
                  <h3 className="text-2xl font-bold text-spooky-accent-green">
                    Research Copilot
                  </h3>
                </div>
                <Link 
                  href="/apps/research" 
                  className="px-4 py-2 bg-spooky-accent-green/10 hover:bg-spooky-accent-green/20 text-spooky-accent-green rounded-lg text-sm font-medium transition-colors"
                  aria-label="Open Research Copilot application"
                >
                  Launch →
                </Link>
              </header>
              
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">
                    Purpose
                  </dt>
                  <dd className="text-spooky-text-secondary/80">
                    Research workflow automation with retrieval and summarization
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Key Features
                  </dt>
                  <dd>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-green">✓</span> Document retrieval
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-green">✓</span> Summarization
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-green">✓</span> Citations
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-green">✓</span> Coordination
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Agents
                  </dt>
                  <dd>
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Research Copilot agents">
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-green/10 text-spooky-accent-green rounded-lg border border-spooky-accent-green/20" role="listitem">
                        Retrieval
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-green/10 text-spooky-accent-green rounded-lg border border-spooky-accent-green/20" role="listitem">
                        Summarization
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-green/10 text-spooky-accent-green rounded-lg border border-spooky-accent-green/20" role="listitem">
                        Citation
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-green/10 text-spooky-accent-green rounded-lg border border-spooky-accent-green/20" role="listitem">
                        Coordinator
                      </span>
                    </div>
                  </dd>
                </div>
              </dl>
            </motion.article>
            
            {/* Interactive Demo */}
            <motion.article 
              className="bg-spooky-bg-secondary/50 backdrop-blur-sm border border-spooky-border-subtle rounded-2xl p-8 hover:border-spooky-accent-orange/50 transition-all duration-300 hover:shadow-lg hover:shadow-spooky-accent-orange/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-spooky-accent-orange/10 flex items-center justify-center text-2xl">
                    🎃
                  </div>
                  <h3 className="text-2xl font-bold text-spooky-accent-orange">
                    Interactive Demo
                  </h3>
                </div>
                <Link 
                  href="/multi-agent-demo" 
                  className="px-4 py-2 bg-spooky-accent-orange/10 hover:bg-spooky-accent-orange/20 text-spooky-accent-orange rounded-lg text-sm font-medium transition-colors"
                  aria-label="Open Interactive Demo application"
                >
                  Launch →
                </Link>
              </header>
              
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-2">
                    Purpose
                  </dt>
                  <dd className="text-spooky-text-secondary/80">
                    Interactive visualization of multi-agent orchestration and workflow execution
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Key Features
                  </dt>
                  <dd>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-orange">✓</span> Live agent status
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-orange">✓</span> Message flow
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-orange">✓</span> Architecture viz
                      </div>
                      <div className="flex items-center gap-2 text-sm text-spooky-text-secondary/80">
                        <span className="text-spooky-accent-orange">✓</span> Workflow steps
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-semibold text-spooky-text-muted uppercase tracking-wider mb-3">
                    Components
                  </dt>
                  <dd>
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Interactive Demo components">
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-orange/10 text-spooky-accent-orange rounded-lg border border-spooky-accent-orange/20" role="listitem">
                        Console
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-orange/10 text-spooky-accent-orange rounded-lg border border-spooky-accent-orange/20" role="listitem">
                        Sidebar
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-orange/10 text-spooky-accent-orange rounded-lg border border-spooky-accent-orange/20" role="listitem">
                        Diagram
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-spooky-accent-orange/10 text-spooky-accent-orange rounded-lg border border-spooky-accent-orange/20" role="listitem">
                        Animation
                      </span>
                    </div>
                  </dd>
                </div>
              </dl>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Agent Role Details - Scroll targets from network */}
      <section 
        className="spooky-section py-20 px-6 relative z-10"
        aria-labelledby="agent-details-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            id="agent-details-heading"
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-spooky-text-primary font-display tracking-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Meet the Spectral Crew
          </motion.h2>
          
          <motion.p 
            className="text-center text-spooky-text-secondary/60 mb-12 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Six supernatural entities, each with unique powers to serve your AI needs
          </motion.p>
          
          <div className="space-y-8">
            {[
              { id: 'router-details', name: 'The Seer', subtitle: 'Intent Detection Agent', icon: '🔮', description: 'Gazes into the depths of each query to divine its true intent and purpose. With mystical insight, The Seer classifies messages and routes them through the ethereal pathways to their destined handlers.' },
              { id: 'faq-details', name: 'The Oracle', subtitle: 'FAQ Agent', icon: '📚', description: 'Keeper of ancient knowledge and forgotten wisdom. The Oracle consults dusty tomes and arcane databases to match mortal questions with answers etched in the bones of time.' },
              { id: 'escalation-details', name: 'The Gatekeeper', subtitle: 'Escalation Agent', icon: '🚪', description: 'Guardian of the threshold between the automated realm and the world of mortals. When queries grow too complex for spectral handlers, The Gatekeeper opens the portal for human intervention.' },
              { id: 'retrieval-details', name: 'The Tomb Raider', subtitle: 'Retrieval Agent', icon: '⚰️', description: 'Ventures into the crypts of document repositories, unearthing buried knowledge from forgotten archives. No information remains hidden from The Tomb Raider\'s relentless search.' },
              { id: 'summarization-details', name: 'The Whisperer', subtitle: 'Summarization Agent', icon: '👻', description: 'Distills vast oceans of text into ghostly whispers of meaning. The Whisperer condenses sprawling documents into ethereal essences while preserving their spectral truth.' },
              { id: 'citation-details', name: 'The Skeletal Scribe', subtitle: 'Citation Agent', icon: '🦴', description: 'With bony fingers, etches source citations into every response. The Skeletal Scribe ensures that all knowledge is traced back to its origins, maintaining the sacred chain of attribution.' }
            ].map((agent, index) => (
              <motion.div
                key={agent.id}
                id={agent.id}
                className="bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-6 scroll-mt-24"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl" role="img" aria-label={agent.name}>
                    {agent.icon}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-spooky-accent-purple mb-2 font-display tracking-tight">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-spooky-text-muted/70 mb-3 italic">
                      {agent.subtitle}
                    </p>
                    <p className="text-spooky-text-secondary/80 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kiro Features Section */}
      <section 
        className="spooky-section py-20 px-6 relative z-10"
        aria-labelledby="kiro-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            id="kiro-heading"
            className="text-4xl md:text-5xl font-bold text-center mb-4 text-spooky-text-primary font-gothic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Powered by Kiro
          </motion.h2>
          
          <p className="text-xl text-spooky-text-secondary text-center mb-12 max-w-3xl mx-auto">
            This skeleton leverages Kiro&apos;s powerful development features to ensure quality, maintainability, and extensibility
          </p>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8" role="list" aria-label="Kiro features">
            {/* Specs */}
            <article className="spooky-card p-6 space-y-3" role="listitem">
              <h3 className="text-2xl font-bold text-spooky-accent-purple">
                <span aria-hidden="true">📋</span> Specs
              </h3>
              <p className="text-sm text-spooky-text-muted uppercase tracking-wide">
                Formal requirements and design documents
              </p>
              <p className="text-spooky-text-secondary leading-relaxed">
                Used to define agent behaviors, orchestration logic, and system architecture. 
                Each component has detailed specifications with acceptance criteria and correctness properties 
                that guide implementation and testing.
              </p>
            </article>
            
            {/* Steering */}
            <article className="spooky-card p-6 space-y-3" role="listitem">
              <h3 className="text-2xl font-bold text-spooky-accent-orange">
                <span aria-hidden="true">🎯</span> Steering
              </h3>
              <p className="text-sm text-spooky-text-muted uppercase tracking-wide">
                Context and instructions for AI agents
              </p>
              <p className="text-spooky-text-secondary leading-relaxed">
                Guides agent decision-making and ensures consistent behavior across the system. 
                Steering files provide domain knowledge, constraints, and best practices that 
                influence how agents process information and make decisions.
              </p>
            </article>
            
            {/* Hooks */}
            <article className="spooky-card p-6 space-y-3" role="listitem">
              <h3 className="text-2xl font-bold text-spooky-accent-green">
                <span aria-hidden="true">🪝</span> Hooks
              </h3>
              <p className="text-sm text-spooky-text-muted uppercase tracking-wide">
                Event-driven automation triggers
              </p>
              <p className="text-spooky-text-secondary leading-relaxed">
                Automates testing, validation, and workflow coordination through event-driven triggers. 
                Hooks respond to system events like file changes or agent completions to maintain 
                code quality and orchestrate complex workflows.
              </p>
            </article>
            
            {/* MCP */}
            <article className="spooky-card p-6 space-y-3" role="listitem">
              <h3 className="text-2xl font-bold text-spooky-accent-purple">
                <span aria-hidden="true">🔌</span> MCP
              </h3>
              <p className="text-sm text-spooky-text-muted uppercase tracking-wide">
                Model Context Protocol integration
              </p>
              <p className="text-spooky-text-secondary leading-relaxed">
                Enables external tool integration and extended capabilities for agents. 
                MCP provides a standardized way for agents to access external APIs, databases, 
                and services, expanding the skeleton&apos;s functionality beyond its core features.
              </p>
            </article>
          </div>
          
          {/* Link to .kiro directory */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-spooky-text-secondary mb-6">
              Explore the complete Kiro configuration and specifications
            </p>
            
            <motion.div
              className="inline-block relative"
              whileHover={{ scale: 1.05 }}
            >
              {/* Glowing Kiro logo effect */}
              <motion.div
                className="absolute inset-0 rounded-lg blur-xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #6a1b9a, #abbc04, #388e3c)',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              
              <a 
                href="https://github.com/yourusername/multi-agent-skeleton/.kiro" 
                className="relative inline-block px-8 py-4 bg-spooky-bg-tertiary border-2 border-spooky-neon-accent rounded-lg text-spooky-neon-accent font-bold text-lg hover:bg-spooky-neon-accent hover:text-spooky-bg-primary transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Kiro directory with configuration and specifications"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🎃</span>
                  View /.kiro Directory
                  <span className="text-2xl">→</span>
                </span>
              </a>
            </motion.div>
            
            <motion.p 
              className="text-xs text-spooky-text-muted mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Built with 💀 for Kiroween 2024 • Skeleton Crew Category
            </motion.p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
