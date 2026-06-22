const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

export class WeatherApiError extends Error {
  constructor(message, status = 0, code = 'WEATHER_API_ERROR') {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
  }
}

function createUrl(path, query = {}) {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function requestJson(url, signal) {
  let response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new WeatherApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new WeatherApiError(
      payload?.message || '날씨 정보를 불러오지 못했습니다.',
      response.status,
      payload?.code || 'WEATHER_API_ERROR',
    );
  }

  return payload;
}

function normalizeRegionName(region) {
  if (typeof region === 'string') {
    return region.trim();
  }

  if (typeof region === 'object' && region !== null) {
    return region.displayName?.trim() || region.name?.trim() || region.region?.trim() || '';
  }

  return '';
}

function extractRegions(payload) {
  const candidates = [payload?.regions, payload?.regionNames, payload?.items, payload];

  const regionList = candidates.find(candidate => Array.isArray(candidate));

  if (!regionList) {
    throw new WeatherApiError('충북 지역 목록 응답 형식이 올바르지 않습니다.');
  }

  return regionList.map(normalizeRegionName).filter(Boolean);
}

export async function fetchWeatherRegions({ signal } = {}) {
  const payload = await requestJson(createUrl('/api/weather/regions'), signal);

  return extractRegions(payload);
}

export async function fetchOutfitRecommendation({ region, travelStyle }, { signal } = {}) {
  if (!region?.trim()) {
    throw new WeatherApiError('지역을 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  if (!travelStyle?.trim()) {
    throw new WeatherApiError('여행 스타일을 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  return requestJson(
    createUrl('/api/weather/outfit-recommendation', {
      region: region.trim(),
      travelStyle: travelStyle.trim(),
    }),
    signal,
  );
}
