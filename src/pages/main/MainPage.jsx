import { useEffect, useMemo, useReducer } from 'react';
import { fetchMainSummary } from '../../api/mainApi';
import mainHeroImage from '../../assets/main-hero.png';
import MainFeatureStrip from './components/MainFeatureStrip';
import MainHero from './components/MainHero';
import MainQuickOverview from './components/MainQuickOverview';
import MainWeatherOverview from './components/MainWeatherOverview';
import {
  mainFeatureCards,
  mainPopularRegions,
  mainSearchKeywords,
  mainTodayStats,
  mainWeatherCards,
} from './mainPageMock';
import styles from './MainPage.module.css';

const fallbackMainSummary = {
  popularRegions: mainPopularRegions,
  keywords: mainSearchKeywords,
  todayStats: mainTodayStats,
  weather: {
    primaryRegion: mainWeatherCards[0]?.region || '',
    temperature: mainWeatherCards[0]?.temperature || '',
    condition: mainWeatherCards[0]?.condition || '',
    feelsLike: '26°C',
    precipitationProbability: '20%',
    humidity: '60%',
    wind: '남풍 2.5m/s',
    recommendation: mainWeatherCards[0]?.recommendation || '',
    href: '/clothing',
    regions: mainWeatherCards,
  },
  featureCards: mainFeatureCards,
};

function normalizeArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeMainSummary(summary) {
  const data = summary ?? {};
  const weather = data.weather ?? {};

  return {
    popularRegions: normalizeArray(data.popularRegions, fallbackMainSummary.popularRegions),
    keywords: normalizeArray(data.keywords, fallbackMainSummary.keywords),
    todayStats: normalizeArray(data.todayStats, fallbackMainSummary.todayStats),
    weather: {
      ...fallbackMainSummary.weather,
      ...weather,
      regions: normalizeArray(weather.regions, fallbackMainSummary.weather.regions),
    },
    featureCards: normalizeArray(data.featureCards, fallbackMainSummary.featureCards),
  };
}

function mainReducer(state, action) {
  switch (action.type) {
    case 'success':
      return {
        data: normalizeMainSummary(action.payload),
        loading: false,
        errorMessage: '',
      };
    case 'error':
      return {
        data: fallbackMainSummary,
        loading: false,
        errorMessage: action.payload,
      };
    default:
      return state;
  }
}

export default function MainPage() {
  const [state, dispatch] = useReducer(mainReducer, {
    data: fallbackMainSummary,
    loading: true,
    errorMessage: '',
  });
  const mainData = useMemo(() => normalizeMainSummary(state.data), [state.data]);

  useEffect(() => {
    const controller = new AbortController();

    fetchMainSummary({ signal: controller.signal })
      .then(summary => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({ type: 'success', payload: summary });
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        dispatch({
          type: 'error',
          payload: error.message || '메인페이지 정보를 불러오지 못했습니다.',
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className={styles.page}>
      <MainHero heroImageSrc={mainHeroImage} />

      <div className={styles.contentStack}>
        {(state.loading || state.errorMessage) && (
          <div className={state.errorMessage ? styles.statusBannerError : styles.statusBanner}>
            {state.errorMessage || '메인페이지 정보를 불러오는 중입니다.'}
          </div>
        )}

        <MainQuickOverview
          popularRegions={mainData.popularRegions}
          searchKeywords={mainData.keywords}
          todayStats={mainData.todayStats}
        />
        <MainWeatherOverview weather={mainData.weather} />
        <MainFeatureStrip featureCards={mainData.featureCards} />
      </div>
    </section>
  );
}
