// Citation Agent
// Extracts and formats citations from documents

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';
import { Document } from './RetrievalAgent';

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum CitationStyle {
  APA = 'APA',
  MLA = 'MLA',
  CHICAGO = 'CHICAGO'
}

export interface Citation {
  documentId: string;
  author?: string;
  title: string;
  source?: string;
  publishedDate?: string;
  url?: string;
  accessedDate?: string;
  metadata: Record<string, any>;
}

export interface FormattedCitation {
  citation: Citation;
  style: CitationStyle;
  formatted: string;
  isValid: boolean;
  validationErrors?: string[];
}

export interface CitationResult {
  citations: Citation[];
  formattedCitations: FormattedCitation[];
  style: CitationStyle;
  totalCitations: number;
  validCitations: number;
  invalidCitations: number;
  extractedAt: number;
}

// ============================================================================
// Citation Agent
// ============================================================================

export class CitationAgent extends BaseAgent {
  private defaultStyle: CitationStyle;

  constructor(
    id: string = 'citation-agent',
    defaultStyle: CitationStyle = CitationStyle.APA
  ) {
    super(
      id,
      'Citation Agent',
      ['citation-extraction', 'citation-formatting', 'citation-validation'],
      { defaultStyle }
    );

    this.defaultStyle = defaultStyle;
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { documents, style } = message.payload;

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
      if (!doc.title || typeof doc.title !== 'string') {
        throw new Error('Each document must have a "title" string field');
      }
    }

    // Use provided style or default
    const citationStyle = style || this.defaultStyle;

    // Validate citation style
    if (!Object.values(CitationStyle).includes(citationStyle)) {
      throw new Error(`Invalid citation style: ${citationStyle}. Must be one of: ${Object.values(CitationStyle).join(', ')}`);
    }

    // Extract citations from documents
    const citations = await this.extractCitations(documents);

    // Format citations
    const formattedCitations = await this.formatCitations(citations, citationStyle);

    // Validate citations
    const validatedCitations = await this.validateCitations(formattedCitations);

    // Calculate statistics
    const validCitations = validatedCitations.filter(c => c.isValid).length;
    const invalidCitations = validatedCitations.length - validCitations;

    const result: CitationResult = {
      citations,
      formattedCitations: validatedCitations,
      style: citationStyle,
      totalCitations: citations.length,
      validCitations,
      invalidCitations,
      extractedAt: Date.now()
    };

    return {
      ...result,
      workflowId: message.workflowId
    };
  }

  /**
   * Extract citations from documents
   */
  async extractCitations(documents: Document[]): Promise<Citation[]> {
    const citations: Citation[] = [];

    for (const doc of documents) {
      const citation: Citation = {
        documentId: doc.id,
        author: doc.author,
        title: doc.title,
        source: doc.source,
        publishedDate: doc.publishedDate,
        url: doc.metadata?.url,
        accessedDate: new Date().toISOString().split('T')[0],
        metadata: doc.metadata || {}
      };

      citations.push(citation);
    }

    return citations;
  }

  /**
   * Format citations according to specified style
   */
  async formatCitations(citations: Citation[], style: CitationStyle): Promise<FormattedCitation[]> {
    const formattedCitations: FormattedCitation[] = [];

    for (const citation of citations) {
      let formatted: string;

      switch (style) {
        case CitationStyle.APA:
          formatted = this.formatAPA(citation);
          break;
        case CitationStyle.MLA:
          formatted = this.formatMLA(citation);
          break;
        case CitationStyle.CHICAGO:
          formatted = this.formatChicago(citation);
          break;
        default:
          formatted = this.formatAPA(citation);
      }

      formattedCitations.push({
        citation,
        style,
        formatted,
        isValid: true, // Will be validated in validateCitations
        validationErrors: []
      });
    }

    return formattedCitations;
  }

  /**
   * Format citation in APA style
   * Format: Author, A. A. (Year). Title of work. Source.
   */
  private formatAPA(citation: Citation): string {
    const parts: string[] = [];

    // Author
    if (citation.author) {
      parts.push(citation.author);
    }

    // Year
    if (citation.publishedDate) {
      const year = citation.publishedDate.split('-')[0];
      parts.push(`(${year})`);
    }

    // Title - always include, even if empty
    const trimmedTitle = citation.title.trim();
    parts.push(trimmedTitle || 'Untitled');

    // Source
    if (citation.source) {
      parts.push(citation.source);
    }

    // URL
    if (citation.url) {
      parts.push(`Retrieved from ${citation.url}`);
    }

    return parts.join('. ') + '.';
  }

  /**
   * Format citation in MLA style
   * Format: Author. "Title of Work." Source, Date.
   */
  private formatMLA(citation: Citation): string {
    const parts: string[] = [];

    // Author
    if (citation.author) {
      parts.push(citation.author);
    }

    // Title (in quotes) - always include, even if empty
    const trimmedTitle = citation.title.trim();
    parts.push(`"${trimmedTitle || 'Untitled'}"`);

    // Source
    if (citation.source) {
      parts.push(citation.source);
    }

    // Date
    if (citation.publishedDate) {
      parts.push(citation.publishedDate);
    }

    // URL
    if (citation.url) {
      parts.push(citation.url);
    }

    return parts.join(', ') + '.';
  }

  /**
   * Format citation in Chicago style
   * Format: Author. Title of Work. Source, Year.
   */
  private formatChicago(citation: Citation): string {
    const parts: string[] = [];

    // Author
    if (citation.author) {
      parts.push(citation.author);
    }

    // Title (italicized - represented with underscores) - always include, even if empty
    const trimmedTitle = citation.title.trim();
    parts.push(`_${trimmedTitle || 'Untitled'}_`);

    // Source and Year
    const sourceAndYear: string[] = [];
    if (citation.source) {
      sourceAndYear.push(citation.source);
    }
    if (citation.publishedDate) {
      const year = citation.publishedDate.split('-')[0];
      sourceAndYear.push(year);
    }

    if (sourceAndYear.length > 0) {
      parts.push(sourceAndYear.join(', '));
    }

    // URL
    if (citation.url) {
      parts.push(citation.url);
    }

    return parts.join('. ') + '.';
  }

  /**
   * Validate citations
   */
  async validateCitations(formattedCitations: FormattedCitation[]): Promise<FormattedCitation[]> {
    return formattedCitations.map(fc => {
      const errors: string[] = [];

      // Check if title exists
      if (!fc.citation.title || fc.citation.title.trim().length === 0) {
        errors.push('Title is required');
      }

      // Check if formatted citation is not empty
      if (!fc.formatted || fc.formatted.trim().length === 0) {
        errors.push('Formatted citation is empty');
      }

      // Check if formatted citation contains the title
      if (fc.formatted && fc.citation.title && !fc.formatted.includes(fc.citation.title)) {
        errors.push('Formatted citation does not contain the title');
      }

      // Validate date format if present
      if (fc.citation.publishedDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fc.citation.publishedDate)) {
          errors.push('Published date must be in YYYY-MM-DD format');
        }
      }

      // Validate URL format if present
      if (fc.citation.url) {
        try {
          new URL(fc.citation.url);
        } catch {
          errors.push('Invalid URL format');
        }
      }

      return {
        ...fc,
        isValid: errors.length === 0,
        validationErrors: errors.length > 0 ? errors : undefined
      };
    });
  }

  /**
   * Get default citation style
   */
  getDefaultStyle(): CitationStyle {
    return this.defaultStyle;
  }

  /**
   * Set default citation style
   */
  setDefaultStyle(style: CitationStyle): void {
    this.defaultStyle = style;
  }
}
