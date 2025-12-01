import { useState, useRef } from 'react';
import { documentConversionService } from '../services/DocumentConversionService';
import type { ConvertedDocument } from '../services/DocumentConversionService';

interface DocumentUploadProps {
  onDocumentConverted: (document: ConvertedDocument) => void;
  onError: (error: string) => void;
}

export default function DocumentUpload({ onDocumentConverted, onError }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      onError('Invalid file type. Supported formats: PDF, PPT, PPTX, DOC, DOCX');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      onError('File size exceeds 100MB limit');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setConversionProgress(0);

    try {
      // Step 1: Upload file to backend server
      const fileUrl = await uploadFileToStorage(file);
      
      setIsUploading(false);
      setIsConverting(true);

      // Step 2: Convert document using Agora API
      const resourceUuid = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Determine conversion type based on file extension
      const dynamicFormats = ['ppt', 'pptx'];
      const conversionType = dynamicFormats.includes(ext) ? 'dynamic' : 'static';

      console.log('Starting conversion for:', file.name, 'Type:', conversionType);

      const convertedDoc = await documentConversionService.convertDocument(
        fileUrl,
        file.name,
        resourceUuid,
        file.size,
        {
          type: conversionType,
          preview: true,
          scale: 2,
          outputFormat: 'png',
        },
        (progress) => {
          setConversionProgress(progress);
        }
      );

      setIsConverting(false);
      onDocumentConverted(convertedDoc);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing document:', error);
      setIsUploading(false);
      setIsConverting(false);
      onError(error instanceof Error ? error.message : 'Failed to process document');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Upload file to backend server
   * The backend will store it and return a publicly accessible URL
   */
  const uploadFileToStorage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${backendUrl}/api/upload/document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data.fileUrl);
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to server');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isUploading || isConverting}
        className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
      >
        {isUploading || isConverting ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <span>
              {isUploading && 'Uploading...'}
              {isConverting && `Converting... ${conversionProgress}%`}
            </span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Upload Document</span>
          </>
        )}
      </button>

      {/* Progress indicator */}
      {isConverting && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-[250px]">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Converting {fileName}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${conversionProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {conversionProgress}%
          </div>
        </div>
      )}
    </div>
  );
}
