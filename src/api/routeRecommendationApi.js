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
  };
}

export async function requestRouteRecommendation(formValues) {
  const payload = await requestJson(createUrl('/api/v1/recommend/routes'), {
    method: 'POST',
    body: JSON.stringify(createRouteRecommendationPayload(formValues)),
  });

  return payload?.data || payload;
}
