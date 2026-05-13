export async function generateStrategicAnalysis(
  prompt: string
): Promise<string> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                 (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : '') || '';
  
  if (!apiKey) {
    return 'AI analysis unavailable — add VITE_GEMINI_API_KEY to environment variables.';
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           'No analysis generated.';
  } catch (err) {
    console.error('Gemini Analysis Error:', err);
    return 'Analysis failed. Check your API key and try again.';
  }
}
