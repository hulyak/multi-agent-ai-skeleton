/**
 * Spooky UI Theme Components
 * 
 * A collection of reusable Halloween-themed UI components for CrewOS: CORBA Reborn.
 * These components provide a consistent spooky aesthetic while maintaining accessibility and UX.
 */

export { SpookyButton } from './SpookyButton';
export type { SpookyButtonProps } from './SpookyButton';

export { SpookyCard } from './SpookyCard';
export type { SpookyCardProps } from './SpookyCard';

export { SpookyIcon } from './SpookyIcon';
export type { SpookyIconProps } from './SpookyIcon';

export { SpookySpinner } from './SpookySpinner';
export type { SpookySpinnerProps } from './SpookySpinner';

export { SpookyWorkflowLine } from './SpookyWorkflowLine';
export type { SpookyWorkflowLineProps } from './SpookyWorkflowLine';

export { SpookyFloatingBones } from './SpookyFloatingBones';
export type { SpookyFloatingBonesProps } from './SpookyFloatingBones';

export { SpookyTable } from './SpookyTable';
export type { SpookyTableProps } from './SpookyTable';

// Multi-Agent UI Components
export { ArchitectureDiagram } from './ArchitectureDiagram';
export type { ArchitectureDiagramProps } from './ArchitectureDiagram';

export { AgentConsole } from './AgentConsole';
export type { AgentConsoleProps, ConsoleMessage } from './AgentConsole';

export { AgentStatusSidebar } from './AgentStatusSidebar';
export type { AgentStatusSidebarProps, AgentStatus } from './AgentStatusSidebar';

export { NeonPulseButton } from './NeonPulseButton';
export type { NeonPulseButtonProps } from './NeonPulseButton';

export { WorkflowAnimation } from './WorkflowAnimation';
export type { WorkflowAnimationProps, WorkflowStep } from './WorkflowAnimation';

export { SkeletonNetwork } from './SkeletonNetwork';
export type { SkeletonNetworkProps, AgentNode } from './SkeletonNetwork';

export { AnatomicalSkeleton } from './AnatomicalSkeleton';
export type { AnatomicalSkeletonProps, SkeletonAgent } from './AnatomicalSkeleton';

export { MiniConjurations } from './MiniConjurations';
export type { MiniConjurationsProps } from './MiniConjurations';

export { IDLResurrection } from './IDLResurrection';

// Scary Halloween Effects
export { HauntedGhost } from './HauntedGhost';
export type { HauntedGhostProps } from './HauntedGhost';

export { CreepyEyes } from './CreepyEyes';
export type { CreepyEyesProps } from './CreepyEyes';

export { SkeletonCursor } from './SkeletonCursor';

export { CrawlingSpider } from './CrawlingSpider';
export type { CrawlingSpiderProps } from './CrawlingSpider';

export { BloodDrip } from './BloodDrip';
export type { BloodDripProps } from './BloodDrip';

export { HauntedBackground } from './HauntedBackground';

export { GraveyardScene } from './GraveyardScene';

// Cute & Spooky Motion Design Components
export { AnimatedHeroSection } from './AnimatedHeroSection';
export type { AnimatedHeroSectionProps } from './AnimatedHeroSection';

export { CuteSkullSpinner } from './CuteSkullSpinner';
export type { CuteSkullSpinnerProps } from './CuteSkullSpinner';

export { FlyingBats } from './FlyingBats';
export type { FlyingBatsProps } from './FlyingBats';

export { FlickeringLantern } from './FlickeringLantern';
export type { FlickeringLanternProps } from './FlickeringLantern';

export { GhostlyPoof } from './GhostlyPoof';
export type { GhostlyPoofProps } from './GhostlyPoof';

// Theme tokens and utilities
export { 
  spookyTheme, 
  spookyStyles,
  getColorWithOpacity,
  createGradient,
  prefersReducedMotion
} from './theme-tokens';
export type { SpookyTheme } from './theme-tokens';
