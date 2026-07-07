import { JobStatus } from '@/types/api.types';

class JobStoreService {
  private store = new Map<string, JobStatus>();

  public create(jobId: string, totalBatches: number): void {
    this.store.set(jobId, {
      jobId,
      status: 'processing',
      progress: 0,
      totalBatches,
      completedBatches: 0,
    } as JobStatus & { totalBatches: number; completedBatches: number });
  }

  public get(jobId: string): JobStatus | undefined {
    return this.store.get(jobId);
  }

  public update(jobId: string, patch: Partial<JobStatus>): void {
    const existing = this.store.get(jobId);
    if (!existing) return;
    this.store.set(jobId, { ...existing, ...patch });
  }

  public delete(jobId: string): void {
    this.store.delete(jobId);
  }
}

export const jobStoreService = new JobStoreService();