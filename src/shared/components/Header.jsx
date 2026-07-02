import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { label: '이용 안내', path: '/guide' },
  { label: '지도', path: '/map' },
  { label: '체험·축제', path: '/festival' },
  { label: '숙박', path: '/lodging' },
  { label: 'AI 여행 추천', path: '/course' },
  { label: 'AI 옷차림 추천', path: '/clothing' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', isMobileMenuOpen);

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink
          to="/"
          className={styles.logoLink}
          aria-label="메인으로 이동"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <img src="/images/Logo.png" alt="충북 AI Tourism Guide" className={styles.logoImage} />
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

        <button
          type="button"
          className={styles.menuButton}
          aria-label={isMobileMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(open => !open)}
        >
          {isMobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>
      </div>

      <div
        className={isMobileMenuOpen ? styles.mobileBackdropOpen : styles.mobileBackdrop}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <nav
        id="mobile-navigation"
        className={isMobileMenuOpen ? styles.mobileNavOpen : styles.mobileNav}
        aria-label="모바일 주요 메뉴"
      >
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
