import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { label: '사용설명서', path: '/guide' },
  { label: '지도', path: '/map' },
  { label: '체험·축제', path: '/festival' },
  { label: '숙박', path: '/lodging' },
  { label: 'AI 추천', path: '/clothing' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logoLink} aria-label="메인으로 이동">
          <span className={styles.logoText}>충북</span>

          <span className={styles.logoCopy}>
            <span className={styles.logoTitle}>AI TOURISM GUIDE</span>

            <span className={styles.logoSubtitle}>자연과 함께하는 여행</span>
          </span>
        </NavLink>

        <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
