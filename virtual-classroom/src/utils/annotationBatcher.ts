/**
 * Annotation batching utility for optimizing network usage
 * Batches multiple annotation updates into single network requests
 */

interface AnnotationUpdate {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

type BatchCallback = (updates: AnnotationUpdate[]) => Promise<void>;

class AnnotationBatcher {
  private queue: AnnotationUpdate[];
  private batchSize: number;
  private batchDelay: number;
  private timer: ReturnType<typeof setTimeout> | null;
  private callback: BatchCallback | null;

  constructor(batchSize: number = 10, batchDelay: number = 500) {
    this.queue = [];
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
    this.timer = null;
    this.callback = null;
  }

  /**
   * Set the callback function to handle batched updates
   */
  setCallback(callback: BatchCallback): void {
    this.callback = callback;
  }

  /**
   * Add annotation update to the queue
   */
  add(update: AnnotationUpdate): void {
    this.queue.push(update);

    // If batch size reached, flush immediately
    if (this.queue.length >= this.batchSize) {
      this.flush();
      return;
    }

    // Otherwise, schedule a delayed flush
    this.scheduleFlush();
  }

  /**
   * Schedule a delayed flush
   */
  private scheduleFlush(): void {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Set new timer
    this.timer = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  /**
   * Flush all queued updates
   */
  async flush(): Promise<void> {
    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Nothing to flush
    if (this.queue.length === 0) {
      return;
    }

    // Get updates to send
    const updates = [...this.queue];
    this.queue = [];

    // Send updates via callback
    if (this.callback) {
      try {
        await this.callback(updates);
      } catch (error) {
        console.error('Error flushing annotation batch:', error);
        // Re-queue failed updates
        this.queue.unshift(...updates);
      }
    }
  }

  /**
   * Clear all queued updates
   */
  clear(): void {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueSize: this.queue.length,
      batchSize: this.batchSize,
      batchDelay: this.batchDelay,
    };
  }
}

// Create singleton instance
const annotationBatcher = new AnnotationBatcher();

export default annotationBatcher;
