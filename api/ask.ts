import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD NOT ALLOWED' });
  }

  const apiKey = process.env.AI_API_KEY;
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

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemma-4-26b-a4b-it',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 0; attempt < 8; attempt++) {
    const model = candidateModels[attempt % candidateModels.length];
    if (attempt > 0) {
      await sleep(400);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
        if (resultText) {
          return res.status(200).json({
            success: true,
            response: resultText.trim(),
            model: model,
          });
        }
      }
    } catch {
      // Continue loop to next candidate
    }
  }

  return res.status(503).json({
    success: false,
    error: 'AI_SERVICE_UNAVAILABLE',
  });
}
