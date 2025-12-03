// FAQ Agent
// Responds to frequently asked questions using a knowledge base

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  confidence?: number;
}

export interface FAQSearchResult {
  entries: FAQEntry[];
  query: string;
  matchCount: number;
}

export interface FAQResponse {
  answer: string;
  sources: FAQEntry[];
  confidence: number;
}

// ============================================================================
// FAQ Knowledge Base
// ============================================================================

export class FAQKnowledgeBase {
  private entries: Map<string, FAQEntry>;

  constructor(initialEntries: FAQEntry[] = []) {
    this.entries = new Map();
    
    // Add initial entries
    initialEntries.forEach(entry => {
      this.entries.set(entry.id, entry);
    });
    
    // If no entries provided, load default sample data
    if (initialEntries.length === 0) {
      this.loadDefaultEntries();
    }
  }

  /**
   * Load default sample FAQ entries
   */
  private loadDefaultEntries(): void {
    const defaultEntries: FAQEntry[] = [
      {
        id: 'faq-1',
        question: 'What are your business hours?',
        answer: 'We are open Monday through Friday from 9:00 AM to 5:00 PM EST. We are closed on weekends and major holidays.',
        keywords: ['hours', 'open', 'closed', 'time', 'when', 'schedule'],
        category: 'general'
      },
      {
        id: 'faq-2',
        question: 'Where is your location?',
        answer: 'Our main office is located at 123 Main Street, Suite 100, New York, NY 10001. We also have regional offices in San Francisco and Chicago.',
        keywords: ['location', 'address', 'where', 'office', 'find'],
        category: 'general'
      },
      {
        id: 'faq-3',
        question: 'How much does it cost?',
        answer: 'Our pricing starts at $29/month for the basic plan, $79/month for professional, and $199/month for enterprise. All plans include a 14-day free trial.',
        keywords: ['price', 'cost', 'pricing', 'how much', 'expensive', 'cheap', 'plan'],
        category: 'pricing'
      },
      {
        id: 'faq-4',
        question: 'How do I contact support?',
        answer: 'You can reach our support team via email at support@example.com, by phone at 1-800-555-0123, or through the live chat on our website.',
        keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'call'],
        category: 'support'
      },
      {
        id: 'faq-5',
        question: 'What is your refund policy?',
        answer: 'We offer a 30-day money-back guarantee. If you are not satisfied with our service, you can request a full refund within 30 days of purchase.',
        keywords: ['refund', 'money back', 'return', 'cancel', 'guarantee', 'policy'],
        category: 'billing'
      },
      {
        id: 'faq-6',
        question: 'Do you offer discounts?',
        answer: 'Yes! We offer a 20% discount for annual subscriptions, 15% for non-profits, and 10% for students and educators. Contact sales for custom enterprise pricing.',
        keywords: ['discount', 'sale', 'coupon', 'promo', 'deal', 'cheaper', 'save'],
        category: 'pricing'
      },
      {
        id: 'faq-7',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and bank transfers for enterprise accounts.',
        keywords: ['payment', 'pay', 'credit card', 'paypal', 'billing', 'method'],
        category: 'billing'
      },
      {
        id: 'faq-8',
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page, enter your email address, and we will send you a password reset link. The link expires in 24 hours.',
        keywords: ['password', 'reset', 'forgot', 'login', 'access', 'account'],
        category: 'account'
      }
    ];

    defaultEntries.forEach(entry => {
      this.entries.set(entry.id, entry);
    });
  }

  /**
   * Search the knowledge base for relevant FAQ entries
   */
  search(query: string, maxResults: number = 5): FAQEntry[] {
    const lowerQuery = query.toLowerCase();
    const results: Array<{ entry: FAQEntry; score: number }> = [];

    // Score each entry based on keyword matches
    this.entries.forEach(entry => {
      let score = 0;

      // Check if query matches keywords
      entry.keywords.forEach(keyword => {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      // Check if query matches question
      if (entry.question.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }

      // Check if query words match keywords
      const queryWords = lowerQuery.split(/\s+/);
      queryWords.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          entry.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(word)) {
              score += 1;
            }
          });
        }
      });

      if (score > 0) {
        results.push({ entry: { ...entry, confidence: score }, score });
      }
    });

    // Sort by score descending and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(r => r.entry);
  }

  /**
   * Add or update an FAQ entry
   */
  upsert(entry: FAQEntry): void {
    this.entries.set(entry.id, entry);
  }

  /**
   * Get an entry by ID
   */
  get(id: string): FAQEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all entries
   */
  getAll(): FAQEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Delete an entry
   */
  delete(id: string): boolean {
    return this.entries.delete(id);
  }

  /**
   * Get entries by category
   */
  getByCategory(category: string): FAQEntry[] {
    return Array.from(this.entries.values()).filter(
      entry => entry.category === category
    );
  }
}

// ============================================================================
// FAQ Agent
// ============================================================================

export class FAQAgent extends BaseAgent {
  private knowledgeBase: FAQKnowledgeBase;

  constructor(
    id: string = 'faq-agent',
    knowledgeBase?: FAQKnowledgeBase
  ) {
    super(
      id,
      'FAQ Agent',
      ['faq-search', 'knowledge-base-query', 'question-answering'],
      {}
    );

    this.knowledgeBase = knowledgeBase || new FAQKnowledgeBase();
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { query } = message.payload;

    if (!query || typeof query !== 'string') {
      throw new Error('Message payload must contain a "query" string field');
    }

    // Search knowledge base
    const entries = await this.searchKnowledgeBase(query);

    // Generate response
    const response = await this.generateResponse(entries);

    return {
      ...response,
      query,
      timestamp: Date.now()
    };
  }

  /**
   * Search the knowledge base for relevant FAQ entries
   */
  async searchKnowledgeBase(query: string): Promise<FAQEntry[]> {
    return this.knowledgeBase.search(query);
  }

  /**
   * Generate a response based on retrieved FAQ entries
   */
  async generateResponse(entries: FAQEntry[]): Promise<FAQResponse> {
    if (entries.length === 0) {
      return {
        answer: 'I could not find an answer to your question in our FAQ. Please contact support for assistance.',
        sources: [],
        confidence: 0
      };
    }

    // Use the top matching entry
    const topEntry = entries[0];
    const confidence = topEntry.confidence || 0;

    // Calculate overall confidence (normalized)
    const normalizedConfidence = Math.min(confidence / 10, 1);

    return {
      answer: topEntry.answer,
      sources: entries,
      confidence: normalizedConfidence
    };
  }

  /**
   * Update the knowledge base with a new entry
   */
  async updateKnowledgeBase(entry: FAQEntry): Promise<void> {
    this.knowledgeBase.upsert(entry);
  }

  /**
   * Get the knowledge base (for testing purposes)
   */
  getKnowledgeBase(): FAQKnowledgeBase {
    return this.knowledgeBase;
  }
}
