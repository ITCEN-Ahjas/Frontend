const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

const DEFAULT_WEATHER = {
  condition: 'clear',
  precipitationProbability: 10,
  temperature: 23,
  feelsLikeTemperature: 24,
  fineDustLevel: 'normal',
};

const CATEGORY_BY_INTEREST = {
  nature: 'TOURIST_ATTRACTION',
  history: 'TOURIST_ATTRACTION',
  culture: 'TOURIST_ATTRACTION',
  food: 'RESTAURANT',
  shopping: 'SHOPPING',
  healing: 'TOURIST_ATTRACTION',
};

function createUrl(path, query = {}) {
  const url = new URL(path, `${API_BASE_URL}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || '요청을 처리하지 못했습니다.');
  }

  return payload;
}

function toHourNumber(time) {
  const [hour] = String(time || '09:00').split(':');
  const parsedHour = Number(hour);

  return Number.isFinite(parsedHour) ? parsedHour : 9;
}

function padHour(hour) {
  return String(Math.min(Math.max(hour, 0), 23)).padStart(2, '0');
}

function buildHourlySlots(startTime, endTime) {
  const startHour = toHourNumber(startTime);
  const endHour = Math.max(toHourNumber(endTime), startHour + 1);
  const slots = [];

  for (let hour = startHour; hour <= endHour; hour += 2) {
    slots.push(`${padHour(hour)}:00`);
  }

  if (!slots.includes(`${padHour(endHour)}:00`)) {
    slots.push(`${padHour(endHour)}:00`);
  }

  return slots;
}

function normalizeCondition(value) {
  const condition = String(value || '').toLowerCase();

  if (condition.includes('rain') || condition.includes('비')) {
    return 'rain';
  }

  if (condition.includes('snow') || condition.includes('눈')) {
    return 'snow';
  }

  if (condition.includes('cloud') || condition.includes('흐') || condition.includes('구름')) {
    return 'cloudy';
  }

  return 'clear';
}

function normalizeFineDustLevel(value) {
  const dustLevel = String(value || '').toLowerCase();

  if (['good', 'normal', 'bad', 'veryBad'].includes(dustLevel)) {
    return dustLevel;
  }

  if (dustLevel.includes('좋')) {
    return 'good';
  }

  if (dustLevel.includes('나쁨') || dustLevel.includes('bad')) {
    return 'bad';
  }

  if (dustLevel.includes('매우')) {
    return 'veryBad';
  }

  return 'normal';
}

function pickNumber(source, keys, fallback) {
  for (const key of keys) {
    const value = Number(source?.[key]);

    if (Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function normalizeWeatherItem(item, index, slots) {
  return {
    time: item?.time || item?.hour || item?.forecastTime || slots[index] || `${padHour(9 + index * 2)}:00`,
    condition: normalizeCondition(item?.condition || item?.weatherCondition || item?.skyStatus),
    precipitationProbability: pickNumber(
      item,
      ['precipitationProbability', 'rainProbability', 'pop'],
      DEFAULT_WEATHER.precipitationProbability,
    ),
    temperature: pickNumber(item, ['temperature', 'temp'], DEFAULT_WEATHER.temperature),
    feelsLikeTemperature: pickNumber(
      item,
      ['feelsLikeTemperature', 'feelsLike', 'apparentTemperature'],
      DEFAULT_WEATHER.feelsLikeTemperature,
    ),
    fineDustLevel: normalizeFineDustLevel(item?.fineDustLevel || item?.fineDust || item?.pm10Grade),
  };
}

function buildFallbackWeatherTimeline({ startTime, endTime }) {
  return buildHourlySlots(startTime, endTime).map((time, index) => ({
    time,
    ...DEFAULT_WEATHER,
    temperature: DEFAULT_WEATHER.temperature + (index % 2),
    feelsLikeTemperature: DEFAULT_WEATHER.feelsLikeTemperature + (index % 2),
  }));
}

function extractWeatherItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return (
    payload?.weatherTimeline ||
    payload?.items ||
    payload?.hourly ||
    payload?.forecasts ||
    []
  );
}

export async function fetchWeatherTimeline({ region, travelDate, startTime, endTime }) {
  try {
    const payload = await requestJson(
      createUrl('/api/weather', {
        region,
        date: travelDate,
        startTime,
        endTime,
      }),
    );
    const slots = buildHourlySlots(startTime, endTime);
    const normalizedItems = extractWeatherItems(payload).map((item, index) =>
      normalizeWeatherItem(item, index, slots),
    );

    return normalizedItems.length > 0
      ? normalizedItems
      : buildFallbackWeatherTimeline({ startTime, endTime });
  } catch {
    return buildFallbackWeatherTimeline({ startTime, endTime });
  }
}

function inferPlaceCategory(place, fallbackInterest) {
  const category = String(place?.category || place?.primaryType || '').toLowerCase();

  if (category.includes('restaurant') || category.includes('food') || category.includes('음식')) {
    return 'food';
  }

  if (category.includes('shopping') || category.includes('shop')) {
    return 'shopping';
  }

  if (category.includes('museum') || category.includes('culture') || category.includes('문화')) {
    return 'culture';
  }

  if (category.includes('park') || category.includes('nature') || category.includes('자연')) {
    return 'nature';
  }

  return fallbackInterest || 'nature';
}

function normalizePlace(place, index, fallbackInterest) {
  const category = inferPlaceCategory(place, fallbackInterest);

  return {
    placeId: String(place?.placeId || place?.id || `candidate-${index + 1}`),
    name: place?.name || place?.title || `추천 후보 장소 ${index + 1}`,
    category,
    interests:
      Array.isArray(place?.interests) && place.interests.length > 0 ? place.interests : [category],
    indoor: Boolean(
      place?.indoor || category === 'culture' || category === 'shopping' || category === 'food',
    ),
    averageStayMinutes: Number(place?.averageStayMinutes) || (category === 'food' ? 60 : 90),
    openTime: place?.openTime || '09:00',
    closeTime: place?.closeTime || '20:00',
  };
}

function buildFallbackCandidatePlaces(interests) {
  const primaryInterest = interests[0] || 'nature';

  return [
    {
      placeId: `${primaryInterest}-1`,
      name: 'Sangdang Sanseong',
      category: 'nature',
      interests: ['nature', 'history'],
      indoor: false,
      averageStayMinutes: 90,
      openTime: '09:00',
      closeTime: '20:00',
    },
    {
      placeId: `${primaryInterest}-2`,
      name: 'Cheongnamdae',
      category: 'culture',
      interests: ['culture', 'history'],
      indoor: true,
      averageStayMinutes: 100,
      openTime: '09:00',
      closeTime: '18:00',
    },
    {
      placeId: `${primaryInterest}-3`,
      name: 'Suamgol Cafe Street',
      category: 'food',
      interests: ['food', 'healing'],
      indoor: true,
      averageStayMinutes: 70,
      openTime: '10:00',
      closeTime: '21:00',
    },
  ];
}

function extractPlaceItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
}

export async function fetchCandidatePlaces({ region, interests }) {
  const primaryInterest = interests[0] || 'nature';
  const category = CATEGORY_BY_INTEREST[primaryInterest] || 'TOURIST_ATTRACTION';

  try {
    const payload = await requestJson(
      createUrl('/api/places', {
        keyword: [region, primaryInterest].filter(Boolean).join(' '),
        category,
        size: 12,
      }),
    );
    const normalizedPlaces = extractPlaceItems(payload).map((place, index) =>
      normalizePlace(place, index, primaryInterest),
    );

    return normalizedPlaces.length > 0 ? normalizedPlaces : buildFallbackCandidatePlaces(interests);
  } catch {
    return buildFallbackCandidatePlaces(interests);
  }
}

export async function requestRouteRecommendation(formValues) {
  const interests = Array.isArray(formValues.interests)
    ? formValues.interests
    : [formValues.interests].filter(Boolean);

  const [weatherTimeline, candidatePlaces] = await Promise.all([
    fetchWeatherTimeline(formValues),
    fetchCandidatePlaces({ region: formValues.region, interests }),
  ]);

  const requestBody = {
    region: formValues.region,
    interests,
    companionType: formValues.companionType,
    budget: formValues.budget,
    activityIntensity: formValues.activityIntensity,
    transportMode: formValues.transportMode,
    travelDate: formValues.travelDate,
    startTime: formValues.startTime,
    endTime: formValues.endTime,
    startLocation: formValues.startLocation,
    endLocation: formValues.endLocation,
    weatherTimeline,
    candidatePlaces,
  };

  const recommendation = await requestJson(createUrl('/api/v1/recommend/routes'), {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return {
    recommendation,
    requestBody,
  };
}
