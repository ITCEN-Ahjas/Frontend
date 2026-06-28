import { useState } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiCloud,
  FiMapPin,
  FiSearch,
  FiSun,
  FiUmbrella,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import mainHeroImage from '../../assets/main-hero.png';
import {
  mainFeatureCards,
  mainPopularRegions,
  mainSearchKeywords,
  mainTodayStats,
  mainWeatherCards,
} from './mainPageMock';
import styles from './MainPage.module.css';

export default function MainPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const primaryWeather = mainWeatherCards[0];

  function handleSearchSubmit(event) {
    event.preventDefault();

    const keyword = searchKeyword.trim();
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

    navigate(`/map${query}`);
  }

  return (
    <section className={styles.page}>
      <div className={styles.heroCard}>
        <div className={styles.heroContent}>
          <h1>
            충북 여행을 <span>한눈에</span>
          </h1>
          <p>지도 검색부터 체험·축제, 숙박, AI 여행 추천까지 충북 여행을 쉽고 편리하게 계획해보세요.</p>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <label className={styles.searchLabel}>
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={searchKeyword}
                onChange={event => setSearchKeyword(event.target.value)}
                placeholder="어디로 떠나볼까요?"
                aria-label="충북 여행 검색어"
              />
            </label>
            <button type="submit">검색</button>
          </form>
        </div>

        <div className={styles.heroVisual} aria-label="충북 여행 대표 이미지">
          <img src={mainHeroImage} alt="" className={styles.heroImage} />
        </div>
      </div>

      <div className={styles.contentStack}>
        <section className={styles.quickOverview} aria-label="여행 한눈에 보기">
          <div className={styles.quickColumn}>
            <strong className={styles.quickTitle}>여행 한눈에 보기</strong>
            <div className={styles.quickContent}>
              <div className={styles.quickIcon}>
                <FiMapPin aria-hidden="true" />
              </div>
              <div>
                <span>인기 지역</span>
                <div className={styles.chipRow}>
                  {mainPopularRegions.map(region => (
                    <Link key={region.id} to={region.href}>
                      {region.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/map" className={styles.arrowLink} aria-label="인기 지역 전체 보기">
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.quickColumn}>
            <div className={styles.quickContent}>
              <div className={styles.quickIcon}>
                <span>#</span>
              </div>
              <div>
                <span>실시간 키워드</span>
                <div className={styles.chipRow}>
                  {mainSearchKeywords.map(keyword => (
                    <Link key={keyword.id} to={keyword.href}>
                      {keyword.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/map" className={styles.arrowLink} aria-label="키워드 검색으로 이동">
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.quickColumn}>
            <div className={styles.quickContent}>
              <div className={styles.quickIcon}>
                <FiCalendar aria-hidden="true" />
              </div>
              <div>
                <span>오늘의 충북</span>
                <div className={styles.statRow}>
                  {mainTodayStats.map(stat => (
                    <Link key={stat.id} to={stat.href}>
                      {stat.label} <strong>{stat.value}</strong>
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/festival" className={styles.arrowLink} aria-label="오늘의 충북 더보기">
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Link to="/clothing" className={styles.tipColumn}>
            <div className={styles.quickIcon}>
              <FiSun aria-hidden="true" />
            </div>
            <div>
              <span>여행 팁</span>
              <p>비 예보가 있으면 실내 코스도 함께 확인하세요.</p>
            </div>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.weatherOverview}>
          <div className={styles.weatherMain}>
            <div>
              <h2>충북 오늘의 날씨</h2>
              <span>
                <FiMapPin aria-hidden="true" />
                {primaryWeather.region}
              </span>
            </div>
            <div className={styles.weatherTemperature}>
              <FiCloud aria-hidden="true" />
              <strong>{primaryWeather.temperature}</strong>
              <p>{primaryWeather.condition}</p>
            </div>
          </div>

          <div className={styles.weatherDetails}>
            <div>
              <span>체감온도</span>
              <strong>26°C</strong>
            </div>
            <div>
              <span>강수확률</span>
              <strong>20%</strong>
            </div>
            <div>
              <span>습도</span>
              <strong>60%</strong>
            </div>
            <div>
              <span>바람</span>
              <strong>남풍 2.5m/s</strong>
            </div>
          </div>

          <div className={styles.weatherTimes}>
            {mainWeatherCards.map(weather => (
              <Link key={weather.id} to={weather.href}>
                <FiCloud aria-hidden="true" />
                <span>{weather.region}</span>
                <strong>{weather.temperature}</strong>
                <p>{weather.condition}</p>
              </Link>
            ))}
            <Link to="/clothing" className={styles.weatherTip}>
              <FiUmbrella aria-hidden="true" />
              <span>여행 전</span>
              <strong>날씨를 확인해보세요!</strong>
            </Link>
          </div>
        </section>

        <section className={styles.featureStrip} aria-label="주요 기능 바로가기">
          {mainFeatureCards.map(feature => (
            <Link key={feature.id} to={feature.href}>
              <span>{feature.label}</span>
              <strong>{feature.title}</strong>
            </Link>
          ))}
        </section>
      </div>
    </section>
  );
}
