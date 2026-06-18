import { useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchExperienceList, fetchFestivalList } from '../../api/festivalApi';
import FestivalFilterPanel from './components/FestivalFilterPanel';
import FestivalGrid from './components/FestivalGrid';
import FestivalHero from './components/FestivalHero';
import FestivalPagination from './components/FestivalPagination';
import FestivalSectionHeader from './components/FestivalSectionHeader';
import styles from './FestivalPage.module.css';

const PAGE_SIZE = 8;
const API_FETCH_SIZE = 100;
const RANGE_START_YEAR_OFFSET = 3;
const CHUNGBUK_KEYWORDS = ['충북', '충청북도'];
const CHUNGBUK_REGIONS = [
  '청주',
  '충주',
  '제천',
  '보은',
  '옥천',
  '영동',
  '증평',
  '진천',
  '괴산',
  '음성',
  '단양',
];

const CONTENT_TYPES = [
  { id: '12', category: '관광지', status: '체험' },
  { id: '14', category: '문화시설', status: '체험' },
  { id: '15', category: '축제', status: '축제' },
  { id: '28', category: '레포츠', status: '체험' },
];

const CATEGORY_OPTIONS = ['전체', '관광지', '문화시설', '행사', '공연', '축제', '레포츠'];
const BANNED_CARD_INFO_LABELS = [
  '축제 테마',
  '관광 유형',
  '시설 유형',
  '활동 유형',
  '행사 유형',
  '공연 유형',
];
const FESTIVAL_LIST_STATE_KEY = 'chungbukFestivalListState:v1';

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.items?.item)) return payload.items.item;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.items?.item)) return payload.data.items.item;
  if (Array.isArray(payload?.body?.items?.item)) return payload.body.items.item;
  if (Array.isArray(payload?.response?.body?.items?.item)) return payload.response.body.items.item;
  if (Array.isArray(payload?.festivals)) return payload.festivals;
  if (Array.isArray(payload?.results)) return payload.results;

  if (payload?.items?.item) return [payload.items.item];
  if (payload?.data?.items?.item) return [payload.data.items.item];
  if (payload?.body?.items?.item) return [payload.body.items.item];
  if (payload?.response?.body?.items?.item) return [payload.response.body.items.item];

  return [];
}

function pickTotalCount(payload, fallbackCount = 0) {
  const candidates = [
    payload?.totalCount,
    payload?.totalElements,
    payload?.total,
    payload?.count,
    payload?.data?.totalCount,
    payload?.data?.totalElements,
    payload?.body?.totalCount,
    payload?.response?.body?.totalCount,
  ];

  const totalCount = candidates
    .map(value => Number(value))
    .find(value => Number.isFinite(value) && value >= 0);

  return totalCount ?? fallbackCount;
}

function getRollingDateRange() {
  const today = new Date();
  const currentYear = today.getFullYear();

  return {
    eventStartDate: `${currentYear - RANGE_START_YEAR_OFFSET}0101`,
  };
}

function normalizeDate(value) {
  return String(value ?? '')
    .replaceAll('.', '')
    .replaceAll('-', '')
    .slice(0, 8);
}

function formatCompactDate(value) {
  const date = normalizeDate(value);
  if (date.length !== 8) return '';

  return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
}

function formatSummaryPeriod(startDate, endDate) {
  const start = formatCompactDate(startDate);
  const end = formatCompactDate(endDate);

  if (start && end) return `${start} ~ ${end}`;
  return start || end;
}

function pickIntro(item) {
  return (
    item.overview ??
    item.description ??
    item.summary ??
    item.intro ??
    item.content ??
    item.contentText ??
    item.infoText ??
    item.infotext ??
    item.infoContent ??
    item.infocontent ??
    item.eventIntro ??
    item.eventintro ??
    item.eventOverview ??
    item.eventDescription ??
    item.eventdescription ??
    item['소개문구'] ??
    item['소개'] ??
    item['내용'] ??
    ''
  );
}

function pickFirstText(...values) {
  return values.find(value => String(value ?? '').trim()) ?? '';
}

function pickPlaytime(item) {
  return pickFirstText(
    item.playtime,
    item.playTime,
    item.play_time,
    item.usetime,
    item.useTime,
    item.usetimeculture,
    item.useTimeCulture,
    item.usetimeleports,
    item.useTimeLeports,
    item.openperiod,
    item.openPeriod,
    item.restdate,
    item.restDate,
    item.restdateculture,
    item.restDateCulture,
    item.restdateleports,
    item.restDateLeports,
    item.spendtime,
    item.spendTime,
    item['공연시간'],
    item['행사시간'],
    item['운영시간'],
    item['관람시간'],
    item['이용시간'],
    item['개방시간'],
    item['휴무일'],
  );
}

function createCategoryDescription(item, fallbackContentTypeId = '') {
  const contentTypeId = String(
    item.contentTypeId ?? item.contenttypeid ?? fallbackContentTypeId ?? '',
  );
  const intro = pickIntro(item);
  const playtime = pickPlaytime(item);

  if (contentTypeId === '12') {
    return {
      label: intro ? '관광소개' : '관광정보',
      text: intro || playtime || '충북에서 둘러볼 수 있는 관광 명소입니다.',
    };
  }

  if (contentTypeId === '14') {
    return {
      label: playtime ? '이용정보' : '시설소개',
      text: playtime || intro || '충북의 문화와 전시를 만날 수 있는 문화시설입니다.',
    };
  }

  if (contentTypeId === '28') {
    return {
      label: intro ? '체험소개' : '이용정보',
      text: intro || playtime || '충북에서 즐길 수 있는 레포츠 체험입니다.',
    };
  }

  return {
    label: playtime ? '행사시간' : '행사정보',
    text: playtime || intro || '충북에서 열리는 행사/공연/축제 정보입니다.',
  };
}

function createSummaryDescription(item, contentTypeId, startDate, endDate, address) {
  const status = pickStatus(item);
  const period = formatSummaryPeriod(startDate, endDate);
  const place = pickFirstText(item.eventPlace, item.eventplace, address);

  if (period) {
    return [status, period, place].filter(Boolean).join(' · ');
  }

  if (place) {
    return place;
  }

  return createCategoryDescription(item, contentTypeId).text;
}

function pickStatus(item) {
  return (
    item.status ??
    item.eventStatus ??
    item.progressStatus ??
    item.state ??
    item.eventState ??
    item.statusName ??
    ''
  );
}

function getContentTypeCategory(contentTypeId) {
  return CONTENT_TYPES.find(type => type.id === String(contentTypeId))?.category;
}

function getContentTypeStatus(contentTypeId) {
  return CONTENT_TYPES.find(type => type.id === String(contentTypeId))?.status;
}

function pickCategory(item, fallbackCategory) {
  return (
    item.category ??
    fallbackCategory ??
    getContentTypeCategory(item.contentTypeId ?? item.contenttypeid) ??
    item.catName ??
    item.contentTypeName ??
    item['축제유형'] ??
    item['행사유형'] ??
    item['분류'] ??
    '문화축제'
  );
}

function pickThemeCategory(item) {
  return (
    item.themeCategory ??
    item.theme_category ??
    item.theme ??
    item.themeName ??
    item.contentTypeName ??
    ''
  );
}

function normalizeRegionName(value) {
  const region = String(value ?? '')
    .replace(/^(충청북도|충북)\s*/, '')
    .split(/\s+/)[0]
    .replace(/(특별자치시|시|군|구)$/u, '');

  return CHUNGBUK_REGIONS.includes(region) ? region : region;
}

function getDefaultStatus(startDate) {
  if (startDate) return '축제';
  return '행사';
}

function isEmptyInfoText(value) {
  const text = String(value ?? '').trim();

  return (
    !text ||
    text === '상세 정보를 확인해 주세요' ||
    text === '정보 준비 중' ||
    text === '정보 없음' ||
    text === '없음' ||
    text === '없습니다' ||
    text === '-' ||
    text === '0'
  );
}

function isPlaceholderInfo(value) {
  const text = String(value ?? '').trim();

  return isEmptyInfoText(text) || text === '상세페이지에서 확인';
}

function normalizeCompareText(value) {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function isBannedCardInfoLabel(label) {
  const normalizedLabel = normalizeCompareText(label);

  return BANNED_CARD_INFO_LABELS.map(normalizeCompareText).includes(normalizedLabel);
}

function createFallbackPrimaryInfo({ category, startDate, endDate }) {
  const period = formatSummaryPeriod(startDate, endDate);

  if (!period || !['축제', '행사', '공연'].includes(category)) {
    return { label: '', value: '' };
  }

  if (category === '축제') return { label: '축제 기간', value: period };
  if (category === '공연') return { label: '공연 시간', value: period };
  return { label: '행사 시간', value: period };
}

function createFallbackSecondaryInfo({ eventPlace, extraLabel, extraValue, address, region, tel }) {
  if (!isPlaceholderInfo(eventPlace)) {
    return { label: '장소', value: eventPlace };
  }

  if (
    ['장소', '위치'].some(keyword => String(extraLabel ?? '').includes(keyword)) &&
    !isPlaceholderInfo(extraValue)
  ) {
    return { label: extraLabel || '장소', value: extraValue };
  }

  if (!isPlaceholderInfo(address)) {
    return { label: '장소', value: address };
  }

  if (!isPlaceholderInfo(region)) {
    return { label: '위치', value: region };
  }

  if (!isPlaceholderInfo(tel)) {
    return { label: '문의', value: tel };
  }

  return { label: '', value: '' };
}

function createCardInfo({
  category,
  timeLabel,
  timeValue,
  startDate,
  endDate,
  eventPlace,
  extraLabel,
  extraValue,
  address,
  region,
  tel,
}) {
  const fallbackPrimaryInfo = createFallbackPrimaryInfo({ category, startDate, endDate });

  const primaryInfo = !isPlaceholderInfo(timeValue)
    ? { label: timeLabel, value: timeValue }
    : fallbackPrimaryInfo;

  const canUseExtraInfo =
    extraLabel && !isBannedCardInfoLabel(extraLabel) && !isPlaceholderInfo(extraValue);

  const secondaryInfo = canUseExtraInfo
    ? { label: extraLabel, value: extraValue }
    : createFallbackSecondaryInfo({
        eventPlace,
        extraLabel,
        extraValue,
        address,
        region,
        tel,
      });

  if (primaryInfo.value) {
    return {
      primaryInfo,
      secondaryInfo: isPlaceholderInfo(secondaryInfo.value)
        ? { label: '', value: '' }
        : secondaryInfo,
    };
  }

  return {
    primaryInfo: isPlaceholderInfo(secondaryInfo.value) ? { label: '', value: '' } : secondaryInfo,
    secondaryInfo: { label: '', value: '' },
  };
}

function readFestivalListState() {
  try {
    const savedState = sessionStorage.getItem(FESTIVAL_LIST_STATE_KEY);
    if (!savedState) return null;
    return JSON.parse(savedState);
  } catch {
    return null;
  }
}

function writeFestivalListState(state) {
  try {
    sessionStorage.setItem(FESTIVAL_LIST_STATE_KEY, JSON.stringify(state));
  } catch {
    // 목록 위치 저장 실패는 화면 동작을 막지 않습니다.
  }
}

function normalizeFestival(item, options = {}) {
  const contentTypeId = String(
    item.contentTypeId ?? item.contenttypeid ?? options.contentTypeId ?? '',
  );

  const startDate = normalizeDate(
    item.eventStartDate ??
      item.eventstartdate ??
      item.startDate ??
      item.startdate ??
      item['축제시작일자'] ??
      item['행사시작일자'] ??
      item['시작일자'] ??
      '',
  );

  const endDate = normalizeDate(
    item.eventEndDate ??
      item.eventenddate ??
      item.endDate ??
      item.enddate ??
      item['축제종료일자'] ??
      item['행사종료일자'] ??
      item['종료일자'] ??
      '',
  );

  const address =
    item.address ??
    item.addr1 ??
    item['소재지도로명주소'] ??
    item['소재지지번주소'] ??
    item['개최장소'] ??
    '';

  const eventPlace =
    item.eventPlace ?? item.eventplace ?? item['행사장소'] ?? item['공연장소'] ?? '';

  const region = normalizeRegionName(
    item.region ?? item.area ?? item['개최지역'] ?? item['시군구명'] ?? item['시군명'] ?? '',
  );

  const categoryDescription = createCategoryDescription(item, contentTypeId);
  const rawDisplayInfo = item.displayInfo ?? item.display_info ?? '';
  const rawSubInfo = item.subInfo ?? item.sub_info ?? '';

  const displayInfo = isEmptyInfoText(rawDisplayInfo) ? '' : rawDisplayInfo;
  const subInfo = isEmptyInfoText(rawSubInfo) ? '' : rawSubInfo;

  const category = pickCategory(item, options.category);
  const themeCategory = pickThemeCategory(item);

  const timeLabel = item.timeLabel ?? item.time_label ?? '';
  const timeValue = item.timeValue ?? item.time_value ?? '';
  const extraLabel = item.extraLabel ?? item.extra_label ?? '';
  const extraValue = item.extraValue ?? item.extra_value ?? '';

  const status =
    pickStatus(item) ||
    options.status ||
    getContentTypeStatus(contentTypeId) ||
    getDefaultStatus(startDate);

  const fallbackDescription =
    displayInfo || createSummaryDescription(item, contentTypeId, startDate, endDate, address);

  const tel = item.tel ?? item.phone ?? item.telNo ?? '';

  const { primaryInfo, secondaryInfo } = createCardInfo({
    category,
    timeLabel,
    timeValue,
    startDate,
    endDate,
    eventPlace,
    extraLabel,
    extraValue,
    address,
    region,
    tel,
  });

  const hasPrimaryInfo = !isPlaceholderInfo(primaryInfo.value);
  const hasSecondaryInfo = !isPlaceholderInfo(secondaryInfo.value);

  return {
    id: String(
      item.id ??
        item.contentId ??
        item.contentid ??
        `${contentTypeId || 'festival'}-${item.festivalId ?? item['축제명'] ?? item.title}`,
    ),
    contentId: String(item.id ?? item.contentId ?? item.contentid ?? item.festivalId ?? ''),
    title: item.title ?? item.name ?? item.eventName ?? item['축제명'] ?? '이름 없는 축제',
    region,
    category,
    themeCategory,
    status,
    contentTypeId,
    startDate,
    endDate,
    description: hasPrimaryInfo
      ? primaryInfo.value
      : fallbackDescription || categoryDescription.text,
    descriptionLabel: hasPrimaryInfo ? primaryInfo.label : '',
    subInfo: hasSecondaryInfo ? secondaryInfo.value : subInfo,
    subInfoLabel: hasSecondaryInfo ? secondaryInfo.label : '',
    timeLabel,
    timeValue,
    extraLabel,
    extraValue,
    imageUrl: item.imageUrl ?? item.firstImage ?? item.firstimage ?? item.firstimage2 ?? '',
    tel,
    mapX: item.mapX ?? item.mapx ?? '',
    mapY: item.mapY ?? item.mapy ?? '',
    eventPlace,
    address,
    rawAddress: address,
  };
}

function compareFestivalDate(a, b) {
  return (b.startDate || '00000000').localeCompare(a.startDate || '00000000');
}

function isChungbukFestival(item) {
  if (CHUNGBUK_REGIONS.includes(normalizeRegionName(item.region))) {
    return true;
  }

  return [item.region, item.rawAddress].some(value =>
    CHUNGBUK_KEYWORDS.some(keyword => String(value ?? '').includes(keyword)),
  );
}

function normalizeFestivalResponse(payload, options) {
  const items = pickArray(payload).map(item => normalizeFestival(item, options));

  return {
    items: [...items].sort(compareFestivalDate),
    totalCount: pickTotalCount(payload, items.length),
  };
}

async function fetchAllPages(fetchPage) {
  const firstPage = await fetchPage(1);
  const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / API_FETCH_SIZE));

  if (totalPages <= 1) {
    return firstPage.items;
  }

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2)),
  );

  return [firstPage, ...restPages].flatMap(pageResult => pageResult.items);
}

async function fetchFestivalPage({ page, eventStartDate, signal }) {
  const payload = await fetchFestivalList({
    page,
    size: API_FETCH_SIZE,
    eventStartDate,
    region: '전체',
    signal,
  });

  return normalizeFestivalResponse(payload, {
    category: '축제',
    contentTypeId: '15',
    status: '축제',
  });
}

async function fetchExperiencePage({ page, contentTypeId, category, status, signal }) {
  const payload = await fetchExperienceList({
    page,
    size: API_FETCH_SIZE,
    region: '전체',
    contentTypeId,
    signal,
  });

  return normalizeFestivalResponse(payload, {
    category,
    contentTypeId,
    status,
  });
}

async function fetchAllFestivalItems({ signal }) {
  const { eventStartDate } = getRollingDateRange();

  const rangeItems = await Promise.all([
    fetchAllPages(page =>
      fetchFestivalPage({
        page,
        eventStartDate,
        signal,
      }),
    ),
    ...CONTENT_TYPES.filter(type => type.id !== '15').map(type =>
      fetchAllPages(page =>
        fetchExperiencePage({
          page,
          contentTypeId: type.id,
          category: type.category,
          status: type.status,
          signal,
        }),
      ),
    ),
  ]);

  return dedupeFestivals(rangeItems.flat()).filter(isChungbukFestival).sort(compareFestivalDate);
}

function dedupeFestivals(items) {
  const seen = new Set();

  return items.filter(item => {
    const key = item.contentId || item.id || `${item.title}-${item.startDate}-${item.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const initialRequestState = {
  festivals: [],
  loading: true,
  errorMessage: '',
};

function festivalRequestReducer(state, action) {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        loading: true,
        errorMessage: '',
      };

    case 'success':
      return {
        festivals: action.payload.items,
        loading: false,
        errorMessage: '',
      };

    case 'error':
      return {
        festivals: [],
        loading: false,
        errorMessage: action.payload,
      };

    default:
      return state;
  }
}

export default function FestivalPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedListState = useMemo(
    () => location.state?.festivalListState ?? readFestivalListState(),
    [location.state],
  );

  const [keyword, setKeyword] = useState(savedListState?.keyword ?? '');
  const [selectedRegion, setSelectedRegion] = useState(savedListState?.selectedRegion ?? '전체');
  const [selectedCategory, setSelectedCategory] = useState(
    savedListState?.selectedCategory ?? '전체',
  );
  const [currentPage, setCurrentPage] = useState(savedListState?.currentPage ?? 1);

  const [{ festivals, loading, errorMessage }, dispatch] = useReducer(
    festivalRequestReducer,
    initialRequestState,
  );

  const filteredFestivals = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return festivals.filter(item => {
      const keywordMatch =
        normalizedKeyword === '' ||
        [
          item.title,
          item.region,
          item.category,
          item.themeCategory,
          item.description,
          item.descriptionLabel,
          item.subInfo,
          item.subInfoLabel,
          item.address,
          item.extraValue,
        ]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(normalizedKeyword));

      const regionMatch = selectedRegion === '전체' || item.region === selectedRegion;
      const categoryMatch = selectedCategory === '전체' || item.category === selectedCategory;

      return keywordMatch && regionMatch && categoryMatch;
    });
  }, [festivals, keyword, selectedRegion, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredFestivals.length / PAGE_SIZE));
  const pagedFestivals = filteredFestivals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const regionOptions = useMemo(() => {
    const fetchedRegions = festivals
      .map(item => item.region)
      .filter(Boolean)
      .map(normalizeRegionName);

    return ['전체', ...new Set([...CHUNGBUK_REGIONS, ...fetchedRegions])];
  }, [festivals]);

  const categoryOptions = useMemo(() => {
    return CATEGORY_OPTIONS;
  }, []);

  useEffect(() => {
    writeFestivalListState({
      keyword,
      selectedRegion,
      selectedCategory,
      currentPage,
    });
  }, [keyword, selectedRegion, selectedCategory, currentPage]);

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: 'start' });

    fetchAllFestivalItems({ signal: controller.signal })
      .then(normalizedItems => {
        if (controller.signal.aborted) return;

        dispatch({
          type: 'success',
          payload: { items: normalizedItems },
        });
      })
      .catch(error => {
        if (error.name === 'AbortError') return;

        dispatch({
          type: 'error',
          payload: error.message || '축제 목록 조회에 실패했습니다.',
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  const resetFilters = () => {
    setKeyword('');
    setSelectedRegion('전체');
    setSelectedCategory('전체');
    setCurrentPage(1);
  };

  const handleClickDetail = item => {
    const contentId = item.contentId || item.id;

    navigate(`/festival/${encodeURIComponent(contentId)}`, {
      state: {
        festival: item,
        festivalListState: {
          keyword,
          selectedRegion,
          selectedCategory,
          currentPage,
        },
      },
    });
  };

  return (
    <div className={styles.page}>
      <FestivalHero />

      <main className={styles.content}>
        <FestivalFilterPanel
          keyword={keyword}
          regionOptions={regionOptions}
          categoryOptions={categoryOptions}
          selectedRegion={selectedRegion}
          selectedCategory={selectedCategory}
          onKeywordChange={value => {
            setKeyword(value);
            setCurrentPage(1);
          }}
          onRegionChange={value => {
            setSelectedRegion(value);
            setCurrentPage(1);
          }}
          onCategoryChange={value => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}
          onReset={resetFilters}
        />

        <FestivalSectionHeader count={filteredFestivals.length} />

        <FestivalGrid
          festivals={pagedFestivals}
          loading={loading}
          errorMessage={errorMessage}
          onClickDetail={handleClickDetail}
        />

        <FestivalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}
