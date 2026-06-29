import { useEffect, useMemo, useReducer, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiExternalLink, FiStar } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPlacePhotoUrl, fetchPlaceDetail } from '../../api/placeApi';
import { pageFade } from '../../shared/animation/pageMotion';
import styles from './PlaceDetailPage.module.css';

const DEFAULT_IMAGE_TEXT = 'CHUNGBUK PLACE';
const REVIEW_PREVIEW_COUNT = 3;
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

function formatReviewPublishTime(review) {
  const relativeTime = pickText(review?.relativePublishTimeDescription);

  if (relativeTime) {
    return relativeTime;
  }

  const publishTime = pickText(review?.publishTime);

  if (!publishTime) {
    return '';
  }

  const date = new Date(publishTime);

  if (Number.isNaN(date.getTime())) {
    return publishTime;
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

function normalizeReview(rawReview, index) {
  const review = rawReview ?? {};
  const text = pickText(review.text, review.originalText);
  const originalText = pickText(review.originalText);

  return {
    reviewId: pickText(review.reviewId, `review-${index}`),
    authorName: pickText(review.authorName, 'Google 사용자'),
    authorUri: normalizeUrl(review.authorUri),
    authorPhotoUri: normalizeUrl(review.authorPhotoUri),
    rating: toFiniteNumber(review.rating),
    text,
    originalText,
    languageCode: pickText(review.languageCode),
    publishLabel: formatReviewPublishTime(review),
  };
}

function normalizeReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews
    .map(normalizeReview)
    .filter(review => review.text || Number.isFinite(review.rating) || review.authorName);
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
    reviews: normalizeReviews(detail.reviews),
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

function handlePhotoError(event) {
  event.currentTarget.hidden = true;
  event.currentTarget.nextElementSibling?.removeAttribute('hidden');
}

export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEW_PREVIEW_COUNT);
  const [state, dispatch] = useReducer(detailReducer, {
    detail: null,
    loading: true,
    errorMessage: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setVisibleReviewCount(REVIEW_PREVIEW_COUNT);
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
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [placeId]);

  const detail = state.detail;
  const infoItems = useMemo(() => buildInfoItems(detail), [detail]);
  const directionsUrl = useMemo(() => buildDirectionsUrl(detail), [detail]);
  const photoUrl = useMemo(() => createPlacePhotoUrl(detail?.photoName, 900), [detail]);
  const ratingCount = formatRatingCount(detail?.userRatingCount);
  const visibleReviews = detail?.reviews.slice(0, visibleReviewCount) ?? [];
  const canToggleReviews = Boolean(detail && detail.reviews.length > REVIEW_PREVIEW_COUNT);
  const isReviewExpanded = Boolean(detail && visibleReviewCount >= detail.reviews.length);

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
    <motion.div
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={pageFade}
    >
      <div className={styles.breadcrumb}>
        <Link to="/">홈</Link>
        <FiChevronRight aria-hidden="true" />
        <Link to="/map">지도</Link>
        <FiChevronRight aria-hidden="true" />
        <span>상세</span>
      </div>

      <section className={styles.heroSection}>
        <div className={styles.heroImageBox}>
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={detail.name}
                className={styles.heroImage}
                onError={handlePhotoError}
              />
              <div className={styles.heroFallback} hidden>
                {DEFAULT_IMAGE_TEXT}
              </div>
            </>
          ) : (
            <div className={styles.heroFallback}>{DEFAULT_IMAGE_TEXT}</div>
          )}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>{detail.primaryTypeName}</span>
            {detail.types.map(type => (
              <span key={type} className={styles.typeBadge}>
                {type}
              </span>
            ))}
            {Number.isFinite(detail.rating) && (
              <span className={styles.ratingBadge}>
                <FiStar aria-hidden="true" />
                {detail.rating.toFixed(1)}
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
              <FiExternalLink aria-hidden="true" />
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

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <h2>리뷰</h2>
          <span>{detail.reviews.length}개</span>
        </div>

        {detail.reviews.length > 0 ? (
          <>
            <ul className={styles.reviewList}>
              {visibleReviews.map(review => (
                <li key={review.reviewId} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAuthor}>
                      {review.authorPhotoUri ? (
                        <img src={review.authorPhotoUri} alt="" loading="lazy" />
                      ) : (
                        <span aria-hidden="true">{review.authorName.charAt(0)}</span>
                      )}

                      <div>
                        {review.authorUri ? (
                          <a href={review.authorUri} target="_blank" rel="noopener noreferrer">
                            {review.authorName}
                          </a>
                        ) : (
                          <strong>{review.authorName}</strong>
                        )}
                        {review.publishLabel && <p>{review.publishLabel}</p>}
                      </div>
                    </div>

                    {Number.isFinite(review.rating) && (
                      <span className={styles.reviewRating}>
                        <FiStar aria-hidden="true" />
                        {review.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {review.text && <p className={styles.reviewText}>{review.text}</p>}
                  {review.originalText && review.originalText !== review.text && (
                    <p className={styles.reviewOriginalText}>원문: {review.originalText}</p>
                  )}
                </li>
              ))}
            </ul>

            {canToggleReviews && (
              <button
                type="button"
                className={styles.reviewMoreButton}
                onClick={() =>
                  setVisibleReviewCount(isReviewExpanded ? REVIEW_PREVIEW_COUNT : detail.reviews.length)
                }
              >
                {isReviewExpanded ? '리뷰 접기' : '리뷰 더보기'}
              </button>
            )}
          </>
        ) : (
          <p className={styles.emptyInfoText}>아직 제공된 리뷰가 없습니다.</p>
        )}
      </section>

      <div className={styles.bottomActions}>
        <button type="button" onClick={() => navigate('/map')} className={styles.backButton}>
          <FiArrowLeft aria-hidden="true" />
          지도 검색으로 돌아가기
        </button>

        {detail.websiteUri && (
          <a
            href={detail.websiteUri}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            웹사이트 바로가기
            <FiExternalLink aria-hidden="true" />
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
            <FiExternalLink aria-hidden="true" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
