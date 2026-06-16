import { useEffect, useMemo, useReducer } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchFestivalDetail } from '../../api/festivalApi';
import styles from './FestivalDetailPage.module.css';
import { formatPeriod } from './utils/festivalFormat';

const DEFAULT_IMAGE_TEXT = 'CHUNGBUK FESTIVAL';
const BANNED_SUMMARY_LABELS = [
  '축제 테마',
  '관광 유형',
  '시설 유형',
  '활동 유형',
  '행사 유형',
  '공연 유형',
];

function cleanText(value) {
  return String(value ?? '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isEmptyText(value) {
  const text = cleanText(value);

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

function isPlaceholderText(value) {
  const text = cleanText(value);

  return isEmptyText(text) || text === '상세페이지에서 확인';
}

function pickText(...values) {
  const value = values.find(item => !isEmptyText(item));
  return cleanText(value);
}

function getField(item, ...fieldNames) {
  for (const fieldName of fieldNames) {
    const value = item?.[fieldName];

    if (!isEmptyText(value)) {
      return cleanText(value);
    }
  }

  return '';
}

function normalizeMapCoord(value) {
  return String(value ?? '').trim();
}

function normalizeImageUrls(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(imageUrl => cleanText(imageUrl)).filter(imageUrl => !isEmptyText(imageUrl));
}

function normalizeMainInfo(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => ({
      label: cleanText(item?.label),
      value: cleanText(item?.value),
    }))
    .filter(item => !isEmptyText(item.label) && !isPlaceholderText(item.value));
}

function normalizeHomepageUrl(homepage) {
  if (!homepage || typeof homepage !== 'string') {
    return '';
  }

  const trimmed = homepage.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('www.')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function extractHomepageUrl(value) {
  const rawText = String(value ?? '').trim();

  if (!rawText) {
    return '';
  }

  const hrefMatch = rawText.match(/href\s*=\s*["']([^"']+)["']/i);
  const urlMatch = rawText.match(/https?:\/\/[^\s"'<>]+/i);
  const wwwMatch = rawText.match(/www\.[^\s"'<>]+/i);

  const resolvedUrl = hrefMatch?.[1] ?? urlMatch?.[0] ?? wwwMatch?.[0] ?? cleanText(rawText);

  return normalizeHomepageUrl(resolvedUrl);
}

function findMainInfoValue(mainInfo, labelKeywords) {
  return (
    mainInfo.find(
      item =>
        labelKeywords.some(keyword => item.label.includes(keyword)) &&
        !isPlaceholderText(item.value),
    )?.value ?? ''
  );
}

function isBannedSummaryLabel(label) {
  return BANNED_SUMMARY_LABELS.some(bannedLabel => cleanText(label) === bannedLabel);
}

function inferContentTypeId(category, fallbackContentTypeId) {
  const fallback = cleanText(fallbackContentTypeId);

  if (fallback) {
    return fallback;
  }

  if (category.includes('관광지')) {
    return '12';
  }

  if (category.includes('문화시설')) {
    return '14';
  }

  if (category.includes('레포츠') || category.includes('액티비티')) {
    return '28';
  }

  return '15';
}

function formatDetailPeriod(startDate, endDate) {
  if (!startDate && !endDate) {
    return '';
  }

  if (startDate && endDate) {
    return formatPeriod(startDate, endDate);
  }

  return startDate || endDate;
}

function buildFallbackDescription(detail) {
  const title = pickText(detail?.title, '해당 콘텐츠');
  const region = pickText(detail?.region, '충북');
  const category = pickText(detail?.category, '관광 콘텐츠');
  const themeCategory = pickText(detail?.themeCategory, category);

  return `${title}은(는) ${region}에서 만날 수 있는 ${themeCategory} 성격의 ${category}입니다. 운영 시간, 위치, 이용 정보 등을 확인하고 방문 계획을 세울 수 있습니다.`;
}

function getFestivalDetail(rawDetail, fallbackItem) {
  const detail = rawDetail ?? {};
  const fallback = fallbackItem ?? {};

  const startDate = pickText(
    getField(detail, 'startDate', 'eventStartDate', 'eventstartdate'),
    fallback.startDate,
    fallback.eventStartDate,
  );

  const endDate = pickText(
    getField(detail, 'endDate', 'eventEndDate', 'eventenddate'),
    fallback.endDate,
    fallback.eventEndDate,
  );

  const imageUrls = normalizeImageUrls(detail.imageUrls);

  const imageUrl = pickText(
    getField(detail, 'imageUrl', 'firstImage', 'firstimage', 'firstimage2'),
    imageUrls[0],
    fallback.imageUrl,
    fallback.firstImage,
    fallback.firstimage,
  );

  const address = pickText(
    getField(detail, 'address', 'addr1'),
    fallback.address,
    fallback.rawAddress,
    fallback.addr1,
  );

  const eventPlace = pickText(
    getField(detail, 'eventPlace', 'eventplace'),
    fallback.eventPlace,
    fallback.eventplace,
  );

  const title = pickText(detail.title, fallback.title, '축제 상세');
  const region = pickText(detail.region, fallback.region, '충북');
  const category = pickText(detail.category, fallback.category, '행사');
  const themeCategory = pickText(detail.themeCategory, fallback.themeCategory);

  const contentTypeId = inferContentTypeId(
    category,
    pickText(getField(detail, 'contentTypeId', 'contenttypeid'), fallback.contentTypeId),
  );

  const description = pickText(
    getField(detail, 'description'),
    getField(detail, 'overview'),
    getField(detail, 'eventIntro', 'eventintro'),
    getField(detail, 'eventText', 'eventtext'),
    fallback.description,
    fallback.overview,
  );

  const normalizedDetail = {
    id: pickText(detail.id, detail.contentId, detail.contentid, fallback.contentId, fallback.id),
    title,
    region,
    category,
    themeCategory,
    status: pickText(detail.status, fallback.status),
    contentTypeId,
    startDate,
    endDate,
    period: formatDetailPeriod(startDate, endDate),
    address,
    eventPlace,
    place: pickText(eventPlace, address, region),
    tel: pickText(getField(detail, 'tel'), fallback.tel),
    homepage: pickText(
      extractHomepageUrl(detail.homepage),
      extractHomepageUrl(detail.eventHomepage),
      extractHomepageUrl(detail.eventhomepage),
      extractHomepageUrl(fallback.homepage),
    ),
    imageUrl,
    imageUrls,
    overview: pickText(detail.overview, description),
    description,
    descriptionSource: pickText(detail.descriptionSource, detail.description_source),
    playTime: pickText(detail.playTime, detail.playtime),
    useTimeFestival: pickText(detail.useTimeFestival, detail.usetimefestival),
    sponsor: pickText(detail.sponsor),
    timeLabel: pickText(detail.timeLabel, fallback.timeLabel),
    timeValue: pickText(detail.timeValue, fallback.timeValue),
    extraLabel: pickText(detail.extraLabel, fallback.extraLabel),
    extraValue: pickText(detail.extraValue, fallback.extraValue),
    mainInfo: normalizeMainInfo(detail.mainInfo),
    mapX: normalizeMapCoord(detail.mapX ?? detail.mapx ?? fallback.mapX ?? fallback.mapx),
    mapY: normalizeMapCoord(detail.mapY ?? detail.mapy ?? fallback.mapY ?? fallback.mapy),
    raw: {
      ...fallback,
      ...detail,
    },
  };

  return {
    ...normalizedDetail,
    description: description || buildFallbackDescription(normalizedDetail),
  };
}

function buildGoogleMapsDirectionsUrl(item) {
  if (!item) {
    return '';
  }

  const mapX = normalizeMapCoord(item.mapX ?? item.mapx);
  const mapY = normalizeMapCoord(item.mapY ?? item.mapy);

  if (!mapX || !mapY) {
    return '';
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${mapY},${mapX}`,
  )}`;
}

function makeInfoItem(icon, label, value) {
  const cleanedValue = cleanText(value);

  if (isPlaceholderText(cleanedValue)) {
    return null;
  }

  return {
    icon,
    label,
    value: cleanedValue,
  };
}

function buildKeyInfo(detail) {
  if (!detail) {
    return [];
  }

  if (detail.mainInfo?.length > 0) {
    return detail.mainInfo.map((item, index) => ({
      icon: ['▣', '◷', '⌖', '◇', '◎', '☎'][index % 6],
      label: item.label,
      value: item.value,
    }));
  }

  const item = detail.raw ?? {};
  const contentTypeId = String(detail.contentTypeId);

  const itemsByType = {
    15: [
      makeInfoItem('▣', '기간', detail.period),
      makeInfoItem('◷', '운영시간', getField(item, 'playTime', 'playtime') || detail.playTime),
      makeInfoItem('◎', '이용요금', getField(item, 'useTimeFestival', 'usetimefestival')),
      makeInfoItem('⌖', '행사장소', getField(item, 'eventPlace', 'eventplace') || detail.place),
      makeInfoItem('◇', '주최/주관', getField(item, 'sponsor') || detail.sponsor),
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
  };

  return (itemsByType[contentTypeId] ?? itemsByType[15]).filter(Boolean);
}

function buildHeroSummary(detail) {
  if (!detail) {
    return [];
  }

  const mainInfoTimeValue = findMainInfoValue(detail.mainInfo ?? [], [
    '이용 시간',
    '이용시간',
    '관람 시간',
    '관람시간',
    '운영 시간',
    '운영시간',
    '축제 기간',
    '축제 시간',
    '행사 기간',
    '행사 시간',
    '공연 시간',
  ]);

  const detailTimeValue = !isPlaceholderText(detail.timeValue) ? detail.timeValue : '';

  const timeItem = makeInfoItem(
    '◷',
    detail.timeLabel || '시간',
    detailTimeValue ||
      mainInfoTimeValue ||
      (!isPlaceholderText(detail.playTime) ? detail.playTime : '') ||
      detail.period,
  );

  const canUseExtraItem =
    detail.extraLabel &&
    !isBannedSummaryLabel(detail.extraLabel) &&
    !isPlaceholderText(detail.extraValue);

  const placeItem = makeInfoItem(
    '⌖',
    canUseExtraItem ? detail.extraLabel : '장소',
    canUseExtraItem ? detail.extraValue : detail.place || detail.address,
  );

  const contactValue =
    detail.tel || findMainInfoValue(detail.mainInfo ?? [], ['문의', '연락', '전화', '문의처']);

  return [timeItem, placeItem, makeInfoItem('☎', '문의처', contactValue)].filter(Boolean);
}

function detailReducer(state, action) {
  switch (action.type) {
    case 'start':
      return {
        detail: null,
        loading: true,
        errorMessage: '',
      };

    case 'success':
      return {
        detail: action.payload,
        loading: false,
        errorMessage: '',
      };

    case 'error':
      return {
        detail: null,
        loading: false,
        errorMessage: action.payload,
      };

    default:
      return state;
  }
}

export default function FestivalDetailPage() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackItem = location.state?.festival;
  const festivalListState = location.state?.festivalListState;

  const [state, dispatch] = useReducer(detailReducer, {
    detail: null,
    loading: true,
    errorMessage: '',
  });

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: 'start' });

    fetchFestivalDetail(contentId, { signal: controller.signal })
      .then(detail => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({
          type: 'success',
          payload: getFestivalDetail(detail, fallbackItem),
        });
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

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
  const heroSummary = useMemo(() => buildHeroSummary(detail), [detail]);
  const homepageUrl = useMemo(() => normalizeHomepageUrl(detail?.homepage), [detail]);

  if (state.loading) {
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

  if (!detail) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>축제 상세 정보가 없습니다.</div>
      </div>
    );
  }

  const introText = pickText(detail.description, detail.overview, '소개 정보가 없습니다.');

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/">홈</Link>
        <span>›</span>
        <Link to="/festival" state={festivalListState ? { festivalListState } : undefined}>
          체험·축제
        </Link>
        <span>›</span>
        <span>상세</span>
      </div>

      <section className={styles.heroSection}>
        <div className={styles.heroImageBox}>
          {detail.imageUrl ? (
            <img src={detail.imageUrl} alt={detail.title} className={styles.heroImage} />
          ) : (
            <div className={styles.heroFallback}>{DEFAULT_IMAGE_TEXT}</div>
          )}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badgeRow}>
            {detail.status && <span className={styles.statusBadge}>{detail.status}</span>}
            {detail.category && <span className={styles.categoryBadge}>{detail.category}</span>}
            {detail.themeCategory && detail.themeCategory !== detail.category && (
              <span className={styles.themeBadge}>{detail.themeCategory}</span>
            )}
          </div>

          <h1>{detail.title}</h1>
          <p className={styles.regionText}>{detail.region} 축제·체험 정보</p>

          {heroSummary.length > 0 && (
            <ul className={styles.summaryList}>
              {heroSummary.map(item => (
                <li key={`${item.label}-${item.value}`}>
                  <span aria-hidden="true">{item.icon}</span>
                  <strong>{item.label}</strong>
                  {item.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="intro" className={styles.section}>
        <div className={styles.introGrid}>
          <div>
            <h2>소개</h2>
            <p>{introText}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 정보</h2>

        {keyInfo.length > 0 ? (
          <div className={styles.infoGrid}>
            {keyInfo.map(item => (
              <div key={`${item.label}-${item.value}`} className={styles.infoItem}>
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
            <strong>{detail.place && detail.place !== detail.address ? '장소' : '주소'}</strong>

            {detail.place && detail.place !== detail.address && <p>{detail.place}</p>}

            <p>Google Maps 연동 예정</p>

            {detail.address && <p className={styles.addressText}>{detail.address}</p>}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.outlineButton}
              >
                Google Maps에서 길찾기
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className={styles.bottomActions}>
        <button
          type="button"
          onClick={() =>
            navigate('/festival', {
              state: festivalListState ? { festivalListState } : undefined,
            })
          }
          className={styles.backButton}
        >
          ‹ 목록으로 돌아가기
        </button>

        {homepageUrl && (
          <a
            href={homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            공식 홈페이지 바로가기
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
