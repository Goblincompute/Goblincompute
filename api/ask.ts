import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD NOT ALLOWED' });
  }

  const apiKey =
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.VITE_AI_API_KEY;

  const isConfigured = Boolean(apiKey && apiKey.trim() !== '');

  if (!isConfigured) {
    return res.status(503).json({
      success: false,
      error: 'AI_SERVICE_UNAVAILABLE',
      detail: 'Vercel environment variable AI_API_KEY is not configured in Project Settings.',
    });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ success: false, error: 'INVALID_PROMPT' });
  }

  // Model fallback architecture: Primary -> Fallback 1 -> Fallback 2
  const models = [
    'gemini-3.5-flash-lite', // Primary model (fastest, high availability)
    'gemini-3.5-flash',      // Fallback 1
    'gemini-3.6-flash',      // Fallback 2
  ];

  const startTime = Date.now();
  const MAX_TOTAL_BACKEND_MS = 22000; // 22s max backend execution
  const MAX_ATTEMPT_MS = 10000;       // 10s max per model attempt

  let lastStatus = 503;
  let lastErrorDetail = 'AI_SERVICE_UNAVAILABLE';

  for (const model of models) {
    // Enforce 22s total backend time budget
    const elapsed = Date.now() - startTime;
    if (elapsed >= MAX_TOTAL_BACKEND_MS) {
      break;
    }

    const remainingBudget = MAX_TOTAL_BACKEND_MS - elapsed;
    const attemptTimeoutMs = Math.min(MAX_ATTEMPT_MS, remainingBudget);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), attemptTimeoutMs);

      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are GOBLIN_001, a retro Web3 terminal AI assistant for GOBLIN COMPUTE on Robinhood Chain. Answer concisely in a direct, retro terminal hacker tone (no markdown fluff, 2-4 sentences max).\n\nUser Question: ${prompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      clearTimeout(timeoutId);

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (resultText && resultText.trim()) {
          return res.status(200).json({
            success: true,
            response: resultText.trim(),
            model: model,
          });
        }
      }

      lastStatus = apiResponse.status;
      const errData = await apiResponse.json().catch(() => ({}));
      lastErrorDetail = errData.error?.message || `HTTP ${apiResponse.status}`;

      // Retry only on 429, 500, 502, 503
      const retryableStatuses = [429, 500, 502, 503];
      if (!retryableStatuses.includes(apiResponse.status)) {
        break;
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastStatus = isAbort ? 504 : 503;
      lastErrorDetail = isAbort ? 'TIMEOUT' : 'NETWORK_ERROR';
    }
  }

  return res.status(503).json({
    success: false,
    error: 'AI_SERVICE_UNAVAILABLE',
    detail: lastErrorDetail,
    lastStatus,
  });
}
