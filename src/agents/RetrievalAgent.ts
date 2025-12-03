// Retrieval Agent
// Searches and retrieves documents based on research topics

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface Document {
  id: string;
  title: string;
  content: string;
  author?: string;
  source?: string;
  publishedDate?: string;
  metadata: Record<string, any>;
  relevanceScore?: number;
}

export interface DocumentSection {
  documentId: string;
  sectionTitle: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface RetrievalResult {
  documents: Document[];
  query: string;
  totalResults: number;
  retrievedAt: number;
}

// ============================================================================
// Mock Document Index
// ============================================================================

export class DocumentIndex {
  private documents: Map<string, Document>;

  constructor(initialDocuments: Document[] = []) {
    this.documents = new Map();
    
    // Add initial documents
    initialDocuments.forEach(doc => {
      this.documents.set(doc.id, doc);
    });
    
    // If no documents provided, load default sample data
    if (initialDocuments.length === 0) {
      this.loadDefaultDocuments();
    }
  }

  /**
   * Load default sample documents
   */
  private loadDefaultDocuments(): void {
    const defaultDocuments: Document[] = [
      {
        id: 'doc-1',
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a subset of artificial intelligence that focuses on building systems that can learn from data. It involves training algorithms on datasets to make predictions or decisions without being explicitly programmed. Common approaches include supervised learning, unsupervised learning, and reinforcement learning. Applications range from image recognition to natural language processing.',
        author: 'Dr. Jane Smith',
        source: 'AI Research Journal',
        publishedDate: '2023-01-15',
        metadata: { category: 'AI', tags: ['machine learning', 'artificial intelligence', 'algorithms'] }
      },
      {
        id: 'doc-2',
        title: 'Deep Learning Fundamentals',
        content: 'Deep learning is a specialized branch of machine learning that uses neural networks with multiple layers. These deep neural networks can automatically learn hierarchical representations of data. Key architectures include convolutional neural networks (CNNs) for image processing, recurrent neural networks (RNNs) for sequential data, and transformers for natural language understanding.',
        author: 'Prof. John Doe',
        source: 'Neural Networks Quarterly',
        publishedDate: '2023-03-20',
        metadata: { category: 'AI', tags: ['deep learning', 'neural networks', 'CNN', 'RNN'] }
      },
      {
        id: 'doc-3',
        title: 'Natural Language Processing Techniques',
        content: 'Natural Language Processing (NLP) enables computers to understand, interpret, and generate human language. Modern NLP relies heavily on transformer models like BERT and GPT. Key tasks include sentiment analysis, named entity recognition, machine translation, and text summarization. NLP has revolutionized chatbots, search engines, and content generation.',
        author: 'Dr. Emily Chen',
        source: 'Computational Linguistics Review',
        publishedDate: '2023-05-10',
        metadata: { category: 'NLP', tags: ['natural language processing', 'transformers', 'BERT', 'GPT'] }
      },
      {
        id: 'doc-4',
        title: 'Computer Vision Applications',
        content: 'Computer vision enables machines to interpret and understand visual information from the world. Applications include object detection, facial recognition, autonomous vehicles, and medical image analysis. Convolutional neural networks have been particularly successful in computer vision tasks, achieving human-level performance in many domains.',
        author: 'Dr. Michael Brown',
        source: 'Vision Systems Journal',
        publishedDate: '2023-02-28',
        metadata: { category: 'Computer Vision', tags: ['computer vision', 'object detection', 'CNN', 'image processing'] }
      },
      {
        id: 'doc-5',
        title: 'Reinforcement Learning in Robotics',
        content: 'Reinforcement learning (RL) is a paradigm where agents learn to make decisions by interacting with an environment. In robotics, RL enables robots to learn complex behaviors through trial and error. Applications include robotic manipulation, navigation, and game playing. Deep reinforcement learning combines neural networks with RL for handling high-dimensional state spaces.',
        author: 'Prof. Sarah Johnson',
        source: 'Robotics and Automation',
        publishedDate: '2023-04-05',
        metadata: { category: 'Robotics', tags: ['reinforcement learning', 'robotics', 'deep RL', 'automation'] }
      },
      {
        id: 'doc-6',
        title: 'Ethics in Artificial Intelligence',
        content: 'As AI systems become more prevalent, ethical considerations are increasingly important. Key concerns include bias in algorithms, privacy protection, transparency, and accountability. Responsible AI development requires careful consideration of fairness, explainability, and societal impact. Organizations must establish ethical guidelines and governance frameworks for AI deployment.',
        author: 'Dr. David Lee',
        source: 'AI Ethics Quarterly',
        publishedDate: '2023-06-15',
        metadata: { category: 'Ethics', tags: ['AI ethics', 'bias', 'fairness', 'responsible AI'] }
      },
      {
        id: 'doc-7',
        title: 'Cloud Computing for AI Workloads',
        content: 'Cloud computing provides scalable infrastructure for training and deploying AI models. Major cloud providers offer specialized AI services including pre-trained models, GPU instances, and managed machine learning platforms. Benefits include reduced infrastructure costs, faster experimentation, and easier collaboration. Considerations include data security, vendor lock-in, and cost management.',
        author: 'Alex Martinez',
        source: 'Cloud Technology Review',
        publishedDate: '2023-07-01',
        metadata: { category: 'Cloud Computing', tags: ['cloud computing', 'AI infrastructure', 'GPU', 'MLOps'] }
      },
      {
        id: 'doc-8',
        title: 'Quantum Computing and AI',
        content: 'Quantum computing promises to revolutionize AI by solving certain problems exponentially faster than classical computers. Potential applications include optimization, cryptography, and drug discovery. Quantum machine learning explores how quantum algorithms can enhance classical ML techniques. While still in early stages, quantum computing could unlock new frontiers in AI research.',
        author: 'Dr. Lisa Wang',
        source: 'Quantum Computing Journal',
        publishedDate: '2023-08-20',
        metadata: { category: 'Quantum Computing', tags: ['quantum computing', 'quantum ML', 'optimization'] }
      }
    ];

    defaultDocuments.forEach(doc => {
      this.documents.set(doc.id, doc);
    });
  }

  /**
   * Search documents based on a topic query
   */
  search(topic: string, maxResults: number = 10): Document[] {
    const lowerTopic = topic.toLowerCase();
    const results: Array<{ document: Document; score: number }> = [];

    // Score each document based on relevance
    this.documents.forEach(doc => {
      let score = 0;

      // Check title match
      if (doc.title.toLowerCase().includes(lowerTopic)) {
        score += 10;
      }

      // Check content match
      const contentLower = doc.content.toLowerCase();
      const topicWords = lowerTopic.split(/\s+/);
      
      topicWords.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          const wordCount = (contentLower.match(new RegExp(word, 'g')) || []).length;
          score += wordCount * 2;
        }
      });

      // Check metadata tags
      if (doc.metadata.tags && Array.isArray(doc.metadata.tags)) {
        doc.metadata.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(lowerTopic)) {
            score += 5;
          }
          topicWords.forEach(word => {
            if (word.length > 2 && tag.toLowerCase().includes(word)) {
              score += 3;
            }
          });
        });
      }

      if (score > 0) {
        results.push({ 
          document: { ...doc, relevanceScore: score }, 
          score 
        });
      }
    });

    // Sort by score descending and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(r => r.document);
  }

  /**
   * Add or update a document
   */
  upsert(document: Document): void {
    this.documents.set(document.id, document);
  }

  /**
   * Get a document by ID
   */
  get(id: string): Document | undefined {
    return this.documents.get(id);
  }

  /**
   * Get all documents
   */
  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  /**
   * Delete a document
   */
  delete(id: string): boolean {
    return this.documents.delete(id);
  }
}

// ============================================================================
// Retrieval Agent
// ============================================================================

export class RetrievalAgent extends BaseAgent {
  private documentIndex: DocumentIndex;

  constructor(
    id: string = 'retrieval-agent',
    documentIndex?: DocumentIndex
  ) {
    super(
      id,
      'Retrieval Agent',
      ['document-search', 'information-retrieval', 'document-ranking'],
      {}
    );

    this.documentIndex = documentIndex || new DocumentIndex();
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { topic, maxResults = 10 } = message.payload;

    if (!topic || typeof topic !== 'string') {
      throw new Error('Message payload must contain a "topic" string field');
    }

    // Search documents
    const documents = await this.searchDocuments(topic, maxResults);

    // Rank results (already done in search, but we can apply additional ranking)
    const rankedDocuments = await this.rankResults(documents, topic);

    // Extract relevant sections
    const sections = await this.extractRelevantSections(rankedDocuments);

    // Prepare result
    const result: RetrievalResult = {
      documents: rankedDocuments,
      query: topic,
      totalResults: rankedDocuments.length,
      retrievedAt: Date.now()
    };

    return {
      ...result,
      sections,
      workflowId: message.workflowId
    };
  }

  /**
   * Search documents based on topic
   */
  async searchDocuments(topic: string, maxResults: number = 10): Promise<Document[]> {
    return this.documentIndex.search(topic, maxResults);
  }

  /**
   * Rank search results (additional ranking logic can be applied here)
   */
  async rankResults(documents: Document[], _topic: string): Promise<Document[]> {
    // Documents are already ranked by search, but we can apply additional ranking
    // For now, just return them as-is
    return documents;
  }

  /**
   * Extract relevant sections from documents
   */
  async extractRelevantSections(documents: Document[]): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];

    documents.forEach(doc => {
      // Split content into sentences
      const sentences = doc.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // For simplicity, take the first 2 sentences as the relevant section
      const relevantContent = sentences.slice(0, 2).join('. ') + '.';
      
      sections.push({
        documentId: doc.id,
        sectionTitle: doc.title,
        content: relevantContent,
        startIndex: 0,
        endIndex: relevantContent.length
      });
    });

    return sections;
  }

  /**
   * Get the document index (for testing purposes)
   */
  getDocumentIndex(): DocumentIndex {
    return this.documentIndex;
  }
}
