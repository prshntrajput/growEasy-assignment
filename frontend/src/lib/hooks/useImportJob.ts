'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  confirmImport,
  getJobStatus,
  ApiError,
  JobStatus,
} from '@/lib/api.client';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;

export type ImportPhase =
  | 'idle'
  | 'submitting'
  | 'processing'
  | 'done'
  | 'error';

interface UseImportJobState {
  phase: ImportPhase;
  jobStatus: JobStatus | null;
  errorMessage: string | null;
}

export function useImportJob() {
  const [state, setState] = useState<UseImportJobState>({
    phase: 'idle',
    jobStatus: null,
    errorMessage: null,
  });

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastParsedCsvRef = useRef<ParsedCsv | null>(null);
  const attemptsRef = useRef(0);
  const pollRef = useRef<((jobId: string) => Promise<void>) | null>(null);

  const clearPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (jobId: string): Promise<void> => {
      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
        clearPolling();
        setState({
          phase: 'error',
          jobStatus: null,
          errorMessage:
            'Import is taking too long. Please try again or check back later.',
        });
        return;
      }

      try {
        const status = await getJobStatus(jobId);

        if (status.status === 'done') {
          clearPolling();
          setState({ phase: 'done', jobStatus: status, errorMessage: null });
          return;
        }

        if (status.status === 'failed') {
          clearPolling();
          setState({
            phase: 'error',
            jobStatus: status,
            errorMessage:
              status.error || 'AI processing failed for this import job.',
          });
          return;
        }

        setState({ phase: 'processing', jobStatus: status, errorMessage: null });

        pollTimeoutRef.current = setTimeout(() => {
          void pollRef.current?.(jobId);
        }, POLL_INTERVAL_MS);
      } catch (err) {
        clearPolling();

        const message =
          err instanceof ApiError
            ? err.statusCode === 0
              ? 'Lost connection to the server. Please check your network and retry.'
              : err.message
            : 'An unexpected error occurred while checking import status.';

        setState({ phase: 'error', jobStatus: null, errorMessage: message });
      }
    },
    [clearPolling]
  );

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  const startImport = useCallback(
    async (parsedCsv: ParsedCsv) => {
      lastParsedCsvRef.current = parsedCsv;
      attemptsRef.current = 0;
      clearPolling();

      setState({ phase: 'submitting', jobStatus: null, errorMessage: null });

      try {
        const { jobId, totalBatches } = await confirmImport(parsedCsv);

        setState({
          phase: 'processing',
          jobStatus: {
            jobId,
            status: 'processing',
            progress: 0,
            totalBatches,
            completedBatches: 0,
          },
          errorMessage: null,
        });

        pollTimeoutRef.current = setTimeout(() => {
          void pollRef.current?.(jobId);
        }, POLL_INTERVAL_MS);
      } catch (err) {
        clearPolling();

        const message =
          err instanceof ApiError
            ? err.statusCode === 0
              ? 'Could not reach the server. Please check your connection and retry.'
              : err.message
            : 'Failed to start the import. Please try again.';

        setState({ phase: 'error', jobStatus: null, errorMessage: message });
      }
    },
    [clearPolling]
  );

  const retry = useCallback(() => {
    if (lastParsedCsvRef.current) {
      void startImport(lastParsedCsvRef.current);
    }
  }, [startImport]);

  const reset = useCallback(() => {
    clearPolling();
    attemptsRef.current = 0;
    setState({ phase: 'idle', jobStatus: null, errorMessage: null });
  }, [clearPolling]);

  return { ...state, startImport, retry, reset };
}