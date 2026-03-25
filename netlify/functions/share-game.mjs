import { getStore } from '@netlify/blobs';

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  },
  body: JSON.stringify(body)
});

const buildBaseUrl = (event) => {
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const host = event.headers['x-forwarded-host'] || process.env.URL?.replace(/^https?:\/\//, '') || process.env.DEPLOY_PRIME_URL?.replace(/^https?:\/\//, '');
  return `${proto}://${host}`;
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  const store = getStore('pitchtrace-shared-games');

  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return buildResponse(400, { error: 'Missing share id.' });
    }

    try {
      const payload = await store.get(id, { type: 'json' });
      if (!payload) {
        return buildResponse(404, { error: 'Shared game not found.' });
      }
      return buildResponse(200, payload);
    } catch (error) {
      console.error('share-game GET failed', error);
      return buildResponse(500, { error: error.message || 'Could not load shared game.' });
    }
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, { error: 'Method not allowed.' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    if (!Array.isArray(payload?.games) || payload.games.length === 0) {
      return buildResponse(400, { error: 'Shared game payload is missing games.' });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await store.setJSON(id, payload, {
      metadata: {
        exportType: payload.exportType || 'shared-game',
        opponent: payload.opponent || 'Unknown',
        scouting: String(Boolean(payload.scouting))
      }
    });

    const baseUrl = buildBaseUrl(event);
    return buildResponse(200, {
      id,
      url: `${baseUrl}?sharedGame=${id}`
    });
  } catch (error) {
    console.error('share-game POST failed', error);
    return buildResponse(500, { error: `Could not save shared game: ${error.message || 'unknown error'}` });
  }
}
