// Agents Module Exports

export { BaseAgent } from './Agent';
export type { Agent, HealthStatus, MessageResponse } from './Agent';
export { IntentDetectionAgent, MockLLMProvider } from './IntentDetectionAgent';
export type {
  IntentType,
  Intent,
  Entity,
  IntentClassificationResult,
  LLMProvider
} from './IntentDetectionAgent';
export { FAQAgent } from './FAQAgent';
export type {
  FAQEntry,
  FAQSearchResult,
  FAQResponse,
  FAQKnowledgeBase
} from './FAQAgent';
export { EscalationAgent } from './EscalationAgent';
export type {
  ComplexityScore,
  ComplexityFactor,
  EscalationTicket,
  EscalationContext,
  EscalationResult,
  EscalationQueue
} from './EscalationAgent';
export { RetrievalAgent } from './RetrievalAgent';
export type {
  Document,
  DocumentSection,
  RetrievalResult,
  DocumentIndex
} from './RetrievalAgent';
export { SummarizationAgent } from './SummarizationAgent';
export type {
  Summary,
  SummarizationResult,
  SummarizationConfig
} from './SummarizationAgent';
export { CitationAgent } from './CitationAgent';
export type {
  Citation,
  CitationStyle,
  FormattedCitation,
  CitationResult
} from './CitationAgent';
