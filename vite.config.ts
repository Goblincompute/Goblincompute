import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Server-Side AI Proxy Middleware for Vite Local Development.
 * Reads AI_API_KEY securely from .env.local server-side with multi-model fallback and backoff delay.
 */
function localAiMiddleware(): Plugin {
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemma-4-26b-a4b-it',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function queryGemini(apiKey: string, prompt: string, maxAttempts = 8): Promise<{ statusCode: number; data?: any; modelUsed?: string; error?: string }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const model = candidateModels[attempt % candidateModels.length];

      if (attempt > 0) {
        await sleep(400); // 400ms retry delay on fallback attempts
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
          const data = (await apiResponse.json()) as any;
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (resultText) {
            console.log(`[GOBLIN SERVER] SUCCESS via model ${model} on attempt ${attempt + 1}`);
            return { statusCode: 200, data: resultText.trim(), modelUsed: model };
          }
        }

        const nextModel = candidateModels[(attempt + 1) % candidateModels.length];
        console.log(`[GOBLIN SERVER] Attempt ${attempt + 1} (${model}) FAILED: ${apiResponse.status}. FALLBACK → ${nextModel}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.log(`[GOBLIN SERVER] Attempt ${attempt + 1} (${model}) EXCEPTION: ${msg}`);
      }
    }

    return { statusCode: 503, error: 'AI_SERVICE_UNAVAILABLE' };
  }

  return {
    name: 'local-ai-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ask', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'METHOD NOT ALLOWED' }));
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), '');
        const apiKey = env.AI_API_KEY || process.env.AI_API_KEY || '';
        const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_KEY_HERE');

        if (!isConfigured) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: false,
              error: 'AI_SERVICE_UNAVAILABLE',
              detail: 'Server missing valid AI_API_KEY in .env.local',
            })
          );
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk: Buffer) => {
          bodyStr += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const prompt = body.prompt;

            if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'INVALID_PROMPT' }));
              return;
            }

            const result = await queryGemini(apiKey, prompt);

            if (result.statusCode === 200 && result.data) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, response: result.data, model: result.modelUsed }));
            } else {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'AI_SERVICE_UNAVAILABLE' }));
            }
          } catch (err: unknown) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: 'AI_SERVICE_UNAVAILABLE',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const aiApiKey = env.AI_API_KEY || process.env.AI_API_KEY || '';
  console.log('AI_API_KEY configured:', Boolean(aiApiKey && aiApiKey.trim() !== ''));

  return {
    plugins: [
      react(),
      tailwindcss(),
      localAiMiddleware(),
    ],
  };
});
