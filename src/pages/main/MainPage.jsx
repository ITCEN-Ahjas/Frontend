import { useState } from 'react';
import { FiArrowRight, FiMapPin, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  mainFeatureCards,
  mainPopularRegions,
  mainSearchKeywords,
  mainWeatherCards,
} from './mainPageMock';
import styles from './MainPage.module.css';

export default function MainPage() {
  const featuredRegion = mainPopularRegions[0];
  const primaryWeather = mainWeatherCards[0];
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  function handleSearchSubmit(event) {
    event.preventDefault();

    const keyword = searchKeyword.trim();
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

    navigate(`/map${query}`);
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Chungbuk Travel Guide</span>
            <h1>오늘의 충북 여행을 바로 찾아보세요</h1>
            <p>
              날씨, 지역, 취향에 맞춰 코스를 추천받고 충북의 축제, 체험, 숙박,
              여행 장소를 한 화면에서 시작할 수 있습니다.
            </p>
          </div>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <label className={styles.searchLabel}>
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={searchKeyword}
                onChange={event => setSearchKeyword(event.target.value)}
                placeholder="지역, 장소, 음식, 체험을 검색해보세요"
                aria-label="충북 여행 검색어"
              />
            </label>
            <button type="submit">
              검색
              <FiArrowRight aria-hidden="true" />
            </button>
          </form>

          <div className={styles.keywordRow} aria-label="추천 검색어">
            {mainSearchKeywords.map(keyword => (
              <Link key={keyword.id} to={keyword.href}>
                {keyword.label}
              </Link>
            ))}
          </div>

          <div className={styles.featureGrid}>
            {mainFeatureCards.map(feature => (
              <Link key={feature.id} to={feature.href} className={styles.featureCard}>
                <span>{feature.label}</span>
                <strong>{feature.title}</strong>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="충북 여행 메인 요약">
          <div className={styles.mapPanel}>
            <div className={styles.regionBadge}>
              <FiMapPin aria-hidden="true" />
              {featuredRegion.name}
            </div>
            <strong>{featuredRegion.description}</strong>
            <span>{featuredRegion.placeCount} places</span>
          </div>

          <div className={styles.weatherPanel}>
            <span>Today</span>
            <strong>{primaryWeather.temperature}</strong>
            <p>
              {primaryWeather.region} · {primaryWeather.condition}
            </p>
          </div>

          <div className={styles.routePanel}>
            <span>AI Route</span>
            <strong>3시간 충북 코스</strong>
            <p>날씨와 이동 흐름을 고려한 추천 일정</p>
          </div>
        </div>
      </div>
    </section>
  );
}
