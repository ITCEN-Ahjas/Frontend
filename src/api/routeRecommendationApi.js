const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

const ACTIVITY_PACE_BY_INTENSITY = {
  low: 'relaxed',
  medium: 'balanced',
  high: 'active',
};

const TRANSPORT_MODE_BY_FORM_VALUE = {
  walk: 'walking',
  publicTransit: 'public_transport',
  car: 'car',
};

const INTEREST_BY_FORM_VALUE = {
  nature: 'nature',
  history: 'history',
  culture: 'culture',
  food: 'restaurant',
  shopping: 'shopping',
  healing: 'healing',
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
  const mappedValues = values.map(interest => INTEREST_BY_FORM_VALUE[interest] || interest);

  return mappedValues.length > 0 ? Array.from(new Set(mappedValues)) : ['nature'];
}

export function createRouteRecommendationPayload(formValues) {
  return {
    region: formValues.region,
    preference: {
      interests: normalizeInterests(formValues.interests),
      companionType: formValues.companionType,
      budgetLevel: formValues.budget,
      activityPace:
        ACTIVITY_PACE_BY_INTENSITY[formValues.activityIntensity] || formValues.activityIntensity,
      transportMode:
        TRANSPORT_MODE_BY_FORM_VALUE[formValues.transportMode] || formValues.transportMode,
    },
    constraint: {
      travelDate: formValues.travelDate,
      startTime: formValues.startTime,
      endTime: formValues.endTime,
      startLocation: formValues.startLocation,
      endLocation: formValues.endLocation,
    },
  };
}

export async function requestRouteRecommendation(formValues) {
  const payload = await requestJson(createUrl('/api/v1/recommend/routes'), {
    method: 'POST',
    body: JSON.stringify(createRouteRecommendationPayload(formValues)),
  });

  return payload?.data || payload;
}
