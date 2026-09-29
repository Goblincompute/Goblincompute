/**
 * AI Provider Client Service for GOBLIN COMPUTE
 * Securely calls POST /api/ask server route.
 * Features 25s maximum frontend timeout.
 */

export interface AIResponse {
  success: boolean;
  result?: string;
  model?: string;
  error?: string;
}

export async function runGoblinInference(prompt: string): Promise<AIResponse> {
  const targetUrl = '/api/ask';

  try {
    const controller = new AbortController();
    // Maximum 25s frontend timeout
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ prompt }),
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      console.warn('[GOBLIN AI DEBUG]', {
        url: targetUrl,
        status: res.status,
        error: data.error || 'AI_SERVICE_UNAVAILABLE',
      });

      if (res.status === 404) {
        return {
          success: false,
          error: 'AI SERVICE UNAVAILABLE',
        };
      }

      if (data.error === 'AI_SERVICE_UNAVAILABLE' || res.status === 503) {
        return {
          success: false,
          error: 'AI SERVICE BUSY',
        };
      }

      return {
        success: false,
        error: data.error || 'AI SERVICE UNAVAILABLE',
      };
    }

    return {
      success: true,
      result: data.response,
      model: data.model,
    };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';

    console.warn('[GOBLIN AI DEBUG]', {
      url: targetUrl,
      status: isTimeout ? 504 : 0,
      error: isTimeout ? 'REQUEST TIMEOUT' : 'NETWORK_FAILURE',
    });

    if (isTimeout) {
      return {
        success: false,
        error: 'REQUEST TIMEOUT',
      };
    }

    return {
      success: false,
      error: 'AI SERVICE UNAVAILABLE',
    };
  }
}
