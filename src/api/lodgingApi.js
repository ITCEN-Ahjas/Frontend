const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function requestJson(url, errorMessage, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

function createAccommodationQuery({
  page = 1,
  size = 10,
  sigunguNm = '전체',
  keyword = '',
} = {}) {
  const params = new URLSearchParams();

  params.append('page', String(page));
  params.append('size', String(size));

  if (sigunguNm !== '전체') {
    const trimmed = String(sigunguNm).trim();
    if (trimmed) {
      params.append('sigunguNm', trimmed);
    }
  }

  const trimmedKeyword = String(keyword ?? '').trim();
  if (trimmedKeyword) {
    params.append('keyword', trimmedKeyword);
  }

  return params.toString() ? `?${params.toString()}` : '';
}

export async function fetchAccommodationList({
  page = 1,
  size = 10,
  sigunguNm = '전체',
  keyword = '',
  signal,
} = {}) {
  const query = createAccommodationQuery({ page, size, sigunguNm, keyword });
  const url = `${API_BASE_URL}/api/accommodations${query}`;
  return requestJson(url, '숙박 목록 조회에 실패했습니다.', { signal });
}

export async function fetchAccommodationDetail(contentId, { signal } = {}) {
  if (!contentId) {
    throw new Error('contentId가 필요합니다.');
  }

  const url = `${API_BASE_URL}/api/accommodations/${encodeURIComponent(contentId)}`;
  return requestJson(url, '숙박 상세 조회에 실패했습니다.', { signal });
}
