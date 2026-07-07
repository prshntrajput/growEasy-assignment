const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/ping`);
    return res.ok;
  } catch {
    return false;
  }
}

export { API_BASE_URL };
