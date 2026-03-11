type BindingName =
  | 'MONGODB_DATA_API_URL'
  | 'MONGODB_DATA_API_KEY'
  | 'MONGODB_DATA_SOURCE'
  | 'MONGODB_DATABASE'
  | 'MONGODB_COLLECTION'
  | 'MONGODB_DOCUMENT_ID'
  | 'API_KEY';

const getBinding = (name: BindingName): string | undefined => {
  const value = (globalThis as Record<string, unknown>)[name];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
};

const getRequiredBinding = (name: Exclude<BindingName, 'MONGODB_DOCUMENT_ID' | 'API_KEY'>): string => {
  const value = getBinding(name);
  if (!value) {
    throw new Error(`Missing required binding: ${name}`);
  }
  return value;
};

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...(init?.headers ?? {}),
    },
  });

const isAuthorized = (request: Request) => {
  const apiKey = getBinding('API_KEY');
  if (!apiKey) {
    return true;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  return token === apiKey;
};

const getDocumentId = () => getBinding('MONGODB_DOCUMENT_ID') ?? 'booking-scheduler-state';

const mongoRequest = async <T>(action: string, body: Record<string, unknown>): Promise<T> => {
  const dataApiUrl = getRequiredBinding('MONGODB_DATA_API_URL').replace(/\/$/, '');
  const response = await fetch(`${dataApiUrl}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': getRequiredBinding('MONGODB_DATA_API_KEY'),
    },
    body: JSON.stringify({
      dataSource: getRequiredBinding('MONGODB_DATA_SOURCE'),
      database: getRequiredBinding('MONGODB_DATABASE'),
      collection: getRequiredBinding('MONGODB_COLLECTION'),
      ...body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MongoDB Data API ${action} failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
};

const getMongoState = async () => {
  const result = await mongoRequest<{ document?: { state?: unknown } }>('findOne', {
    filter: { _id: getDocumentId() },
    projection: { state: 1, _id: 0 },
  });

  return result.document?.state ?? null;
};

const putMongoState = async (state: unknown) => {
  await mongoRequest('updateOne', {
    filter: { _id: getDocumentId() },
    update: {
      $set: {
        state,
        updatedAt: new Date().toISOString(),
      },
    },
    upsert: true,
  });
};

const handleRequest = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return json({}, { status: 200 });
  }

  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (request.method === 'GET') {
      const state = await getMongoState();
      if (!state) {
        return json({ state: null }, { status: 404 });
      }

      return json({ state });
    }

    if (request.method === 'PUT') {
      const payload = (await request.json()) as { state?: unknown };
      if (!payload.state) {
        return json({ error: 'Missing state payload' }, { status: 400 });
      }

      await putMongoState(payload.state);
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, { status: 500 });
  }
};

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});
