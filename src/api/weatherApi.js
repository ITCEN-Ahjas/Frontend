const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

export class WeatherApiError extends Error {
  constructor(message, status = 0, code = 'WEATHER_API_ERROR') {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
  }
}

function createUrl(path, query = {}) {
  const url = new URL(path, `${API_BASE_URL}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function requestJson(url) {
  let response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new WeatherApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new WeatherApiError(
      payload?.message || '옷차림 추천 정보를 불러오지 못했습니다.',
      response.status,
      payload?.code || 'WEATHER_API_ERROR',
    );
  }

  return payload;
}

export async function fetchBatchOutfitRecommendations({ region }) {
  if (!region?.trim()) {
    throw new WeatherApiError('지역을 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  return requestJson(
    createUrl('/api/weather/outfit-recommendations', {
      region: region.trim(),
    }),
  );
}
