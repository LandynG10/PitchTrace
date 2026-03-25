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

const getSupabaseConfig = () => {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey)
  };
};

const buildSupabaseHeaders = (anonKey) => ({
  'Content-Type': 'application/json',
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`
});

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

  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured) {
    return buildResponse(500, { error: 'Supabase environment variables are not configured on Netlify.' });
  }

  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return buildResponse(400, { error: 'Missing share id.' });
    }

    try {
      const query = new URLSearchParams({
        select: 'payload',
        share_id: `eq.${id}`,
        limit: '1'
      });
      const response = await fetch(`${url}/rest/v1/shared_games?${query.toString()}`, {
        headers: buildSupabaseHeaders(anonKey)
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || 'Could not load shared game from Supabase.');
      }
      const data = text ? JSON.parse(text) : [];
      const payload = Array.isArray(data) ? data[0]?.payload : null;
      if (!payload) {
        return buildResponse(404, { error: 'Shared game not found.' });
      }
      return buildResponse(200, payload);
    } catch (error) {
      console.error('share-game GET failed', error);
      return buildResponse(500, {
        error: `Could not load shared game: ${error?.message || 'unknown error'}`,
        supabaseHost: url || 'missing'
      });
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
    const response = await fetch(`${url}/rest/v1/shared_games`, {
      method: 'POST',
      headers: {
        ...buildSupabaseHeaders(anonKey),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        share_id: id,
        opponent: payload?.opponent || 'Unknown',
        scouting: Boolean(payload?.scouting),
        payload
      })
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Could not save shared game to Supabase.');
    }

    const baseUrl = buildBaseUrl(event);
    return buildResponse(200, {
      id,
      url: `${baseUrl}?sharedGame=${id}`
    });
  } catch (error) {
    console.error('share-game POST failed', error);
    return buildResponse(500, {
      error: `Could not save shared game: ${error?.message || 'unknown error'}`,
      supabaseHost: url || 'missing'
    });
  }
}
