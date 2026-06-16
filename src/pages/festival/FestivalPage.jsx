import { useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExperienceList, fetchFestivalList } from '../../api/festivalApi';
import FestivalFilterPanel from './components/FestivalFilterPanel';
import FestivalGrid from './components/FestivalGrid';
import FestivalHero from './components/FestivalHero';
import FestivalPagination from './components/FestivalPagination';
import FestivalSectionHeader from './components/FestivalSectionHeader';
import styles from './FestivalPage.module.css';

const PAGE_SIZE = 8;
const API_FETCH_SIZE = 1000;
const RANGE_START_YEAR_OFFSET = 3;
const FESTIVAL_CACHE_KEY = 'chungbukFestivalItems:v4';
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
  { id: '15', category: '행사/공연/축제', status: '축제' },
  { id: '28', category: '레포츠', status: '체험' },
];

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

function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
    today.getDate(),
  ).padStart(2, '0')}`;
}

function getRollingDateRange() {
  const today = new Date();
  const currentYear = today.getFullYear();

  return {
    eventStartDate: `${currentYear - RANGE_START_YEAR_OFFSET}0101`,
    eventEndDate: getTodayString(),
  };
}

function normalizeDate(value) {
  return String(value ?? '').replaceAll('.', '').replaceAll('-', '').slice(0, 8);
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
    item.playtime ??
    item.playTime ??
    item.play_time ??
    item.usetime ??
    item.useTime ??
    item.usetimeculture ??
    item.useTimeCulture ??
    item.usetimeleports ??
    item.useTimeLeports ??
    item.openperiod ??
    item.openPeriod ??
    item.restdate ??
    item.restDate ??
    item.restdateculture ??
    item.restDateCulture ??
    item.restdateleports ??
    item.restDateLeports ??
    item.spendtime ??
    item.spendTime ??
    item['공연시간'] ??
    item['행사시간'] ??
    item['운영시간'] ??
    item['관람시간'] ??
    item['이용시간'] ??
    item['개방시간'] ??
    item['휴무일'] ??
    ''
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
    fallbackCategory ??
    getContentTypeCategory(item.contentTypeId ?? item.contenttypeid) ??
    item.category ??
    item.catName ??
    item.contentTypeName ??
    item['축제유형'] ??
    item['행사유형'] ??
    item['분류'] ??
    '문화축제'
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

function normalizeFestival(item, options = {}) {
  const contentTypeId = String(item.contentTypeId ?? item.contenttypeid ?? options.contentTypeId ?? '');
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
  const region = normalizeRegionName(
    item.region ??
    item.area ??
    item['개최지역'] ??
    item['시군구명'] ??
    item['시군명'] ??
    String(address).split(' ')[1] ??
    '',
  );
  const description = createCategoryDescription(item, contentTypeId);
  const rawDisplayInfo = item.displayInfo ?? item.display_info ?? '';
  const rawSubInfo = item.subInfo ?? item.sub_info ?? '';
  const displayInfo = isEmptyInfoText(rawDisplayInfo) ? '' : rawDisplayInfo;
  const subInfo = isEmptyInfoText(rawSubInfo) ? '' : rawSubInfo;

  return {
    id: String(
      `${contentTypeId || 'festival'}-${
        item.id ??
        item.contentId ??
        item.contentid ??
        item.festivalId ??
        item['축제명'] ??
        item.title
      }`,
    ),
    contentId: String(item.contentId ?? item.contentid ?? item.id ?? item.festivalId ?? ''),
    title: item.title ?? item.name ?? item.eventName ?? item['축제명'] ?? '이름 없는 축제',
    region,
    category: pickCategory(item, options.category),
    status: pickStatus(item) || options.status || getContentTypeStatus(contentTypeId) || getDefaultStatus(startDate),
    contentTypeId,
    startDate,
    endDate,
    description: displayInfo || description.text,
    descriptionLabel: displayInfo ? '' : description.label,
    subInfo,
    imageUrl: item.imageUrl ?? item.firstImage ?? item.firstimage ?? item.firstimage2 ?? '',
    tel: item.tel ?? item.phone ?? item.telNo ?? '',
    rawAddress: address,
  };
}

function compareFestivalDate(a, b) {
  return (b.startDate || '00000000').localeCompare(a.startDate || '00000000');
}

function isChungbukFestival(item) {
  return [item.region, item.rawAddress].some(value =>
    CHUNGBUK_KEYWORDS.some(keyword => String(value ?? '').includes(keyword)),
  );
}

function normalizeFestivalResponse(payload, options) {
  const items = pickArray(payload).map(item => normalizeFestival(item, options));

  return {
    items: [...items].sort(compareFestivalDate),
  };
}

async function fetchFestivalRange({ eventStartDate, eventEndDate, signal }) {
  const payload = await fetchFestivalList({
    page: 1,
    size: API_FETCH_SIZE,
    eventStartDate,
    eventEndDate,
    region: '충북',
    signal,
  });

  return normalizeFestivalResponse(payload, {
    category: '행사/공연/축제',
    contentTypeId: '15',
    status: '축제',
  }).items;
}

async function fetchExperienceRange({ contentTypeId, category, status, signal }) {
  const payload = await fetchExperienceList({
    page: 1,
    size: API_FETCH_SIZE,
    region: '충북',
    contentTypeId,
    signal,
  });

  return normalizeFestivalResponse(payload, {
    category,
    contentTypeId,
    status,
  }).items;
}

function dedupeFestivals(items) {
  const seen = new Set();

  return items.filter(item => {
    const key = item.id || `${item.title}-${item.startDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readFestivalCache() {
  try {
    const cached = sessionStorage.getItem(FESTIVAL_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function writeFestivalCache(items) {
  try {
    sessionStorage.setItem(FESTIVAL_CACHE_KEY, JSON.stringify(items));
  } catch {
    // 캐시 실패는 화면 동작에 영향이 없어야 합니다.
  }
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
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [{ festivals, loading, errorMessage }, dispatch] = useReducer(
    festivalRequestReducer,
    initialRequestState,
  );

  const filteredFestivals = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return festivals.filter(item => {
      const keywordMatch =
        normalizedKeyword === '' ||
        [item.title, item.region, item.category, item.description, item.subInfo]
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
    const fetchedCategories = festivals.map(item => item.category).filter(Boolean);
    return ['전체', ...new Set([...CONTENT_TYPES.map(type => type.category), ...fetchedCategories])];
  }, [festivals]);

  useEffect(() => {
    const controller = new AbortController();
    const cachedItems = readFestivalCache();

    if (cachedItems) {
      dispatch({ type: 'success', payload: { items: cachedItems } });
      return () => {
        controller.abort();
      };
    }

    dispatch({ type: 'start' });
    const { eventStartDate, eventEndDate } = getRollingDateRange();

    Promise.all([
      fetchFestivalRange({ eventStartDate, eventEndDate, signal: controller.signal }),
      ...CONTENT_TYPES.filter(type => type.id !== '15').map(type =>
        fetchExperienceRange({
          contentTypeId: type.id,
          category: type.category,
          status: type.status,
          signal: controller.signal,
        }),
      ),
    ])
      .then(rangeItems => {
        const items = dedupeFestivals(rangeItems.flat()).sort(compareFestivalDate);

        const normalizedItems = dedupeFestivals(items)
          .filter(isChungbukFestival)
          .sort(compareFestivalDate);
        writeFestivalCache(normalizedItems);
        return { items: normalizedItems };
      })
      .then(result => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'success', payload: result });
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
      state: { festival: item },
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
