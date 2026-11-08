const env = require('../config/env');

const FALLBACK_MESSAGE =
  'AI Health Advisor is temporarily busy. Please try again or contact our clinic hotline directly for urgent pet care.';

/**
 * Call external Google Gemini API with strict 8-second timeout watchdog (NF-01)
 */
const generateGeminiContent = async ({ prompt, systemInstruction = '' }) => {
  if (!env.GEMINI_API_KEY) {
    console.warn('[Gemini Client] GEMINI_API_KEY is not configured in .env. Returning simulated clinical response.');
    return {
      text:
        'Thank you for reaching out to the PHMS AI Health Advisor. For minor symptoms, keep your pet hydrated in a calm, shaded area. Please monitor closely and schedule an examination if symptoms persist.\n\n[Dev Simulation: Configure GEMINI_API_KEY for live LLM responses]',
      isFallback: false,
    };
  }

  const controller = new AbortController();
  // NF-01: AI-assisted requests shall return a response or timeout within 8 seconds
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Gemini Client] Gemini API returned status ${response.status}:`, errText);
      return {
        text: FALLBACK_MESSAGE,
        isFallback: true,
      };
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!candidateText) {
      return {
        text: FALLBACK_MESSAGE,
        isFallback: true,
      };
    }

    return {
      text: candidateText.trim(),
      isFallback: false,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('[Gemini Client] Gemini API request exceeded 8 seconds SLA and timed out.');
    } else {
      console.error('[Gemini Client] Error invoking Gemini API:', error.message);
    }

    return {
      text: FALLBACK_MESSAGE,
      isFallback: true,
    };
  }
};

module.exports = {
  generateGeminiContent,
  FALLBACK_MESSAGE,
};
