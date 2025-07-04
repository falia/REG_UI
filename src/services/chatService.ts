// src/services/chatService.ts
const API_BASE_URL = 'https://rkyfkt7bei.execute-api.eu-west-1.amazonaws.com/prod';

export interface ChatHistory {
  user: string;
  assistant: string;
}

export interface JobSubmissionResponse {
  jobId: string;
  status: 'PENDING';
  message: string;
  statusUrl: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  query?: string;
  result?: ChatResult;
  error?: string;
  progress?: string;
}

export interface ChatResult {
  answer?: string;
  sources?: string[];
  success: boolean;
  comparison?: string;
  workflow?: string;
  circular1?: string;
  circular2?: string;
  query?: string;
  num_documents_found?: number;
  num_documents_used?: number;
}

export interface PollingOptions {
  pollInterval?: number; // milliseconds
  maxAttempts?: number;
  onProgress?: (status: JobStatusResponse) => void;
}

export class ChatService {
  /**
   * Submit a query and return job information immediately
   */
  static async submitQuery(
    query: string,
    history: ChatHistory[] = [],
    options: { max_results?: number; threshold?: number } = {}
  ): Promise<JobSubmissionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          action: 'query',
          history,
          max_results: options.max_results || 20,
          threshold: options.threshold || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting query:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to submit query'
      );
    }
  }

  /**
   * Check the status of a job
   */
  static async checkJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking job status:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to check job status'
      );
    }
  }

  /**
   * Poll for job completion with configurable options
   */
  static async pollForCompletion(
    jobId: string,
    options: PollingOptions = {}
  ): Promise<ChatResult> {
    const {
      pollInterval = 2000, // 2 seconds
      maxAttempts = 300, // 10 minutes max
      onProgress,
    } = options;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.checkJobStatus(jobId);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'COMPLETED') {
          if (!status.result) {
            throw new Error('Job completed but no result available');
          }
          return status.result;
        }

        if (status.status === 'FAILED') {
          throw new Error(`Job failed: ${status.error || 'Unknown error'}`);
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        // If it's a job failure, throw immediately
        if (error instanceof Error && error.message.startsWith('Job failed:')) {
          throw error;
        }
        
        // For other errors, continue polling (might be temporary network issues)
        console.warn(`Polling attempt ${attempt + 1} failed:`, error);
        
        // If we're near the end of attempts, throw the error
        if (attempt >= maxAttempts - 3) {
          throw error;
        }
        
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Job polling timed out');
  }

  /**
   * Submit query and wait for completion (convenience method)
   */
  static async sendMessage(
    query: string,
    history: ChatHistory[] = [],
    options: {
      max_results?: number;
      threshold?: number;
      pollInterval?: number;
      maxAttempts?: number;
      onProgress?: (status: JobStatusResponse) => void;
    } = {}
  ): Promise<ChatResult> {
    try {
      // Submit the query
      const submission = await this.submitQuery(query, history, {
        max_results: options.max_results,
        threshold: options.threshold,
      });

      // Poll for completion
      const result = await this.pollForCompletion(submission.jobId, {
        pollInterval: options.pollInterval,
        maxAttempts: options.maxAttempts,
        onProgress: options.onProgress,
      });

      return result;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return {
        answer: 'Sorry, there was an error processing your request.',
        sources: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check API health
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Health check failed'
      );
    }
  }

  /**
   * Cancel a job (stops polling, doesn't actually cancel server-side processing)
   */
  static cancelJob(jobId: string): void {
    // In a real implementation, you might want to track active polling operations
    // and be able to cancel them. For now, this is just a placeholder.
    console.log(`Job ${jobId} polling cancelled`);
  }
}

/**
 * Hook-like service for React components with state management
 */
export class ChatServiceWithState {
  private jobId: string | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private onStatusUpdate?: (status: JobStatusResponse) => void;
  private onResult?: (result: ChatResult) => void;
  private onError?: (error: string) => void;

  constructor(callbacks: {
    onStatusUpdate?: (status: JobStatusResponse) => void;
    onResult?: (result: ChatResult) => void;
    onError?: (error: string) => void;
  }) {
    this.onStatusUpdate = callbacks.onStatusUpdate;
    this.onResult = callbacks.onResult;
    this.onError = callbacks.onError;
  }

  async submitQuery(
    query: string,
    history: ChatHistory[] = [],
    options: { max_results?: number; threshold?: number } = {}
  ): Promise<void> {
    try {
      // Stop any existing polling
      this.stopPolling();

      // Submit query
      const submission = await ChatService.submitQuery(query, history, options);
      this.jobId = submission.jobId;

      // Start polling
      this.startPolling();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit query';
      if (this.onError) {
        this.onError(errorMessage);
      }
    }
  }

  private startPolling(): void {
    if (!this.jobId) return;

    this.pollingInterval = setInterval(async () => {
      if (!this.jobId) return;

      try {
        const status = await ChatService.checkJobStatus(this.jobId);

        if (this.onStatusUpdate) {
          this.onStatusUpdate(status);
        }

        if (status.status === 'COMPLETED') {
          this.stopPolling();
          if (status.result && this.onResult) {
            this.onResult(status.result);
          }
        } else if (status.status === 'FAILED') {
          this.stopPolling();
          if (this.onError) {
            this.onError(status.error || 'Job failed');
          }
        }
      } catch (error) {
        this.stopPolling();
        if (this.onError) {
          this.onError(error instanceof Error ? error.message : 'Polling failed');
        }
      }
    }, 2000); // Poll every 2 seconds
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getCurrentJobId(): string | null {
    return this.jobId;
  }

  destroy(): void {
    this.stopPolling();
    this.jobId = null;
  }
}

// Utility function to format comparison results
export function formatComparisonResult(result: ChatResult): string {
  if (!result.comparison) {
    return result.answer || 'No comparison available';
  }

  try {
    const comparison = JSON.parse(result.comparison);
    return `
**Comparison: ${result.circular1} vs ${result.circular2}**

**Purpose and Scope:**
${comparison.purpose_and_scope}

**Key Differences:**
${comparison.key_differences}

**Timeline and Amendments:**
${comparison.timeline_and_amendments}

**Institutional Impact:**
${comparison.institutional_impact}

**Recommendations:**
${comparison.recommendations}
    `.trim();
  } catch {
    return result.comparison;
  }
}

// Export types for use in components
export type {
  JobSubmissionResponse,
  JobStatusResponse,
  ChatResult,
  PollingOptions,
};