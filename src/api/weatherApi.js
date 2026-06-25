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

export function normalizeCitySearchQuery(query) {
  return String(query || '')
    .trim()
    .replace(/[\s\-_]+/g, ' ')
    .replace(/\s+/g, ' ');
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

export async function fetchTimeSlotOutfitRecommendations({
  region,
  residenceCity,
  residenceCountryCode,
}) {
  if (!region?.trim()) {
    throw new WeatherApiError('여행 지역을 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  if (residenceCity?.trim() && !residenceCountryCode?.trim()) {
    throw new WeatherApiError('현재 거주 도시의 국가를 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  return requestJson(
    createUrl('/api/weather/outfit-recommendations/time-slots', {
      region: region.trim(),
      residenceCity: residenceCity?.trim(),
      residenceCountryCode: residenceCountryCode?.trim(),
    }),
  );
}

export async function fetchResidenceCities({ countryCode, query }) {
  if (!countryCode?.trim()) {
    throw new WeatherApiError('국가를 선택해 주세요.', 400, 'INVALID_REQUEST');
  }

  const normalizedQuery = normalizeCitySearchQuery(query);

  if (normalizedQuery.length < 2) {
    throw new WeatherApiError('도시 이름을 두 글자 이상 입력해 주세요.', 400, 'INVALID_REQUEST');
  }

  return requestJson(
    createUrl('/api/weather/residence-cities', {
      countryCode: countryCode.trim(),
      query: normalizedQuery,
    }),
  );
}
