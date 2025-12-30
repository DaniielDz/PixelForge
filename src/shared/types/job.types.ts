export interface JobEntity {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  originalFileName: string;
  mimeType: string;
  rawFileUrl: string;
  processedFileUrl?: string;
  targetWidth: number;
  targetHeight: number;
  outputFormat: 'webp' | 'jpeg' | 'png' | 'avif';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobRepositoryDTO {
  status: JobEntity['status'];
  originalFileName: string;
  mimeType: string;
  rawFileUrl: string;
  targetWidth: number;
  targetHeight: number;
  outputFormat: 'webp' | 'jpeg' | 'png' | 'avif';
}
