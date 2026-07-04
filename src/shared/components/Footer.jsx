import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FiExternalLink, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import styles from './Footer.module.css';

const FOOTER_LINKS = [
  { label: '이용 안내', path: '/guide' },
  { label: '관광지 찾기', path: '/map' },
  { label: '축제 정보', path: '/festival' },
  { label: '숙박 정보', path: '/lodging' },
];

const POLICY_LINKS = ['개인정보처리방침', '이용약관', '저작권정책', '오시는 길'];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.brandSection} aria-label="서비스 정보">
          <Link to="/" className={styles.brandName} aria-label="메인으로 이동">
            GLOBAL CULTURE FOUNDATION
          </Link>

          <p className={styles.description}>
            충북의 관광지, 축제, 숙박, 여행 코스를 한곳에서 탐색할 수 있는 AI 관광 안내
            서비스입니다.
          </p>

          <address className={styles.contactList}>
            <span>
              <FiMapPin aria-hidden="true" />
              충청북도 청주시 청원구 상당로 314
            </span>
            <a href="tel:043-000-0000">
              <FiPhone aria-hidden="true" />
              043-000-0000
            </a>
            <a href="mailto:jky011027@naver.com">
              <FiMail aria-hidden="true" />
              jky011027@naver.com
            </a>
          </address>
        </section>

        <section className={styles.linkSection} aria-label="푸터 링크">
          <div className={styles.linkGroup}>
            <strong>바로가기</strong>
            <nav className={styles.navLinks} aria-label="푸터 주요 메뉴">
              {FOOTER_LINKS.map(link => (
                <Link key={link.path} to={link.path}>
                  {link.label}
                  <FiExternalLink aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.linkGroup}>
            <strong>정책 및 안내</strong>
            <div className={styles.policyLinks}>
              {POLICY_LINKS.map(label => (
                <a key={label} href="#footer">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.socialRow} aria-label="소셜 링크">
            <a href="#footer" aria-label="Instagram">
              <FaInstagram aria-hidden="true" />
            </a>
            <a href="#footer" aria-label="YouTube">
              <FaYoutube aria-hidden="true" />
            </a>
            <a href="#footer" aria-label="Facebook">
              <FaFacebookF aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>

      <div className={styles.bottomBar} id="footer">
        <div className={styles.bottomInner}>
          <span>GLOBAL CULTURE FOUNDATION</span>
          <p>Copyright © Global Culture Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
