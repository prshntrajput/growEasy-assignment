import { inngest } from '@/inngest/client';
import { jobStoreService } from '@/services/job-store.service';
import { aiExtractionService, AiExtractedRecord } from '@/services/ai-extraction.service';
import { resultAggregatorService } from '@/services/result-aggregator.service';
import { CsvBatch } from '@/services/batch.service';

const testFunction = inngest.createFunction(
  {
    id: 'test-hello-world',
    retries: 2,
    triggers: { event: 'test/hello.world' },
  },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: `Hello ${event.data?.email ?? 'World'}!` };
  }
);

const processCsvImport = inngest.createFunction(
  {
    id: 'process-csv-import',
    retries: 3,
    triggers: { event: 'import/csv.requested' },
  },
  async ({ event, step }) => {
    const { jobId, totalBatches, batches } = event.data as {
      jobId: string;
      totalBatches: number;
      batches: CsvBatch[];
    };

    jobStoreService.create(jobId, totalBatches);

    try {
      const extractedBatches: AiExtractedRecord[][] = [];
      const originalRowBatches = batches.map((b) => b.rows);

      for (const batch of batches) {
        const extracted = await step.run(`extract-batch-${batch.batchIndex}`, async () => {
          return aiExtractionService.extractBatch(batch.headers, batch.rows);
        });

        extractedBatches.push(extracted);

        const completed = batch.batchIndex + 1;
        const progress = Math.round((completed / totalBatches) * 100);

        jobStoreService.update(jobId, {
          status: 'processing',
          progress,
          completedBatches: completed,
        });
      }

      const summary = await step.run('aggregate-results', async () => {
        return resultAggregatorService.aggregate(extractedBatches, originalRowBatches);
      });

      jobStoreService.update(jobId, {
        status: 'done',
        progress: 100,
        result: summary,
      });

      return { jobId, ...summary };
    } catch (err) {
      jobStoreService.update(jobId, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'AI processing failed after all retry attempts',
      });
      throw err;
    }
  }
);

export const functions = [testFunction, processCsvImport];
