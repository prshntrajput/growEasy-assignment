import { JobStatus } from '@/types/api.types';

type StoredJobStatus = JobStatus & {
  totalBatches: number;
  completedBatches: number;
};

class JobStoreService {
  private store = new Map<string, StoredJobStatus>();

  public create(jobId: string, totalBatches: number): void {
    this.store.set(jobId, {
      jobId,
      status: 'processing',
      progress: 0,
      totalBatches,
      completedBatches: 0,
      result: undefined,
      error: undefined,
    });
  }

  public get(jobId: string): JobStatus | undefined {
    return this.store.get(jobId);
  }

  public update(jobId: string, patch: Partial<StoredJobStatus>): void {
    const existing = this.store.get(jobId);
    if (!existing) return;

    this.store.set(jobId, {
      ...existing,
      ...patch,
    });
  }

  public markDone(jobId: string, result: JobStatus['result']): void {
    const existing = this.store.get(jobId);
    if (!existing) return;

    this.store.set(jobId, {
      ...existing,
      status: 'done',
      progress: 100,
      completedBatches: existing.totalBatches,
      result,
      error: undefined,
    });
  }

  public markFailed(jobId: string, error: string): void {
    const existing = this.store.get(jobId);
    if (!existing) return;

    this.store.set(jobId, {
      ...existing,
      status: 'failed',
      error,
    });
  }

  public incrementProgress(jobId: string): void {
    const existing = this.store.get(jobId);
    if (!existing) return;

    const completedBatches = Math.min(existing.completedBatches + 1, existing.totalBatches);
    const progress = Math.round((completedBatches / existing.totalBatches) * 100);

    this.store.set(jobId, {
      ...existing,
      completedBatches,
      progress,
      status: completedBatches === existing.totalBatches ? existing.status : 'processing',
    });
  }

  public delete(jobId: string): void {
    this.store.delete(jobId);
  }
}

export const jobStoreService = new JobStoreService();
