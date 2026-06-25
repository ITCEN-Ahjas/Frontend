import { FiSearch } from 'react-icons/fi';
import { PLACE_CATEGORIES } from '../../../../api/placeApi';
import { CHUNGBUK_REGIONS } from '../../../../data/chungbukRegions';
import styles from './PlaceSearchPanel.module.css';

export default function PlaceSearchPanel({
  keyword,
  category,
  region,
  isLoading,
  onKeywordChange,
  onCategoryChange,
  onRegionChange,
  onSubmit,
}) {
  return (
    <section className={styles.panel} aria-labelledby="place-search-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>CHUNGBUK MAP</p>
        <h1 id="place-search-title" className={styles.title}>
          충북 지도 검색
        </h1>
        <p className={styles.description}>
          관광지, 음식점, 쇼핑 장소를 검색하고 원하는 목적지를 찾아보세요.
        </p>
      </div>

      <form className={styles.searchForm} onSubmit={onSubmit}>
        <label className={styles.searchLabel}>
          <span className={styles.visuallyHidden}>장소 검색어</span>
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={event => onKeywordChange(event.target.value)}
            placeholder="장소, 관광지, 음식점 검색"
          />
        </label>
        <button type="submit" className={styles.searchButton} disabled={isLoading}>
          검색
        </button>
      </form>

      <div className={styles.filterGroup}>
        <strong>지역</strong>
        <div className={styles.categories} aria-label="충북 시군">
          {CHUNGBUK_REGIONS.map(item => (
            <button
              key={item.value}
              type="button"
              className={`${styles.categoryButton} ${
                region === item.value ? styles.categoryButtonActive : ''
              }`}
              aria-pressed={region === item.value}
              disabled={isLoading}
              onClick={() => onRegionChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <strong>카테고리</strong>
        <div className={styles.categories} aria-label="장소 카테고리">
          {PLACE_CATEGORIES.map(item => (
            <button
              key={item.value}
              type="button"
              className={`${styles.categoryButton} ${
                category === item.value ? styles.categoryButtonActive : ''
              }`}
              aria-pressed={category === item.value}
              disabled={isLoading}
              onClick={() => onCategoryChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
