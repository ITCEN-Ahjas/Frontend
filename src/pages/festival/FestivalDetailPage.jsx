import { useEffect, useMemo, useReducer } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchFestivalDetail } from '../../api/festivalApi';
import styles from './FestivalDetailPage.module.css';
import { formatPeriod } from './utils/festivalFormat';

const DEFAULT_IMAGE_TEXT = 'CHUNGBUK FESTIVAL';

function isEmptyText(value) {
  const text = String(value ?? '').trim();

  return (
    !text ||
    text === '-' ||
    text === '0' ||
    text === '없음' ||
    text === '없습니다' ||
    text === '정보 없음' ||
    text === '정보 준비 중' ||
    text === '상세 정보를 확인해 주세요'
  );
}

function cleanText(value) {
  return String(value ?? '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickText(...values) {
  const value = values.find(item => !isEmptyText(cleanText(item)));
  return cleanText(value);
}

function getField(item, ...fieldNames) {
  for (const fieldName of fieldNames) {
    const value = item?.[fieldName];

    if (!isEmptyText(cleanText(value))) {
      return cleanText(value);
    }
  }

  return '';
}

function stripInfoLabel(value) {
  const text = cleanText(value);
  const separatorIndex = text.indexOf(':');

  if (separatorIndex < 1) {
    return text;
  }

  return text.slice(separatorIndex + 1).trim();
}

function normalizeMapCoord(value) {
  const text = String(value ?? '').trim();
  return text || '';
}

function formatDetailPeriod(startDate, endDate) {
  if (!startDate && !endDate) return '';
  if (startDate && endDate) return formatPeriod(startDate, endDate);
  return startDate || endDate;
}

function getFestivalDetail(rawDetail, fallbackItem) {
  const detail = rawDetail ?? {};
  const fallback = fallbackItem ?? {};
  const startDate = getField(detail, 'startDate', 'eventStartDate', 'eventstartdate') || fallback.startDate;
  const endDate = getField(detail, 'endDate', 'eventEndDate', 'eventenddate') || fallback.endDate;
  const displayInfo = pickText(
    fallback.description,
    getField(detail, 'playTime', 'playtime'),
    getField(detail, 'useTimeFestival', 'usetimefestival'),
  );
  const subInfo = pickText(
    fallback.subInfo,
    getField(detail, 'eventPlace', 'eventplace'),
    getField(detail, 'address', 'addr1'),
  );
  const imageUrl = pickText(
    getField(detail, 'imageUrl', 'firstImage', 'firstimage', 'firstimage2'),
    Array.isArray(detail.imageUrls) ? detail.imageUrls[0] : '',
    fallback.imageUrl,
  );
  const address = pickText(getField(detail, 'address', 'addr1'), fallback.rawAddress);
  const place = pickText(getField(detail, 'eventPlace', 'eventplace'), stripInfoLabel(subInfo), fallback.region);
  const title = pickText(detail.title, fallback.title, '축제 상세');
  const region = pickText(detail.region, fallback.region, '충북');
  const category = pickText(detail.category, fallback.category, '행사/공연/축제');
  const contentTypeId = pickText(
    getField(detail, 'contentTypeId', 'contenttypeid'),
    fallback.contentTypeId,
    category.includes('관광지') ? '12' : '',
    category.includes('문화시설') ? '14' : '',
    category.includes('레포츠') ? '28' : '',
    category.includes('여행코스') ? '25' : '',
    '15',
  );
  const introText = pickText(
    getField(detail, 'overview'),
    getField(detail, 'description'),
    getField(detail, 'eventIntro', 'eventintro'),
    getField(detail, 'eventText', 'eventtext'),
    '제공된 소개 정보가 없습니다.',
  );

  return {
    id: pickText(detail.id, fallback.contentId, fallback.id),
    title,
    region,
    category,
    contentTypeId,
    overview: introText,
    period: formatDetailPeriod(startDate, endDate),
    startDate,
    endDate,
    time: stripInfoLabel(pickText(getField(detail, 'playTime', 'playtime'), displayInfo)),
    price: stripInfoLabel(pickText(getField(detail, 'useTimeFestival', 'usetimefestival'))),
    place,
    address,
    tel: pickText(getField(detail, 'tel'), fallback.tel),
    homepage: pickText(getField(detail, 'homepage')),
    imageUrl,
    mapX: normalizeMapCoord(detail.mapX ?? detail.mapx ?? fallback.mapX),
    mapY: normalizeMapCoord(detail.mapY ?? detail.mapy ?? fallback.mapY),
    raw: { ...fallback, ...detail },
  };
}

function buildGoogleMapsDirectionsUrl(item) {
  const mapX = item.mapX ?? item.mapx ?? '';
  const mapY = item.mapY ?? item.mapy ?? '';
  const address = item.address ?? item.addr1 ?? '';

  if (mapX && mapY) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${mapY},${mapX}`,
    )}`;
  }

  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }

  return '';
}

function makeInfoItem(icon, label, value) {
  const cleanedValue = cleanText(value);
  if (isEmptyText(cleanedValue)) return null;

  return { icon, label, value: cleanedValue };
}

function buildKeyInfo(detail) {
  const item = detail.raw ?? {};
  const contentTypeId = String(detail.contentTypeId);
  const itemsByType = {
    15: [
      makeInfoItem('▣', '기간', detail.period),
      makeInfoItem('◷', '운영시간', getField(item, 'playTime', 'playtime') || detail.time),
      makeInfoItem('◎', '이용요금', getField(item, 'useTimeFestival', 'usetimefestival')),
      makeInfoItem('⌖', '행사장소', getField(item, 'eventPlace', 'eventplace') || detail.place),
      makeInfoItem('◇', '주최/주관', getField(item, 'sponsor')),
      makeInfoItem('◌', '소요시간', getField(item, 'spendTimeFestival', 'spendtimefestival')),
    ],
    12: [
      makeInfoItem('◷', '이용시간', getField(item, 'useTime', 'usetime')),
      makeInfoItem('▣', '휴무일', getField(item, 'restDate', 'restdate')),
      makeInfoItem('◇', '체험안내', getField(item, 'expGuide', 'expguide')),
      makeInfoItem('▤', '주차', getField(item, 'parking')),
      makeInfoItem('☎', '문의', getField(item, 'infoCenter', 'infocenter')),
      makeInfoItem('⌘', '반려동물', getField(item, 'chkPet', 'chkpet')),
    ],
    14: [
      makeInfoItem('◷', '관람시간', getField(item, 'useTimeCulture', 'usetimeculture')),
      makeInfoItem('▣', '휴무일', getField(item, 'restDateCulture', 'restdateculture')),
      makeInfoItem('◎', '이용요금', getField(item, 'useFee', 'usefee')),
      makeInfoItem('◌', '관람소요시간', getField(item, 'spendTime', 'spendtime')),
      makeInfoItem('▤', '주차', getField(item, 'parkingCulture', 'parkingculture')),
      makeInfoItem('☎', '문의', getField(item, 'infoCenterCulture', 'infocenterculture')),
    ],
    28: [
      makeInfoItem('▣', '운영기간', getField(item, 'openPeriod', 'openperiod')),
      makeInfoItem('◷', '이용시간', getField(item, 'useTimeLeports', 'usetimeleports')),
      makeInfoItem('◎', '이용요금', getField(item, 'useFeeLeports', 'usefeeleports')),
      makeInfoItem('◇', '예약', getField(item, 'reservation')),
      makeInfoItem('▤', '주차', getField(item, 'parkingLeports', 'parkingleports')),
      makeInfoItem('☎', '문의', getField(item, 'infoCenterLeports', 'infocenterleports')),
      makeInfoItem('⌘', '체험연령', getField(item, 'expAgeRangeLeports', 'expagerangeleports')),
    ],
    25: [
      makeInfoItem('◇', '코스 총거리', getField(item, 'distance')),
      makeInfoItem('◌', '소요시간', getField(item, 'takeTime', 'taketime')),
      makeInfoItem('▣', '일정', getField(item, 'schedule')),
      makeInfoItem('☎', '문의', getField(item, 'infoCenterTourCourse', 'infocentertourcourse')),
      makeInfoItem('◎', '테마', getField(item, 'theme')),
    ],
  };

  return (itemsByType[contentTypeId] ?? itemsByType[15]).filter(Boolean);
}

function detailReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, loading: true, errorMessage: '' };
    case 'success':
      return { detail: action.payload, loading: false, errorMessage: '' };
    case 'error':
      return { ...state, loading: false, errorMessage: action.payload };
    default:
      return state;
  }
}

export default function FestivalDetailPage() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackItem = location.state?.festival;
  const [state, dispatch] = useReducer(detailReducer, {
    detail: getFestivalDetail(null, fallbackItem),
    loading: true,
    errorMessage: '',
  });

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: 'start' });
    fetchFestivalDetail(contentId, { signal: controller.signal })
      .then(detail => {
        if (controller.signal.aborted) return;
        dispatch({
          type: 'success',
          payload: getFestivalDetail(detail, fallbackItem),
        });
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        if (fallbackItem) {
          dispatch({
            type: 'success',
            payload: getFestivalDetail(null, fallbackItem),
          });
          return;
        }

        dispatch({
          type: 'error',
          payload: error.message || '축제 상세 조회에 실패했습니다.',
        });
      });

    return () => {
      controller.abort();
    };
  }, [contentId, fallbackItem]);

  const detail = state.detail;
  const mapUrl = useMemo(() => buildGoogleMapsDirectionsUrl(detail), [detail]);
  const keyInfo = useMemo(() => buildKeyInfo(detail), [detail]);

  if (state.loading && !fallbackItem) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>축제 상세 정보를 불러오는 중입니다.</div>
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

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/">홈</Link>
        <span>›</span>
        <Link to="/festival">체험·축제</Link>
        <span>›</span>
        <span>상세</span>
      </div>

      <section className={styles.heroSection}>
        <div className={styles.heroImageBox}>
          {detail.imageUrl ? (
            <img src={detail.imageUrl} alt="" className={styles.heroImage} />
          ) : (
            <div className={styles.heroFallback}>{DEFAULT_IMAGE_TEXT}</div>
          )}
        </div>

        <div className={styles.heroContent}>
          {detail.category && <span className={styles.categoryBadge}>{detail.category}</span>}

          <h1>{detail.title}</h1>
          <p className={styles.regionText}>{detail.region} 축제·체험 정보</p>
          <p className={styles.heroDescription}>{detail.overview}</p>

          <ul className={styles.summaryList}>
            {detail.period && (
              <li>
                <span aria-hidden="true">▣</span>
                {detail.period}
              </li>
            )}
            {detail.time && (
              <li>
                <span aria-hidden="true">◷</span>
                {detail.time}
              </li>
            )}
            {detail.place && (
              <li>
                <span aria-hidden="true">⌖</span>
                {detail.place}
              </li>
            )}
            {detail.category && (
              <li>
                <span aria-hidden="true">◇</span>
                {detail.category}
              </li>
            )}
          </ul>
        </div>
      </section>

      <nav className={styles.tabNav} aria-label="상세 정보">
        <a href="#intro">소개</a>
        <a href="#location">위치 안내</a>
      </nav>

      <section id="intro" className={styles.section}>
        <div className={styles.introGrid}>
          <div>
            <h2>소개</h2>
            <p>{detail.overview}</p>
          </div>

          <aside className={styles.noticeBox}>
            <strong>외국인 안내</strong>
            <p>외국인 안내 정보는 현장에서 확인이 필요합니다.</p>
          </aside>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 정보</h2>

        {keyInfo.length > 0 ? (
          <div className={styles.infoGrid}>
            {keyInfo.map(item => (
              <div key={item.label} className={styles.infoItem}>
                <span aria-hidden="true" className={styles.infoIcon}>
                  {item.icon}
                </span>
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyInfoText}>제공된 상세 정보가 없습니다.</p>
        )}
      </section>

      <section id="location" className={styles.section}>
        <h2>위치 안내</h2>

        <div className={styles.locationBox}>
          <div className={styles.mapPreview}>
            <span className={styles.mapPin} aria-hidden="true">
              ◆
            </span>
          </div>

          <div className={styles.locationContent}>
            <strong>정확한 위치 안내는 구글맵 연동 예정입니다.</strong>
            <p>지도 연결 정보가 준비되어 있습니다.</p>
            {detail.address && <p className={styles.addressText}>{detail.address}</p>}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.outlineButton}
              >
                구글맵 길찾기
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {detail.homepage && (
        <section className={styles.section}>
          <h2>공식 링크</h2>

          <a href={detail.homepage} target="_blank" rel="noreferrer" className={styles.linkBox}>
            <span aria-hidden="true">◎</span>
            <strong>공식 홈페이지</strong>
            <span>{detail.homepage}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      )}

      <div className={styles.bottomActions}>
        <button type="button" onClick={() => navigate('/festival')} className={styles.backButton}>
          ‹ 목록으로 돌아가기
        </button>

        {detail.homepage && (
          <a href={detail.homepage} target="_blank" rel="noreferrer" className={styles.primaryButton}>
            공식 홈페이지 바로가기
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
