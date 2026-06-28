import { FiCloud, FiMapPin, FiUmbrella } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from '../MainPage.module.css';

export default function MainWeatherOverview({ weatherCards }) {
  const primaryWeather = weatherCards[0];

  return (
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
        {weatherCards.map(weather => (
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
  );
}
