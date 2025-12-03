// Performance Monitoring System

export interface PerformanceMetrics {
  // Request metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  
  // Message routing metrics
  totalMessagesRouted: number;
  averageRoutingLatency: number;
  minRoutingLatency: number;
  maxRoutingLatency: number;
  
  // Agent processing metrics
  agentProcessingTimes: Map<string, AgentProcessingMetrics>;
  
  // Time window
  windowStart: number;
  windowEnd: number;
}

export interface AgentProcessingMetrics {
  agentId: string;
  totalProcessed: number;
  averageProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  successCount: number;
  failureCount: number;
}

export interface RequestMetric {
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
  endpoint?: string;
}

export interface RoutingMetric {
  messageId: string;
  startTime: number;
  endTime: number;
  duration: number;
  sourceAgentId: string;
  targetAgentId: string | null;
}

export interface AgentProcessingMetric {
  agentId: string;
  messageId: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

// ============================================================================
// Performance Monitor
// ============================================================================

export class PerformanceMonitor {
  private requestMetrics: Map<string, RequestMetric> = new Map();
  private completedRequests: RequestMetric[] = [];
  private routingMetrics: RoutingMetric[] = [];
  private agentProcessingMetrics: AgentProcessingMetric[] = [];
  
  private windowStart: number = Date.now();
  private maxHistorySize: number = 10000; // Keep last 10k metrics

  /**
   * Start tracking a request
   */
  startRequest(requestId: string, endpoint?: string): void {
    this.requestMetrics.set(requestId, {
      requestId,
      startTime: Date.now(),
      endpoint
    });
  }

  /**
   * End tracking a request
   */
  endRequest(requestId: string, success: boolean, error?: string): void {
    const metric = this.requestMetrics.get(requestId);
    
    if (!metric) {
      console.warn(`No request metric found for ID: ${requestId}`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    const completedMetric: RequestMetric = {
      ...metric,
      endTime,
      duration,
      success,
      error
    };

    this.completedRequests.push(completedMetric);
    this.requestMetrics.delete(requestId);

    // Trim history if needed
    this.trimHistory();
  }

  /**
   * Record message routing latency
   */
  recordRoutingLatency(
    messageId: string,
    sourceAgentId: string,
    targetAgentId: string | null,
    startTime: number,
    endTime: number
  ): void {
    this.routingMetrics.push({
      messageId,
      startTime,
      endTime,
      duration: endTime - startTime,
      sourceAgentId,
      targetAgentId
    });

    this.trimHistory();
  }

  /**
   * Record agent processing time
   */
  recordAgentProcessing(
    agentId: string,
    messageId: string,
    startTime: number,
    endTime: number,
    success: boolean,
    error?: string
  ): void {
    this.agentProcessingMetrics.push({
      agentId,
      messageId,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error
    });

    this.trimHistory();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();

    // Calculate request metrics
    const totalRequests = this.completedRequests.length;
    const successfulRequests = this.completedRequests.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = this.completedRequests
      .filter(r => r.duration !== undefined)
      .map(r => r.duration!);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    const minResponseTime = responseTimes.length > 0
      ? Math.min(...responseTimes)
      : 0;
    
    const maxResponseTime = responseTimes.length > 0
      ? Math.max(...responseTimes)
      : 0;

    // Calculate routing metrics
    const totalMessagesRouted = this.routingMetrics.length;
    const routingLatencies = this.routingMetrics.map(m => m.duration);
    
    const averageRoutingLatency = routingLatencies.length > 0
      ? routingLatencies.reduce((sum, time) => sum + time, 0) / routingLatencies.length
      : 0;
    
    const minRoutingLatency = routingLatencies.length > 0
      ? Math.min(...routingLatencies)
      : 0;
    
    const maxRoutingLatency = routingLatencies.length > 0
      ? Math.max(...routingLatencies)
      : 0;

    // Calculate agent processing metrics
    const agentProcessingTimes = this.calculateAgentMetrics();

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      totalMessagesRouted,
      averageRoutingLatency,
      minRoutingLatency,
      maxRoutingLatency,
      agentProcessingTimes,
      windowStart: this.windowStart,
      windowEnd: now
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.requestMetrics.clear();
    this.completedRequests = [];
    this.routingMetrics = [];
    this.agentProcessingMetrics = [];
    this.windowStart = Date.now();
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetrics(agentId: string): AgentProcessingMetrics | undefined {
    const metrics = this.calculateAgentMetrics();
    return metrics.get(agentId);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateAgentMetrics(): Map<string, AgentProcessingMetrics> {
    const agentMetricsMap = new Map<string, AgentProcessingMetrics>();

    // Group metrics by agent
    const metricsByAgent = new Map<string, AgentProcessingMetric[]>();
    
    for (const metric of this.agentProcessingMetrics) {
      const existing = metricsByAgent.get(metric.agentId) || [];
      existing.push(metric);
      metricsByAgent.set(metric.agentId, existing);
    }

    // Calculate metrics for each agent
    for (const [agentId, metrics] of metricsByAgent.entries()) {
      const processingTimes = metrics.map(m => m.duration);
      const successCount = metrics.filter(m => m.success).length;
      const failureCount = metrics.length - successCount;

      agentMetricsMap.set(agentId, {
        agentId,
        totalProcessed: metrics.length,
        averageProcessingTime: processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length,
        minProcessingTime: Math.min(...processingTimes),
        maxProcessingTime: Math.max(...processingTimes),
        successCount,
        failureCount
      });
    }

    return agentMetricsMap;
  }

  private trimHistory(): void {
    // Trim completed requests
    if (this.completedRequests.length > this.maxHistorySize) {
      this.completedRequests = this.completedRequests.slice(-this.maxHistorySize);
    }

    // Trim routing metrics
    if (this.routingMetrics.length > this.maxHistorySize) {
      this.routingMetrics = this.routingMetrics.slice(-this.maxHistorySize);
    }

    // Trim agent processing metrics
    if (this.agentProcessingMetrics.length > this.maxHistorySize) {
      this.agentProcessingMetrics = this.agentProcessingMetrics.slice(-this.maxHistorySize);
    }
  }
}
