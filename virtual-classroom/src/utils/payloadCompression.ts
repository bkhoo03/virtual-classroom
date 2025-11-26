/**
 * Payload compression utilities for optimizing network usage
 * Reduces the size of data sent over the network
 */

/**
 * Compress a string by removing unnecessary whitespace
 */
export function compressJSON(obj: any): string {
  return JSON.stringify(obj);
}

/**
 * Truncate long strings to reduce payload size
 */
export function truncateString(str: string, maxLength: number = 1000): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
}

/**
 * Remove null and undefined values from objects
 */
export function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Compress annotation data by reducing precision
 */
export function compressAnnotationPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  // Reduce precision to 2 decimal places
  return points.map(point => ({
    x: Math.round(point.x * 100) / 100,
    y: Math.round(point.y * 100) / 100,
  }));
}

/**
 * Downsample points array for large annotations
 * Keeps every nth point to reduce data size
 */
export function downsamplePoints(
  points: { x: number; y: number }[],
  maxPoints: number = 100
): { x: number; y: number }[] {
  if (points.length <= maxPoints) {
    return points;
  }

  const step = Math.ceil(points.length / maxPoints);
  const downsampled: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i += step) {
    downsampled.push(points[i]);
  }

  // Always include the last point
  if (downsampled[downsampled.length - 1] !== points[points.length - 1]) {
    downsampled.push(points[points.length - 1]);
  }

  return downsampled;
}

/**
 * Estimate payload size in bytes
 */
export function estimatePayloadSize(obj: any): number {
  const json = JSON.stringify(obj);
  return new Blob([json]).size;
}

/**
 * Compress message history by keeping only recent messages
 */
export function compressMessageHistory<T extends { timestamp?: number | Date }>(
  messages: T[],
  maxMessages: number = 50
): T[] {
  if (messages.length <= maxMessages) {
    return messages;
  }

  // Keep the most recent messages
  return messages.slice(-maxMessages);
}

/**
 * Create a compressed version of an object for network transmission
 */
export function compressForTransmission(obj: any): any {
  // Remove empty values
  let compressed = removeEmptyValues(obj);

  // If object has points array, compress it
  if (compressed.points && Array.isArray(compressed.points)) {
    compressed.points = downsamplePoints(
      compressAnnotationPoints(compressed.points)
    );
  }

  return compressed;
}
