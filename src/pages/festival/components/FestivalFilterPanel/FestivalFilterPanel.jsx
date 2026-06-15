import styles from './FestivalFilterPanel.module.css';

const REGIONS = ['전체', '청주', '충주', '제천', '단양', '보은', '영동'];
const CATEGORIES = ['전체', '문화축제', '먹거리', '자연체험', '액티비티', '야간행사', '전통시장'];

function FilterRow({ label, options, selected, onChange, variant = 'purple' }) {
  return (
    <div className={styles.filterRow}>
      <span className={styles.filterLabel}>{label}</span>

      <div className={styles.filterOptions}>
        {options.map(option => {
          const active = selected === option;
          const activeClass =
            variant === 'cyan' ? styles.filterButtonActiveCyan : styles.filterButtonActivePurple;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`${styles.filterButton} ${active ? activeClass : ''}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FestivalFilterPanel({
  keyword,
  selectedRegion,
  selectedCategory,
  onKeywordChange,
  onRegionChange,
  onCategoryChange,
  onReset,
}) {
  return (
    <section className={styles.panel} aria-label="축제와 체험 검색 필터">
      <div className={styles.searchRow}>
        <form
          onSubmit={event => {
            event.preventDefault();
          }}
          className={styles.searchForm}
        >
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>

            <input
              type="text"
              value={keyword}
              onChange={event => onKeywordChange(event.target.value)}
              placeholder="축제, 체험, 지역 또는 키워드를 검색하세요"
              className={styles.searchInput}
            />
          </div>
        </form>

        <button type="button" onClick={onReset} className={styles.resetButton}>
          초기화
        </button>
      </div>

      <div className={styles.filterGroup}>
        <FilterRow
          label="지역"
          options={REGIONS}
          selected={selectedRegion}
          onChange={onRegionChange}
        />

        <FilterRow
          label="카테고리"
          options={CATEGORIES}
          selected={selectedCategory}
          onChange={onCategoryChange}
          variant="cyan"
        />
      </div>
    </section>
  );
}
