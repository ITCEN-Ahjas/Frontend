const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function requestJson(url, errorMessage, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

function createFestivalQuery({
  page = 1,
  size = 10,
  eventStartDate,
  eventEndDate,
  region = '전체',
  category = '전체',
  keyword = '',
} = {}) {
  const params = new URLSearchParams();

  params.append('page', String(page));
  params.append('size', String(size));

  if (eventStartDate) {
    params.append('eventStartDate', String(eventStartDate));
  }

  if (eventEndDate) {
    params.append('eventEndDate', String(eventEndDate));
  }

  if (region !== '전체') {
    const trimmedRegion = String(region).trim();
    if (trimmedRegion) {
      params.append('region', trimmedRegion);
    }
  }

  if (category !== '전체') {
    const trimmedCategory = String(category).trim();
    if (trimmedCategory) {
      params.append('category', trimmedCategory);
    }
  }

  const trimmedKeyword = String(keyword ?? '').trim();
  if (trimmedKeyword) {
    params.append('keyword', trimmedKeyword);
  }

  return params.toString() ? `?${params.toString()}` : '';
}

function createExperienceQuery({
  page = 1,
  size = 10,
  region = '전체',
  contentTypeId = '전체',
} = {}) {
  const params = new URLSearchParams();

  params.append('page', String(page));
  params.append('size', String(size));

  if (region !== '전체') {
    const trimmedRegion = String(region).trim();
    if (trimmedRegion) {
      params.append('region', trimmedRegion);
    }
  }

  if (
    contentTypeId !== null &&
    contentTypeId !== undefined &&
    String(contentTypeId).trim() !== ''
  ) {
    params.append('contentTypeId', String(contentTypeId).trim());
  }

  return params.toString() ? `?${params.toString()}` : '';
}

export async function fetchFestivalList({
  page = 1,
  size = 10,
  eventStartDate,
  eventEndDate,
  region = '전체',
  category = '전체',
  keyword = '',
  signal,
} = {}) {
  const query = createFestivalQuery({
    page,
    size,
    eventStartDate,
    eventEndDate,
    region,
    category,
    keyword,
  });
  const url = `${API_BASE_URL}/api/festivals${query}`;
  return requestJson(url, '축제 목록 조회에 실패했습니다.', { signal });
}

export async function fetchFestivalDetail(contentId, { signal } = {}) {
  if (!contentId) {
    throw new Error('contentId가 필요합니다.');
  }

  const url = `${API_BASE_URL}/api/festivals/${encodeURIComponent(contentId)}`;
  return requestJson(url, '축제 상세 조회에 실패했습니다.', { signal });
}

export async function fetchExperienceList({
  page = 1,
  size = 10,
  region = '전체',
  contentTypeId = '전체',
  signal,
} = {}) {
  const query = createExperienceQuery({ page, size, region, contentTypeId });
  const url = `${API_BASE_URL}/api/festivals/experiences${query}`;
  return requestJson(url, '체험/관광 콘텐츠 조회에 실패했습니다.', { signal });
}
