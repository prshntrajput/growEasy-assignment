import { inngest } from '@/inngest/client';

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

export const functions = [testFunction];