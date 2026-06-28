const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

export async function fetchMainSummary({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/main`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('메인페이지 정보를 불러오지 못했습니다.');
  }

  return response.json();
}
