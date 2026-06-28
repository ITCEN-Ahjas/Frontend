import { FiArrowRight, FiCalendar, FiMapPin, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from '../MainPage.module.css';

export default function MainQuickOverview({ popularRegions, searchKeywords, todayStats }) {
  return (
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
              {popularRegions.map(region => (
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
              {searchKeywords.map(keyword => (
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
              {todayStats.map(stat => (
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
  );
}
