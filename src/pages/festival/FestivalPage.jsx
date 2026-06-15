import { useMemo, useState } from 'react';
import FestivalFilterPanel from './components/FestivalFilterPanel';
import FestivalGrid from './components/FestivalGrid';
import FestivalHero from './components/FestivalHero';
import FestivalPagination from './components/FestivalPagination';
import FestivalSectionHeader from './components/FestivalSectionHeader';
import { FESTIVALS } from './data/festivalDummyData';
import styles from './FestivalPage.module.css';

export default function FestivalPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFestivals = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return FESTIVALS.filter(item => {
      const keywordMatch =
        normalizedKeyword === '' ||
        [item.title, item.region, item.category, item.description]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(normalizedKeyword));

      const regionMatch = selectedRegion === '전체' || item.region === selectedRegion;
      const categoryMatch = selectedCategory === '전체' || item.category === selectedCategory;

      return keywordMatch && regionMatch && categoryMatch;
    });
  }, [keyword, selectedRegion, selectedCategory]);

  const resetFilters = () => {
    setKeyword('');
    setSelectedRegion('전체');
    setSelectedCategory('전체');
    setCurrentPage(1);
  };

  const handleClickDetail = id => {
    console.log('상세보기', id);
  };

  return (
    <div className={styles.page}>
      <FestivalHero />

      <main className={styles.content}>
        <FestivalFilterPanel
          keyword={keyword}
          selectedRegion={selectedRegion}
          selectedCategory={selectedCategory}
          onKeywordChange={setKeyword}
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

        <FestivalGrid festivals={filteredFestivals} onClickDetail={handleClickDetail} />

        <FestivalPagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
      </main>
    </div>
  );
}
