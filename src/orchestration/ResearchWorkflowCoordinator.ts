// Research Workflow Coordinator
// Sequences Retrieval → Summarization → Citation agents and aggregates outputs

import { AgentOrchestrator } from './AgentOrchestrator';
import { WorkflowStateManager } from './WorkflowStateManager';
import { MessageObject, MessageType, Priority, WorkflowStatus } from '../types';
import { RetrievalAgent, Document } from '../agents/RetrievalAgent';
import { SummarizationAgent, Summary } from '../agents/SummarizationAgent';
import { CitationAgent, CitationStyle, FormattedCitation } from '../agents/CitationAgent';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ResearchReport {
  topic: string;
  documents: Document[];
  summaries: Summary[];
  citations: FormattedCitation[];
  formattedReport: string;
  metadata: {
    workflowId: string;
    startedAt: number;
    completedAt: number;
    totalDocuments: number;
    citationStyle: CitationStyle;
  };
}

export interface ResearchWorkflowConfig {
  maxDocuments?: number;
  summaryTargetLength?: number;
  citationStyle?: CitationStyle;
}

// ============================================================================
// Research Workflow Coordinator
// ============================================================================

export class ResearchWorkflowCoordinator {
  private orchestrator: AgentOrchestrator;
  private stateManager: WorkflowStateManager;
  private retrievalAgent: RetrievalAgent;
  private summarizationAgent: SummarizationAgent;
  private citationAgent: CitationAgent;
  private config: Required<ResearchWorkflowConfig>;

  constructor(
    orchestrator?: AgentOrchestrator,
    config: ResearchWorkflowConfig = {}
  ) {
    this.orchestrator = orchestrator || new AgentOrchestrator();
    this.stateManager = this.orchestrator.getWorkflowStateManager();
    
    // Initialize agents
    this.retrievalAgent = new RetrievalAgent();
    this.summarizationAgent = new SummarizationAgent();
    this.citationAgent = new CitationAgent();

    // Set default config
    this.config = {
      maxDocuments: config.maxDocuments || 10,
      summaryTargetLength: config.summaryTargetLength || 200,
      citationStyle: config.citationStyle || CitationStyle.APA
    };
  }

  /**
   * Initialize the coordinator and all agents
   */
  async initialize(): Promise<void> {
    // Register agents with orchestrator
    this.orchestrator.registerAgent(this.retrievalAgent);
    this.orchestrator.registerAgent(this.summarizationAgent);
    this.orchestrator.registerAgent(this.citationAgent);

    // Initialize orchestrator if not already initialized
    if (!this.orchestrator.isReady()) {
      await this.orchestrator.initialize();
    }
  }

  /**
   * Execute research workflow for a given topic
   * Sequential execution: Retrieval → Summarization → Citation
   */
  async executeResearchWorkflow(
    topic: string,
    workflowId?: string
  ): Promise<ResearchReport> {
    const startedAt = Date.now();
    const wfId = workflowId || `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create workflow
    this.stateManager.createWorkflow(wfId, {
      status: WorkflowStatus.IN_PROGRESS,
      metadata: {
        createdAt: startedAt,
        updatedAt: startedAt,
        initiatorId: 'research-coordinator'
      }
    });

    try {
      // Step 1: Retrieval Agent - Search and retrieve documents
      const documents = await this.executeRetrieval(topic, wfId);

      // Step 2: Summarization Agent - Condense documents
      const summaries = await this.executeSummarization(documents, wfId);

      // Step 3: Citation Agent - Extract and format citations
      const citations = await this.executeCitation(documents, wfId);

      // Step 4: Aggregate outputs into unified report
      const formattedReport = this.formatReport(topic, documents, summaries, citations);

      // Update workflow status
      this.stateManager.updateWorkflow(wfId, {
        status: WorkflowStatus.COMPLETED
      });

      const completedAt = Date.now();

      return {
        topic,
        documents,
        summaries,
        citations,
        formattedReport,
        metadata: {
          workflowId: wfId,
          startedAt,
          completedAt,
          totalDocuments: documents.length,
          citationStyle: this.config.citationStyle
        }
      };
    } catch (error) {
      // Mark workflow as failed
      this.stateManager.updateWorkflow(wfId, {
        status: WorkflowStatus.FAILED
      });
      throw error;
    }
  }

  /**
   * Step 1: Execute retrieval agent
   */
  private async executeRetrieval(topic: string, workflowId: string): Promise<Document[]> {
    const message: MessageObject = {
      id: `msg-retrieval-${Date.now()}`,
      type: MessageType.TASK_REQUEST,
      workflowId,
      sourceAgentId: 'research-coordinator',
      targetAgentId: this.retrievalAgent.id,
      payload: {
        topic,
        maxResults: this.config.maxDocuments
      },
      metadata: {
        timestamp: Date.now(),
        priority: Priority.NORMAL,
        retryCount: 0
      }
    };

    const response = await this.retrievalAgent.handleMessage(message);

    if (!response.success || !response.data) {
      throw new Error(`Retrieval failed: ${response.error || 'Unknown error'}`);
    }

    const { documents } = response.data;

    // Store documents in workflow state
    this.stateManager.updateWorkflow(workflowId, {
      sharedData: {
        retrievedDocuments: documents
      }
    });

    return documents;
  }

  /**
   * Step 2: Execute summarization agent
   */
  private async executeSummarization(documents: Document[], workflowId: string): Promise<Summary[]> {
    if (documents.length === 0) {
      return [];
    }

    const message: MessageObject = {
      id: `msg-summarization-${Date.now()}`,
      type: MessageType.TASK_REQUEST,
      workflowId,
      sourceAgentId: 'research-coordinator',
      targetAgentId: this.summarizationAgent.id,
      payload: {
        documents,
        targetLength: this.config.summaryTargetLength
      },
      metadata: {
        timestamp: Date.now(),
        priority: Priority.NORMAL,
        retryCount: 0
      }
    };

    const response = await this.summarizationAgent.handleMessage(message);

    if (!response.success || !response.data) {
      throw new Error(`Summarization failed: ${response.error || 'Unknown error'}`);
    }

    const { summaries } = response.data;

    // Store summaries in workflow state
    this.stateManager.updateWorkflow(workflowId, {
      sharedData: {
        ...this.stateManager.getWorkflow(workflowId).sharedData,
        summaries
      }
    });

    return summaries;
  }

  /**
   * Step 3: Execute citation agent
   */
  private async executeCitation(documents: Document[], workflowId: string): Promise<FormattedCitation[]> {
    if (documents.length === 0) {
      return [];
    }

    const message: MessageObject = {
      id: `msg-citation-${Date.now()}`,
      type: MessageType.TASK_REQUEST,
      workflowId,
      sourceAgentId: 'research-coordinator',
      targetAgentId: this.citationAgent.id,
      payload: {
        documents,
        style: this.config.citationStyle
      },
      metadata: {
        timestamp: Date.now(),
        priority: Priority.NORMAL,
        retryCount: 0
      }
    };

    const response = await this.citationAgent.handleMessage(message);

    if (!response.success || !response.data) {
      throw new Error(`Citation failed: ${response.error || 'Unknown error'}`);
    }

    const { formattedCitations } = response.data;

    // Store citations in workflow state
    this.stateManager.updateWorkflow(workflowId, {
      sharedData: {
        ...this.stateManager.getWorkflow(workflowId).sharedData,
        citations: formattedCitations
      }
    });

    return formattedCitations;
  }

  /**
   * Format final report in rich-text with citation links
   */
  private formatReport(
    topic: string,
    documents: Document[],
    summaries: Summary[],
    citations: FormattedCitation[]
  ): string {
    const lines: string[] = [];

    // Title
    lines.push(`# Research Report: ${topic}`);
    lines.push('');

    // Executive Summary
    lines.push('## Executive Summary');
    lines.push('');
    
    if (documents.length === 0) {
      lines.push('No documents were found for this research topic.');
      return lines.join('\n');
    }

    lines.push(`This report presents findings from ${documents.length} source${documents.length !== 1 ? 's' : ''} on the topic of "${topic}".`);
    lines.push('');

    // Document Summaries
    lines.push('## Document Summaries');
    lines.push('');

    summaries.forEach((summary, index) => {
      const document = documents.find(d => d.id === summary.documentId);
      const citation = citations.find(c => c.citation.documentId === summary.documentId);

      if (document) {
        lines.push(`### ${index + 1}. ${document.title}`);
        lines.push('');
        lines.push(summary.summary);
        lines.push('');
        
        if (citation) {
          lines.push(`**Citation:** ${citation.formatted}`);
          lines.push('');
        }
      }
    });

    // References Section
    lines.push('## References');
    lines.push('');

    citations.forEach((citation, index) => {
      lines.push(`[${index + 1}] ${citation.formatted}`);
    });

    lines.push('');

    // Metadata
    lines.push('---');
    lines.push('');
    lines.push('## Report Metadata');
    lines.push('');
    lines.push(`- **Topic:** ${topic}`);
    lines.push(`- **Total Documents:** ${documents.length}`);
    lines.push(`- **Citation Style:** ${this.config.citationStyle}`);
    lines.push(`- **Generated:** ${new Date().toISOString()}`);

    return lines.join('\n');
  }

  /**
   * Get configuration
   */
  getConfig(): Required<ResearchWorkflowConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ResearchWorkflowConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };
  }

  /**
   * Get orchestrator
   */
  getOrchestrator(): AgentOrchestrator {
    return this.orchestrator;
  }

  /**
   * Get state manager
   */
  getStateManager(): WorkflowStateManager {
    return this.stateManager;
  }
}
