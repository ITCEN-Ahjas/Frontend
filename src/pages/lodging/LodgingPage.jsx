import { useEffect, useMemo, useReducer, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ensureFestivalInitialized, fetchExperienceList } from '../../api/festivalApi';
import { fetchAccommodationList } from '../../api/lodgingApi';
import { listStagger, pageFade, riseIn } from '../../shared/animation/pageMotion';
import LodgingFilterPanel from './components/LodgingFilterPanel';
import LodgingGrid from './components/LodgingGrid';
import LodgingHero from './components/LodgingHero';
import LodgingPagination from './components/LodgingPagination';
import LodgingSectionHeader from './components/LodgingSectionHeader';
import styles from './LodgingPage.module.css';

const PAGE_SIZE = 8;
const FETCH_SIZE = 200;

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

const TYPE_OPTIONS = ['전체', '숙소', '캠핑장'];

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeAccommodation(item) {
  return {
    id: `acc-${item.id ?? item.contentId ?? item.contentid ?? item.title}`,
    contentId: String(item.id ?? item.contentId ?? item.contentid ?? ''),
    itemType: '숙소',
    title: item.title ?? '이름 없는 숙소',
    region: String(item.sigunguNm ?? item.region ?? '').trim() || '충북',
    category: item.category ?? '숙박',
    description: item.address ?? '',
    descriptionLabel: '주소',
    subInfo: item.tel ?? '',
    subInfoLabel: '문의',
    imageUrl: item.imageUrl ?? '',
    tel: item.tel ?? '',
    address: item.address ?? '',
  };
}

function normalizeCamping(item) {
  return {
    id: `camp-${item.id ?? item.title}`,
    contentId: String(item.id ?? ''),
    itemType: '캠핑장',
    title: item.title ?? '이름 없는 캠핑장',
    region: String(item.region ?? '').trim() || '충북',
    category: item.themeCategory || '캠핑',
    description: item.address ?? '',
    descriptionLabel: '주소',
    subInfo: item.timeValue || item.tel || '',
    subInfoLabel: item.timeValue ? (item.timeLabel || '운영시간') : '문의',
    imageUrl: item.imageUrl ?? '',
    tel: item.tel ?? '',
    address: item.address ?? '',
  };
}

const initialState = { allItems: [], loading: true, errorMessage: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, loading: true, errorMessage: '' };
    case 'success':
      return { allItems: action.payload, loading: false, errorMessage: '' };
    case 'error':
      return { allItems: [], loading: false, errorMessage: action.payload };
    default:
      return state;
  }
}

export default function LodgingPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const [{ allItems, loading, errorMessage }, dispatch] = useReducer(reducer, initialState);

  const regionOptions = useMemo(() => ['전체', ...CHUNGBUK_REGIONS], []);

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: 'start' });
    ensureFestivalInitialized().catch(() => {});

    Promise.all([
      fetchAccommodationList({ page: 1, size: FETCH_SIZE, signal: controller.signal })
        .then(payload => pickArray(payload).map(normalizeAccommodation))
        .catch(() => []),
      fetchExperienceList({
        contentTypeId: '28',
        size: 200,
        signal: controller.signal,
      })
        .then(payload =>
          pickArray(payload)
            .filter(item => item.themeCategory === '캠핑')
            .map(normalizeCamping),
        )
        .catch(() => []),
    ])
      .then(([accommodations, campings]) => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'success', payload: [...accommodations, ...campings] });
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        dispatch({ type: 'error', payload: error.message || '목록 조회에 실패했습니다.' });
      });

    return () => {
      controller.abort();
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return allItems.filter(item => {
      const typeMatch = selectedType === '전체' || item.itemType === selectedType;
      const regionMatch =
        selectedRegion === '전체' || String(item.region).includes(selectedRegion);
      const keywordMatch =
        normalizedKeyword === '' ||
        [item.title, item.region, item.category, item.description, item.subInfo, item.address]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(normalizedKeyword));

      return typeMatch && regionMatch && keywordMatch;
    });
  }, [allItems, keyword, selectedRegion, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const resetFilters = () => {
    setKeyword('');
    setSelectedRegion('전체');
    setSelectedType('전체');
    setCurrentPage(1);
  };

  const handleClickDetail = item => {
    if (item.itemType === '캠핑장') {
      navigate(`/festival/${encodeURIComponent(item.contentId)}`, {
        state: { festival: item },
      });
    } else {
      navigate(`/lodging/${encodeURIComponent(item.contentId)}`, {
        state: { lodging: item },
      });
    }
  };

  return (
    <motion.div
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={pageFade}
    >
      <LodgingHero />

      <motion.main className={styles.content} variants={listStagger}>
        <motion.div variants={riseIn}>
          <LodgingFilterPanel
            keyword={keyword}
            regionOptions={regionOptions}
            typeOptions={TYPE_OPTIONS}
            selectedRegion={selectedRegion}
            selectedType={selectedType}
            onKeywordChange={value => {
              setKeyword(value);
              setCurrentPage(1);
            }}
            onRegionChange={value => {
              setSelectedRegion(value);
              setCurrentPage(1);
            }}
            onTypeChange={value => {
              setSelectedType(value);
              setCurrentPage(1);
            }}
            onReset={resetFilters}
          />
        </motion.div>

        <motion.div variants={riseIn}>
          <LodgingSectionHeader count={filteredItems.length} />
        </motion.div>

        <motion.div variants={riseIn}>
          <LodgingGrid
            lodgings={pagedItems}
            loading={loading}
            errorMessage={errorMessage}
            onClickDetail={handleClickDetail}
          />
        </motion.div>

        <motion.div variants={riseIn}>
          <LodgingPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      </motion.main>
    </motion.div>
  );
}
