import { useEffect, useMemo, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPlaceDetail } from '../../api/placeApi';
import styles from './PlaceDetailPage.module.css';

const DEFAULT_IMAGE_TEXT = 'CHUNGBUK PLACE';
const PLACE_TYPE_LABELS = {
  tourist_attraction: '관광 명소',
  point_of_interest: '관심 장소',
  establishment: '시설',
  restaurant: '음식점',
  food: '음식',
  cafe: '카페',
  lodging: '숙박',
  shopping_mall: '쇼핑몰',
  store: '상점',
  museum: '박물관',
  park: '공원',
  parking: '주차장',
};

function isEmptyText(value) {
  const text = String(value ?? '').trim();

  return !text || text === '-' || text === '없음' || text === '정보 없음';
}

function pickText(...values) {
  const value = values.find(item => !isEmptyText(item));
  return String(value ?? '').trim();
}

function formatRatingCount(count) {
  if (!Number.isFinite(count)) {
    return '';
  }

  return count.toLocaleString('ko-KR');
}

function normalizeUrl(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

function toFiniteNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function getPlaceTypeLabel(type, fallback = '장소') {
  const normalizedType = String(type ?? '').trim();

  if (!normalizedType) {
    return fallback;
  }

  return PLACE_TYPE_LABELS[normalizedType] || fallback || normalizedType.replaceAll('_', ' ');
}

function getPlaceTypeLabels(types) {
  return Array.from(
    new Set(
      types
        .map(type => getPlaceTypeLabel(type, ''))
        .filter(type => !isEmptyText(type)),
    ),
  );
}

function buildDirectionsUrl(detail) {
  const params = new URLSearchParams({ api: '1' });
  const destination = [detail?.name, detail?.address].filter(Boolean).join(' ');

  params.set('destination', destination || detail?.address || detail?.name || '');

  if (detail?.placeId) {
    params.set('destination_place_id', detail.placeId);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function normalizeDetail(rawDetail) {
  const detail = rawDetail ?? {};
  const photoNames = Array.isArray(detail.photoNames)
    ? detail.photoNames.filter(name => !isEmptyText(name))
    : [];
  const types = Array.isArray(detail.types) ? detail.types.filter(Boolean) : [];
  const typeLabels = getPlaceTypeLabels(types);
  const weekdayDescriptions = Array.isArray(detail.weekdayDescriptions)
    ? detail.weekdayDescriptions.filter(description => !isEmptyText(description))
    : [];
  const primaryTypeName = getPlaceTypeLabel(
    detail.primaryType,
    pickText(detail.primaryTypeName, detail.primaryType, '장소'),
  );

  return {
    placeId: pickText(detail.placeId),
    name: pickText(detail.name, '장소 상세 정보'),
    address: pickText(detail.address),
    latitude: detail.latitude,
    longitude: detail.longitude,
    primaryType: pickText(detail.primaryType),
    primaryTypeName,
    types: typeLabels,
    rating: toFiniteNumber(detail.rating),
    userRatingCount: toFiniteNumber(detail.userRatingCount),
    photoName: pickText(detail.photoName, photoNames[0]),
    photoNames,
    googleMapsUri: normalizeUrl(detail.googleMapsUri),
    nationalPhoneNumber: pickText(detail.nationalPhoneNumber),
    internationalPhoneNumber: pickText(detail.internationalPhoneNumber),
    websiteUri: normalizeUrl(detail.websiteUri),
    weekdayDescriptions,
    summary: pickText(detail.summary),
  };
}

function makeInfoItem(label, value) {
  if (isEmptyText(value)) return null;
  return { label, value };
}

function buildInfoItems(detail) {
  if (!detail) return [];

  return [
    makeInfoItem('분류', detail.primaryTypeName),
    makeInfoItem('국내 전화번호', detail.nationalPhoneNumber),
    makeInfoItem('국제 전화번호', detail.internationalPhoneNumber),
  ].filter(Boolean);
}

function detailReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { detail: null, loading: true, errorMessage: '' };
    case 'success':
      return { detail: action.payload, loading: false, errorMessage: '' };
    case 'error':
      return { detail: null, loading: false, errorMessage: action.payload };
    default:
      return state;
  }
}

export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(detailReducer, {
    detail: null,
    loading: true,
    errorMessage: '',
  });

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: 'start' });

    fetchPlaceDetail(placeId, { signal: controller.signal })
      .then(detail => {
        if (controller.signal.aborted) return;

        dispatch({ type: 'success', payload: normalizeDetail(detail) });
      })
      .catch(error => {
        if (error.name === 'AbortError') return;

        dispatch({
          type: 'error',
          payload: error.message || '장소 상세 정보를 불러오지 못했습니다.',
        });
      });

    return () => {
      controller.abort();
    };
  }, [placeId]);

  const detail = state.detail;
  const infoItems = useMemo(() => buildInfoItems(detail), [detail]);
  const directionsUrl = useMemo(() => buildDirectionsUrl(detail), [detail]);
  const ratingCount = formatRatingCount(detail?.userRatingCount);

  if (state.loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>장소 상세 정보를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (state.errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>{state.errorMessage}</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>장소 상세 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/">홈</Link>
        <span>›</span>
        <Link to="/map">지도</Link>
        <span>›</span>
        <span>상세</span>
      </div>

      <section className={styles.heroSection}>
        <div className={styles.heroImageBox}>
          <div className={styles.heroFallback}>{DEFAULT_IMAGE_TEXT}</div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>{detail.primaryTypeName}</span>
            {Number.isFinite(detail.rating) && (
              <span className={styles.ratingBadge}>
                ★ {detail.rating.toFixed(1)}
                {ratingCount && <small>({ratingCount})</small>}
              </span>
            )}
          </div>

          <div className={styles.titleRow}>
            <h1>{detail.name}</h1>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleDirectionsButton}
            >
              길찾기
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className={styles.heroIntroText}>
            {detail.summary || '이 장소에 대한 소개 정보가 아직 제공되지 않았습니다.'}
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 정보</h2>

        {infoItems.length > 0 ? (
          <div className={styles.infoGrid}>
            {infoItems.map(item => (
              <div key={`${item.label}-${item.value}`} className={styles.infoItem}>
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyInfoText}>제공된 주요 정보가 없습니다.</p>
        )}
      </section>

      {detail.types.length > 0 && (
        <section className={styles.section}>
          <h2>장소 유형</h2>
          <div className={styles.typeList}>
            {detail.types.map(type => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </section>
      )}

      <div className={styles.bottomActions}>
        <button type="button" onClick={() => navigate('/map')} className={styles.backButton}>
          ‹ 지도 검색으로 돌아가기
        </button>

        {detail.websiteUri && (
          <a
            href={detail.websiteUri}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            웹사이트 바로가기
            <span aria-hidden="true">↗</span>
          </a>
        )}

        {detail.googleMapsUri && (
          <a
            href={detail.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryButton}
          >
            Google Maps에서 보기
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
