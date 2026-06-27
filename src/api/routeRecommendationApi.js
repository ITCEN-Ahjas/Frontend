const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

const ACTIVITY_PACE_BY_INTENSITY = {
  low: 'relaxed',
  medium: 'balanced',
  high: 'tight',
};

const TRANSPORT_MODE_BY_FORM_VALUE = {
  walk: 'walk',
  publicTransit: 'publicTransit',
  car: 'car',
};

const AI_INTEREST_BY_FORM_VALUE = {
  nature: 'nature',
  history: 'exhibition',
  culture: 'exhibition',
  food: 'food',
  shopping: 'shopping',
  healing: 'activity',
};

const CANDIDATE_PLACE_BY_INTEREST = {
  nature: {
    placeId: 'nature-1',
    name: '상당산성',
    category: 'landmark',
    interests: ['nature'],
    indoor: false,
    address: '충북 청주시 상당구 성내로124번길 14',
    latitude: 36.6589,
    longitude: 127.5364,
    averageStayMinutes: 90,
  },
  history: {
    placeId: 'history-1',
    name: '청남대',
    category: 'landmark',
    interests: ['exhibition'],
    indoor: true,
    address: '충북 청주시 상당구 문의면 청남대길 646',
    latitude: 36.4621,
    longitude: 127.4908,
    averageStayMinutes: 100,
  },
  culture: {
    placeId: 'culture-1',
    name: '국립청주박물관',
    category: 'museum',
    interests: ['exhibition'],
    indoor: true,
    address: '충북 청주시 상당구 명암로 143',
    latitude: 36.6538,
    longitude: 127.5126,
    averageStayMinutes: 80,
  },
  food: {
    placeId: 'food-1',
    name: '수암골 카페거리',
    category: 'restaurant',
    interests: ['food', 'cafe'],
    indoor: true,
    address: '충북 청주시 상당구 수동',
    latitude: 36.6432,
    longitude: 127.4933,
    averageStayMinutes: 70,
  },
  shopping: {
    placeId: 'shopping-1',
    name: '성안길',
    category: 'shopping',
    interests: ['shopping', 'food'],
    indoor: false,
    address: '충북 청주시 상당구 성안로',
    latitude: 36.6356,
    longitude: 127.4895,
    averageStayMinutes: 90,
  },
  healing: {
    placeId: 'healing-1',
    name: '문암생태공원',
    category: 'experience',
    interests: ['activity', 'nature'],
    indoor: false,
    address: '충북 청주시 흥덕구 문암동 100',
    latitude: 36.6665,
    longitude: 127.4476,
    averageStayMinutes: 80,
  },
};

function createUrl(path) {
  return new URL(path, `${API_BASE_URL}/`).toString();
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
    throw new Error(payload?.message || 'AI course recommendation request failed.');
  }

  return payload;
}

function normalizeInterests(interests) {
  const values = Array.isArray(interests) ? interests : [interests].filter(Boolean);
  const mappedValues = values.map(interest => AI_INTEREST_BY_FORM_VALUE[interest] || interest);

  return mappedValues.length > 0 ? Array.from(new Set(mappedValues)) : ['nature'];
}

function toTimeWithSeconds(time) {
  const value = String(time || '09:00');

  return value.split(':').length === 2 ? `${value}:00` : value;
}

function createWeatherTimeline(formValues) {
  return [
    {
      time: toTimeWithSeconds(formValues.startTime),
      condition: 'clear',
      precipitationProbability: 10,
      temperature: 25,
      feelsLikeTemperature: 26,
      fineDustLevel: 'normal',
    },
  ];
}

function createCandidatePlaces(interests) {
  const formInterests = Array.isArray(interests) ? interests : [interests].filter(Boolean);
  const places = formInterests
    .map(interest => CANDIDATE_PLACE_BY_INTEREST[interest])
    .filter(Boolean);

  return places.length > 0 ? places : [CANDIDATE_PLACE_BY_INTEREST.nature];
}

export function createRouteRecommendationPayload(formValues) {
  const formInterests = Array.isArray(formValues.interests)
    ? formValues.interests
    : [formValues.interests].filter(Boolean);
  const interests = normalizeInterests(formInterests);

  return {
    region: formValues.region,
    interests,
    companionType: formValues.companionType,
    budget: formValues.budget,
    activityIntensity:
      ACTIVITY_PACE_BY_INTENSITY[formValues.activityIntensity] || formValues.activityIntensity,
    transportMode:
      TRANSPORT_MODE_BY_FORM_VALUE[formValues.transportMode] || formValues.transportMode,
    travelDate: formValues.travelDate,
    startTime: toTimeWithSeconds(formValues.startTime),
    endTime: toTimeWithSeconds(formValues.endTime),
    startLocation: formValues.startLocation,
    endLocation: formValues.endLocation,
    weatherTimeline: createWeatherTimeline(formValues),
    candidatePlaces: createCandidatePlaces(formInterests),
  };
}

export async function requestRouteRecommendation(formValues) {
  const payload = await requestJson(createUrl('/api/v1/recommend/routes'), {
    method: 'POST',
    body: JSON.stringify(createRouteRecommendationPayload(formValues)),
  });

  return payload?.data || payload;
}
