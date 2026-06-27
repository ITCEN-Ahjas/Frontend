import { API_BASE_URL } from '../../api/routeRecommendationApi';

export function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

export function stringify(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(stringify).filter(Boolean).join(', ');
  }

  if (typeof value === 'object') {
    return value.reason || value.description || value.name || value.title || JSON.stringify(value);
  }

  return String(value);
}

function toFiniteNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function resolveImageUrl(value) {
  const imageUrl = stringify(value);

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('/api')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
}

function formatStayMinutes(value) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '';
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0 && restMinutes > 0) {
    return `${hours}시간 ${restMinutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  return `${restMinutes}분`;
}

function normalizeItineraryItem(item, index) {
  const place = item?.placeName || item?.name || item?.title || item?.place;

  return {
    placeId: stringify(item?.placeId || item?.id) || `course-place-${index + 1}`,
    order: Number(item?.order) || index + 1,
    day: Number(item?.day) || 1,
    time: stringify(item?.time || item?.startTime || item?.arrivalTime || `${String(9 + index).padStart(2, '0')}:00`),
    startTime: stringify(item?.startTime),
    endTime: stringify(item?.endTime),
    title: stringify(place) || `추천 장소 ${index + 1}`,
    category: stringify(item?.category) || '추천 장소',
    address: stringify(item?.address),
    imageUrl: resolveImageUrl(item?.imageUrl || item?.photoUrl),
    description: stringify(item?.description || item?.recommendationReason || item?.activity || item?.reason),
    recommendationReason: stringify(item?.recommendationReason),
    weatherReason: stringify(item?.weatherReason || item?.weatherReflectionReason || item?.weatherNote),
    moveTip: stringify(item?.moveTip || item?.transportTip || item?.travelTip),
    latitude: toFiniteNumber(item?.latitude),
    longitude: toFiniteNumber(item?.longitude),
  };
}

export function normalizePlanBOption(option, index) {
  if (typeof option === 'string') {
    return {
      id: `plan-b-${index + 1}`,
      triggerCondition: '대체 코스',
      replaceFrom: '',
      replaceTo: '',
      reason: option,
    };
  }

  return {
    id: `plan-b-${index + 1}`,
    triggerCondition: stringify(option?.triggerCondition) || '대체 코스',
    replaceFrom: stringify(option?.replaceFrom),
    replaceTo: stringify(option?.replaceTo),
    reason: stringify(option?.reason || option?.description || option?.summary),
  };
}

export function normalizeRecommendation(response) {
  const routeOverview = response?.routeOverview || {};
  const itinerary = asArray(response?.itinerary || response?.days?.flatMap(day => day?.places || []))
    .map(normalizeItineraryItem)
    .sort((first, second) => (
      first.day - second.day ||
      first.order - second.order ||
      first.time.localeCompare(second.time)
    ));
  const planBOptions = asArray(response?.planBOptions || response?.planB || response?.alternatives)
    .map(normalizePlanBOption);
  const weatherNoteDetails = asArray(response?.weatherNoteDetails || response?.weatherNotes);

  return {
    source: stringify(response?.source),
    summary: stringify(response?.summary) || '추천 요약이 아직 제공되지 않았습니다.',
    overviewTitle: stringify(routeOverview?.title),
    totalDistance:
      stringify(response?.totalDistance || routeOverview?.totalDistance || response?.distance) ||
      '지도 동선 기준 확인',
    totalDuration:
      stringify(response?.totalDuration || routeOverview?.totalDuration || response?.duration) ||
      formatStayMinutes(routeOverview?.totalStayMinutes) ||
      '계산 예정',
    totalPlaces: Number(routeOverview?.totalPlaces) || itinerary.length,
    weatherSummary: stringify(routeOverview?.weatherSummary),
    styleTags: asArray(routeOverview?.styleTags).map(stringify).filter(Boolean),
    itinerary,
    planB: asArray(response?.planB || response?.alternatives),
    planBOptions,
    weatherNotes: weatherNoteDetails,
  };
}

export function getMappablePlaces(items) {
  return items.filter(item => item.latitude !== null && item.longitude !== null);
}

export function groupItineraryByDay(items) {
  return items.reduce((groups, item) => {
    const dayKey = `Day ${item.day}`;

    return {
      ...groups,
      [dayKey]: [...(groups[dayKey] || []), item],
    };
  }, {});
}
