const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    return;
  }

  try {
    const { transcript = '', allowedPitchTypes = [], context = {} } = req.body || {};
    if (!transcript.trim()) {
      res.status(400).json({ error: 'Transcript is required.' });
      return;
    }

    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['cleaned_transcript', 'pitch_type', 'mode', 'is_strike', 'strike_type', 'ball_type', 'outcome', 'detail', 'confidence'],
      properties: {
        cleaned_transcript: { type: 'string' },
        pitch_type: { type: 'string' },
        mode: { type: 'string', enum: ['pitch', 'result', 'unknown'] },
        is_strike: { type: 'string', enum: ['true', 'false', 'unknown'] },
        strike_type: { type: 'string' },
        ball_type: { type: 'string' },
        outcome: { type: 'string' },
        detail: { type: 'string' },
        confidence: { type: 'number' }
      }
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You normalize baseball pitch-tracking voice transcripts into one structured command. Fix obvious speech-to-text mistakes. Use only the allowed pitch types if possible. "Ball in play" is contact, not a ball. Convert compact fielding shorthand like 63 to 6-3 and 643 to 6-4-3. Return unknown values as empty strings or "unknown".'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  transcript,
                  allowed_pitch_types: allowedPitchTypes,
                  context
                })
              }
            ]
          }
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'pitchtrace_voice_command',
            strict: true,
            schema
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText || 'OpenAI request failed.' });
      return;
    }

    const data = await response.json();
    const rawText =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text ||
      '';

    res.status(200).json({ output_text: rawText });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error.' });
  }
}

export const config = {
  runtime: 'nodejs'
};
