import { FiCloud, FiMapPin, FiUmbrella } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from '../MainPage.module.css';

export default function MainWeatherOverview({ weather }) {
  const weatherCards = Array.isArray(weather?.regions) ? weather.regions : [];
  const primaryWeather = weatherCards[0] ?? {};
  const primaryRegion = weather?.primaryRegion || primaryWeather.region || '';
  const temperature = weather?.temperature || primaryWeather.temperature || '';
  const condition = weather?.condition || primaryWeather.condition || '';
  const clothingHref = weather?.href || '/clothing';

  return (
    <section className={styles.weatherOverview}>
      <div className={styles.weatherMain}>
        <div>
          <h2>충북 오늘의 날씨</h2>
          <span>
            <FiMapPin aria-hidden="true" />
            {primaryRegion}
          </span>
        </div>
        <div className={styles.weatherTemperature}>
          <FiCloud aria-hidden="true" />
          <strong>{temperature}</strong>
          <p>{condition}</p>
        </div>
      </div>

      <div className={styles.weatherDetails}>
        <div>
          <span>체감온도</span>
          <strong>{weather?.feelsLike || '-'}</strong>
        </div>
        <div>
          <span>강수확률</span>
          <strong>{weather?.precipitationProbability || '-'}</strong>
        </div>
        <div>
          <span>습도</span>
          <strong>{weather?.humidity || '-'}</strong>
        </div>
        <div>
          <span>바람</span>
          <strong>{weather?.wind || '-'}</strong>
        </div>
      </div>

      <div className={styles.weatherTimes}>
        {weatherCards.map(weather => (
          <Link key={weather.id} to={weather.href}>
            <FiCloud aria-hidden="true" />
            <span>{weather.region}</span>
            <strong>{weather.temperature}</strong>
            <p>{weather.condition}</p>
          </Link>
        ))}
        <Link to={clothingHref} className={styles.weatherTip}>
          <FiUmbrella aria-hidden="true" />
          <span>여행 전</span>
          <strong>{weather?.recommendation || '날씨를 확인해보세요!'}</strong>
        </Link>
      </div>
    </section>
  );
}
