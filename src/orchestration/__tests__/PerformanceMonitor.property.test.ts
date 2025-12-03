// Feature: multi-agent-skeleton, Property 17: Response time tracking
// **Validates: Requirements 7.5**

import fc from 'fast-check';
import { PerformanceMonitor } from '../PerformanceMonitor';

describe('Property 17: Response time tracking', () => {
  it('should track response time for all requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of request IDs
        fc.array(fc.uuid(), { minLength: 1, maxLength: 50 }),
        // Generate success/failure flags
        fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }),
        async (requestIds, successFlags) => {
          const monitor = new PerformanceMonitor();
          
          // Ensure arrays are same length
          const minLength = Math.min(requestIds.length, successFlags.length);
          const ids = requestIds.slice(0, minLength);
          const flags = successFlags.slice(0, minLength);
          
          // Start and end each request
          for (let i = 0; i < ids.length; i++) {
            const requestId = ids[i];
            const success = flags[i];
            
            monitor.startRequest(requestId, '/api/test');
            
            // Simulate some processing time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            
            monitor.endRequest(requestId, success, success ? undefined : 'Test error');
          }
          
          // Get metrics
          const metrics = monitor.getMetrics();
          
          // Verify all requests were tracked
          expect(metrics.totalRequests).toBe(ids.length);
          
          // Verify successful/failed counts
          const expectedSuccessful = flags.filter(f => f).length;
          const expectedFailed = flags.filter(f => !f).length;
          expect(metrics.successfulRequests).toBe(expectedSuccessful);
          expect(metrics.failedRequests).toBe(expectedFailed);
          
          // Verify response time metrics are recorded
          if (ids.length > 0) {
            expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
            expect(metrics.minResponseTime).toBeGreaterThanOrEqual(0);
            expect(metrics.maxResponseTime).toBeGreaterThanOrEqual(metrics.minResponseTime);
            expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(metrics.minResponseTime);
            expect(metrics.averageResponseTime).toBeLessThanOrEqual(metrics.maxResponseTime);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should track response times independently for each request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            endpoint: fc.constantFrom('/api/message', '/api/state', '/api/agent'),
            success: fc.boolean(),
            delay: fc.integer({ min: 0, max: 2 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (requests) => {
          const monitor = new PerformanceMonitor();
          
          // Process all requests
          for (const req of requests) {
            monitor.startRequest(req.id, req.endpoint);
            await new Promise(resolve => setTimeout(resolve, req.delay));
            monitor.endRequest(req.id, req.success);
          }
          
          const metrics = monitor.getMetrics();
          
          // Verify total count matches
          expect(metrics.totalRequests).toBe(requests.length);
          
          // Verify success/failure counts
          const successCount = requests.filter(r => r.success).length;
          const failureCount = requests.length - successCount;
          expect(metrics.successfulRequests).toBe(successCount);
          expect(metrics.failedRequests).toBe(failureCount);
          
          // Verify response time metrics are recorded and reasonable
          if (requests.length > 0) {
            // Response times should be non-negative
            expect(metrics.minResponseTime).toBeGreaterThanOrEqual(0);
            expect(metrics.maxResponseTime).toBeGreaterThanOrEqual(metrics.minResponseTime);
            expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(metrics.minResponseTime);
            expect(metrics.averageResponseTime).toBeLessThanOrEqual(metrics.maxResponseTime);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('should handle concurrent request tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 5, maxLength: 20 }),
        async (requestIds) => {
          const monitor = new PerformanceMonitor();
          
          // Start all requests concurrently
          requestIds.forEach(id => {
            monitor.startRequest(id, '/api/test');
          });
          
          // End them in random order with random delays
          const endPromises = requestIds.map(async (id, index) => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
            monitor.endRequest(id, index % 2 === 0);
          });
          
          await Promise.all(endPromises);
          
          const metrics = monitor.getMetrics();
          
          // All requests should be tracked
          expect(metrics.totalRequests).toBe(requestIds.length);
          
          // Response times should be recorded
          expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain accurate metrics after reset', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        async (firstBatch, secondBatch) => {
          const monitor = new PerformanceMonitor();
          
          // Process first batch
          for (const id of firstBatch) {
            monitor.startRequest(id);
            monitor.endRequest(id, true);
          }
          
          // Reset
          monitor.reset();
          
          // Process second batch
          for (const id of secondBatch) {
            monitor.startRequest(id);
            monitor.endRequest(id, true);
          }
          
          const metrics = monitor.getMetrics();
          
          // Should only have second batch metrics
          expect(metrics.totalRequests).toBe(secondBatch.length);
          expect(metrics.successfulRequests).toBe(secondBatch.length);
          expect(metrics.failedRequests).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
