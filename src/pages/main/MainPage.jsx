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

export default function MainPage() {
  return (
    <section className={styles.page}>
      <MainHero heroImageSrc={mainHeroImage} />

      <div className={styles.contentStack}>
        <MainQuickOverview
          popularRegions={mainPopularRegions}
          searchKeywords={mainSearchKeywords}
          todayStats={mainTodayStats}
        />
        <MainWeatherOverview weatherCards={mainWeatherCards} />
        <MainFeatureStrip featureCards={mainFeatureCards} />
      </div>
    </section>
  );
}
