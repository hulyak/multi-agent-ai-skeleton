// Summarization Agent
// Condenses documents into concise summaries using LLM

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';
import { Document } from './RetrievalAgent';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface Summary {
  documentId: string;
  originalLength: number;
  summaryLength: number;
  summary: string;
  compressionRatio: number;
  createdAt: number;
}

export interface SummarizationResult {
  summaries: Summary[];
  totalDocuments: number;
  totalOriginalLength: number;
  totalSummaryLength: number;
  averageCompressionRatio: number;
  summarizedAt: number;
}

export interface SummarizationConfig {
  targetLength?: number;
  minCompressionRatio?: number;
  maxCompressionRatio?: number;
  preserveKeyPoints?: boolean;
}

// ============================================================================
// Summarization Agent
// ============================================================================

export class SummarizationAgent extends BaseAgent {
  private config: SummarizationConfig;

  constructor(
    id: string = 'summarization-agent',
    config: SummarizationConfig = {}
  ) {
    super(
      id,
      'Summarization Agent',
      ['document-summarization', 'text-condensation', 'content-extraction'],
      config
    );

    this.config = {
      targetLength: config.targetLength || 200,
      minCompressionRatio: config.minCompressionRatio || 0.1,
      maxCompressionRatio: config.maxCompressionRatio || 0.5,
      preserveKeyPoints: config.preserveKeyPoints !== false
    };
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { documents, targetLength } = message.payload;

    if (!documents || !Array.isArray(documents)) {
      throw new Error('Message payload must contain a "documents" array field');
    }

    if (documents.length === 0) {
      throw new Error('Documents array cannot be empty');
    }

    // Validate documents have required fields
    for (const doc of documents) {
      if (!doc.id || typeof doc.id !== 'string') {
        throw new Error('Each document must have an "id" string field');
      }
      if (!doc.content || typeof doc.content !== 'string') {
        throw new Error('Each document must have a "content" string field');
      }
    }

    // Use provided targetLength or default from config
    const effectiveTargetLength = targetLength || this.config.targetLength;

    // Summarize documents
    const summaries = await this.summarizeDocuments(documents, effectiveTargetLength);

    // Calculate aggregate statistics
    const totalOriginalLength = summaries.reduce((sum, s) => sum + s.originalLength, 0);
    const totalSummaryLength = summaries.reduce((sum, s) => sum + s.summaryLength, 0);
    const averageCompressionRatio = totalSummaryLength / totalOriginalLength;

    const result: SummarizationResult = {
      summaries,
      totalDocuments: documents.length,
      totalOriginalLength,
      totalSummaryLength,
      averageCompressionRatio,
      summarizedAt: Date.now()
    };

    return {
      ...result,
      workflowId: message.workflowId
    };
  }

  /**
   * Summarize multiple documents
   */
  async summarizeDocuments(documents: Document[], targetLength?: number): Promise<Summary[]> {
    const summaries: Summary[] = [];

    for (const doc of documents) {
      const summary = await this.summarizeDocument(doc, targetLength);
      summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Summarize a single document
   */
  async summarizeDocument(document: Document, targetLength?: number): Promise<Summary> {
    const effectiveTargetLength = targetLength || this.config.targetLength!;
    const originalLength = document.content.length;

    // Generate summary using extractive summarization
    let summaryText = await this.extractiveSummarization(document.content, effectiveTargetLength);

    // Adjust summary length if needed
    summaryText = await this.adjustSummaryLength(summaryText, effectiveTargetLength);

    // Ensure summary is never longer than original
    if (summaryText.length > originalLength) {
      summaryText = document.content;
    }

    // Ensure summary ends with proper punctuation, but don't exceed original length
    summaryText = this.ensureProperEnding(summaryText, originalLength);

    const summaryLength = summaryText.length;
    const compressionRatio = summaryLength / originalLength;

    return {
      documentId: document.id,
      originalLength,
      summaryLength,
      summary: summaryText,
      compressionRatio,
      createdAt: Date.now()
    };
  }

  /**
   * Perform extractive summarization by selecting key sentences
   */
  private async extractiveSummarization(content: string, targetLength: number): Promise<string> {
    // Split content into sentences
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) {
      return '';
    }

    // Score sentences based on importance
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;

      // Position score: sentences at the beginning and end are often more important
      if (index === 0) {
        score += 5;
      } else if (index === sentences.length - 1) {
        score += 3;
      }

      // Length score: prefer sentences of moderate length
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 10 && wordCount <= 25) {
        score += 3;
      } else if (wordCount >= 5 && wordCount < 10) {
        score += 1;
      }

      // Keyword score: sentences with important keywords score higher
      const importantKeywords = [
        'important', 'significant', 'key', 'critical', 'essential',
        'main', 'primary', 'fundamental', 'crucial', 'major',
        'enables', 'provides', 'allows', 'includes', 'involves'
      ];

      const lowerSentence = sentence.toLowerCase();
      importantKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) {
          score += 2;
        }
      });

      // Numeric data score: sentences with numbers often contain facts
      if (/\d+/.test(sentence)) {
        score += 1;
      }

      return { sentence, score, index };
    });

    // Sort by score descending
    scoredSentences.sort((a, b) => b.score - a.score);

    // Select sentences until we reach target length
    const selectedSentences: Array<{ sentence: string; index: number }> = [];
    let currentLength = 0;

    for (const item of scoredSentences) {
      const sentenceLength = item.sentence.length + 2; // +2 for ". "
      if (currentLength + sentenceLength <= targetLength) {
        selectedSentences.push({ sentence: item.sentence, index: item.index });
        currentLength += sentenceLength;
      }

      // Stop if we've reached target length
      if (currentLength >= targetLength * 0.9) {
        break;
      }
    }

    // If no sentences selected, take the first one
    if (selectedSentences.length === 0 && scoredSentences.length > 0) {
      selectedSentences.push({
        sentence: scoredSentences[0].sentence,
        index: scoredSentences[0].index
      });
    }

    // Sort selected sentences by original order to maintain coherence
    selectedSentences.sort((a, b) => a.index - b.index);

    // Join sentences
    return selectedSentences.map(s => s.sentence).join('. ') + '.';
  }

  /**
   * Adjust summary length to meet target
   */
  async adjustSummaryLength(summary: string, targetLength: number): Promise<string> {
    // If summary is already within acceptable range, return as-is
    const currentLength = summary.length;
    const tolerance = 0.2; // 20% tolerance

    if (currentLength <= targetLength * (1 + tolerance)) {
      return summary;
    }

    // If summary is too long, truncate at sentence boundary
    if (currentLength > targetLength) {
      const sentences = summary
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let adjustedSummary = '';
      for (const sentence of sentences) {
        const potentialLength = adjustedSummary.length + sentence.length + 2;
        if (potentialLength <= targetLength) {
          adjustedSummary += (adjustedSummary ? '. ' : '') + sentence;
        } else {
          break;
        }
      }

      // Ensure we have at least one sentence
      if (adjustedSummary.length === 0 && sentences.length > 0) {
        adjustedSummary = sentences[0];
      }

      return adjustedSummary + '.';
    }

    return summary;
  }

  /**
   * Ensure summary ends with proper punctuation
   */
  private ensureProperEnding(text: string, maxLength?: number): string {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return '.';
    }

    // Check if already ends with punctuation
    if (/[.!?]$/.test(trimmed)) {
      return trimmed;
    }

    // Add period if missing, but respect max length
    const withPeriod = trimmed + '.';
    if (maxLength !== undefined && withPeriod.length > maxLength) {
      // If adding period would exceed max length, truncate and add period
      if (trimmed.length >= maxLength) {
        // Already at or over max length, return as-is
        return trimmed.substring(0, maxLength);
      }
      // Can fit the period
      return trimmed + '.';
    }

    return withPeriod;
  }

  /**
   * Get configuration
   */
  getConfig(): SummarizationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SummarizationConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };
  }
}
