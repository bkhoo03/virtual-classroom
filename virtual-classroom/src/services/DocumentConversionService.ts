/**
 * DocumentConversionService - Handles Agora Whiteboard file conversion
 * Converts PDF, PPT, PPTX, DOC, DOCX files to whiteboard-compatible format
 */

export interface ConversionConfig {
  type: 'static' | 'dynamic';
  preview?: boolean;
  scale?: number;
  outputFormat?: 'png' | 'jpg';
}

export interface ConversionTask {
  uuid: string;
  type: 'static' | 'dynamic';
  status: 'Waiting' | 'Converting' | 'Finished' | 'Fail';
  convertedPercentage: number;
  pageCount?: number;
  prefix?: string;
  images?: Record<string, {
    width: number;
    height: number;
    url: string;
  }>;
  error?: string;
}

export interface ConvertedDocument {
  resourceName: string;
  resourceUuid: string;
  ext: string;
  url: string;
  size: number;
  updateTime: number;
  taskUuid: string;
  conversion: ConversionConfig;
  taskProgress: {
    prefix: string;
    totalPageSize: number;
    convertedPageSize: number;
    convertedPercentage: number;
    convertedFileList: any[];
    currentStep: string;
    images: Array<{
      name: string;
      width: number;
      height: number;
      url: string;
    }>;
  };
}

class DocumentConversionService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Start a file conversion task
   * Calls backend which then calls Agora's REST API
   */
  async startConversion(
    fileUrl: string,
    fileName: string,
    config: ConversionConfig = { type: 'static', preview: true, scale: 2, outputFormat: 'png' }
  ): Promise<{ taskUuid: string }> {
    try {
      console.log('Starting document conversion:', { fileUrl, fileName, config });

      const response = await fetch(`${this.backendUrl}/api/whiteboard/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          fileName,
          config,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start conversion');
      }

      const data = await response.json();
      console.log('Conversion started:', data);

      return { taskUuid: data.taskUuid };
    } catch (error) {
      console.error('Error starting conversion:', error);
      throw error;
    }
  }

  /**
   * Query the progress of a conversion task
   */
  async queryConversionProgress(taskUuid: string): Promise<ConversionTask> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/whiteboard/convert/${taskUuid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to query conversion progress');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error querying conversion progress:', error);
      throw error;
    }
  }

  /**
   * Poll conversion progress until complete or failed
   */
  async pollConversionProgress(
    taskUuid: string,
    onProgress?: (progress: number) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 60
  ): Promise<ConversionTask> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const task = await this.queryConversionProgress(taskUuid);

        // Notify progress callback
        if (onProgress) {
          onProgress(task.convertedPercentage);
        }

        // Check if conversion is complete
        if (task.status === 'Finished') {
          console.log('Conversion completed successfully');
          return task;
        }

        // Check if conversion failed
        if (task.status === 'Fail') {
          throw new Error(task.error || 'Conversion failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (error) {
        console.error('Error polling conversion progress:', error);
        throw error;
      }
    }

    throw new Error('Conversion timeout: exceeded maximum polling attempts');
  }

  /**
   * Convert Agora conversion result to courseware format
   * Handles both static and dynamic conversions
   */
  convertToWhiteboardFormat(
    task: ConversionTask,
    resourceName: string,
    resourceUuid: string,
    ext: string,
    size: number,
    conversion: ConversionConfig
  ): ConvertedDocument {
    const images: Array<{
      name: string;
      width: number;
      height: number;
      url: string;
    }> = [];

    // For static conversions, process images
    if (task.type === 'static' && task.images) {
      for (const [key, value] of Object.entries(task.images)) {
        images.push({
          name: key,
          width: value.width,
          height: value.height,
          url: value.url,
        });
      }
    }

    return {
      resourceName,
      resourceUuid,
      ext,
      url: '', // Whiteboard converted resources don't need original URL
      size,
      updateTime: Date.now(),
      taskUuid: task.uuid,
      conversion,
      taskProgress: {
        prefix: task.prefix || '',
        totalPageSize: task.pageCount || 0,
        convertedPageSize: task.pageCount || 0,
        convertedPercentage: task.convertedPercentage,
        convertedFileList: [],
        currentStep: task.status,
        images,
      },
    };
  }

  /**
   * Complete conversion workflow: start, poll, and format
   */
  async convertDocument(
    fileUrl: string,
    fileName: string,
    resourceUuid: string,
    fileSize: number,
    config: ConversionConfig = { type: 'static', preview: true, scale: 2, outputFormat: 'png' },
    onProgress?: (progress: number) => void
  ): Promise<ConvertedDocument> {
    try {
      // Start conversion
      const { taskUuid } = await this.startConversion(fileUrl, fileName, config);

      // Poll until complete
      const task = await this.pollConversionProgress(taskUuid, onProgress);

      // Convert to whiteboard format
      const ext = fileName.split('.').pop() || 'pdf';
      const convertedDoc = this.convertToWhiteboardFormat(
        task,
        fileName,
        resourceUuid,
        ext,
        fileSize,
        config
      );

      return convertedDoc;
    } catch (error) {
      console.error('Error in complete conversion workflow:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const documentConversionService = new DocumentConversionService();
export default documentConversionService;
