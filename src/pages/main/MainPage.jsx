import { Link } from 'react-router-dom';
import {
  mainFeatureCards,
  mainPopularRegions,
  mainSearchKeywords,
  mainTodayStats,
  mainWeatherCards,
} from './mainPageMock';
import styles from './MainPage.module.css';

export default function MainPage() {
  const primaryFeature = mainFeatureCards[0];
  const featuredRegion = mainPopularRegions[0];
  const primaryWeather = mainWeatherCards[0];

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.headerBlock}>
          <span className={styles.eyebrow}>Chungbuk Travel</span>
          <h1>충북 여행을 한 화면에서 시작하세요</h1>
          <p>
            메인페이지 화면 구조와 데이터 형태를 먼저 고정하기 위한 mock 기반
            기본 화면입니다.
          </p>
        </div>

        <div className={styles.previewGrid}>
          <Link to={primaryFeature.href} className={styles.previewCard}>
            <span>{primaryFeature.label}</span>
            <strong>{primaryFeature.title}</strong>
            <p>{primaryFeature.description}</p>
          </Link>

          <Link to={featuredRegion.href} className={styles.previewCard}>
            <span>인기 지역</span>
            <strong>{featuredRegion.name}</strong>
            <p>{featuredRegion.description}</p>
          </Link>

          <div className={styles.previewCard}>
            <span>오늘의 날씨</span>
            <strong>{primaryWeather.region}</strong>
            <p>
              {primaryWeather.temperature} · {primaryWeather.condition}
            </p>
          </div>
        </div>

        <div className={styles.dataSummary} aria-label="메인페이지 mock 데이터 요약">
          <span>기능 카드 {mainFeatureCards.length}개</span>
          <span>인기 지역 {mainPopularRegions.length}개</span>
          <span>추천 키워드 {mainSearchKeywords.length}개</span>
          <span>오늘의 충북 {mainTodayStats.length}개</span>
          <span>날씨 카드 {mainWeatherCards.length}개</span>
        </div>
      </div>
    </section>
  );
}
