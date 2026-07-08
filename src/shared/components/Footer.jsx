import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiMail, FiPhone, FiX } from 'react-icons/fi';
import styles from './Footer.module.css';

const FOOTER_LINKS = [
  { label: '이용 안내', path: '/guide' },
  { label: '관광지 찾기', path: '/map' },
  { label: '축제 정보', path: '/festival' },
  { label: '숙박 정보', path: '/lodging' },
];

const POLICY_DETAILS = {
  privacy: {
    label: '개인정보처리방침',
    title: '개인정보처리방침',
    summary: 'Nadri Global AI는 서비스 제공에 필요한 최소한의 개인정보만 처리합니다.',
    sections: [
      {
        heading: '수집 항목',
        items: ['문의 응대에 필요한 이름, 연락처, 이메일', '서비스 개선을 위한 접속 기록 및 이용 로그'],
      },
      {
        heading: '이용 목적',
        items: ['관광 안내, 추천 서비스 제공 및 문의 처리', '서비스 안정성 개선과 부정 이용 방지'],
      },
      {
        heading: '보관 및 파기',
        items: ['목적 달성 후 지체 없이 파기합니다.', '법령상 보관 의무가 있는 정보는 정해진 기간 동안 분리 보관합니다.'],
      },
    ],
  },
  terms: {
    label: '이용약관',
    title: '이용약관',
    summary: 'Nadri Global AI 이용자는 안내 정보를 참고 자료로 활용하며, 현장 방문 전 최신 정보를 확인해야 합니다.',
    sections: [
      {
        heading: '서비스 범위',
        items: ['충북 관광지, 축제, 숙박, 여행 코스 및 AI 추천 정보를 제공합니다.', '외부 기관에서 제공하는 정보는 변경될 수 있습니다.'],
      },
      {
        heading: '이용자 의무',
        items: ['서비스를 부정한 방식으로 이용하거나 타인의 권리를 침해하지 않아야 합니다.', '예약, 결제, 방문 등 최종 의사결정은 이용자 책임으로 진행합니다.'],
      },
    ],
  },
  copyright: {
    label: '저작권정책',
    title: '저작권정책',
    summary: '서비스 내 콘텐츠와 화면 구성의 권리는 Nadri Global AI 또는 정당한 권리자에게 있습니다.',
    sections: [
      {
        heading: '콘텐츠 이용',
        items: ['개인적 참고 목적의 이용은 가능하나 무단 복제, 배포, 2차 가공은 제한됩니다.', '공공데이터 및 외부 연동 정보는 각 제공 기관의 이용 조건을 따릅니다.'],
      },
      {
        heading: '권리 침해 문의',
        items: ['권리 침해가 의심되는 콘텐츠는 이메일로 문의해 주세요.', '확인 후 필요한 조치를 진행합니다.'],
      },
    ],
  },
};

const POLICY_LINKS = Object.entries(POLICY_DETAILS).map(([key, policy]) => ({
  key,
  label: policy.label,
}));

export default function Footer() {
  const [activePolicyKey, setActivePolicyKey] = useState(null);
  const activePolicy = activePolicyKey ? POLICY_DETAILS[activePolicyKey] : null;
  const modalRoot = typeof document !== 'undefined' ? document.querySelector('main') : null;

  useEffect(() => {
    if (!activePolicy) {
      return undefined;
    }

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setActivePolicyKey(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activePolicy]);

  const policyModal =
    activePolicy && modalRoot
      ? createPortal(
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={() => setActivePolicyKey(null)}
          >
            <section
              className={styles.policyModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="footer-policy-title"
              onMouseDown={event => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <span>정책 및 안내</span>
                  <h2 id="footer-policy-title">{activePolicy.title}</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  aria-label="정책 및 안내 닫기"
                  onClick={() => setActivePolicyKey(null)}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>

              <p className={styles.modalSummary}>{activePolicy.summary}</p>

              <div className={styles.modalBody}>
                {activePolicy.sections.map(section => (
                  <section key={section.heading} className={styles.policySection}>
                    <h3>{section.heading}</h3>
                    <ul>
                      {section.items.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          </div>,
          modalRoot
        )
      : null;

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <section className={styles.brandSection} aria-label="서비스 정보">
            <Link to="/" className={styles.brandName} aria-label="메인으로 이동">
              <img src="/images/Logo.png" alt="" className={styles.brandLogo} />
              <span>Nadri Global AI</span>
            </Link>

            <p className={styles.description}>
              충북의 관광지, 축제, 숙박, 여행 코스를 외국인 여행자도 한곳에서 쉽게 탐색할 수 있는 AI 관광 안내 서비스입니다.
            </p>

            <address className={styles.contactList}>
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
                {POLICY_LINKS.map(policy => (
                  <button
                    key={policy.key}
                    type="button"
                    onClick={() => setActivePolicyKey(policy.key)}
                  >
                    {policy.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className={styles.bottomBar} id="footer">
          <div className={styles.bottomInner}>
            <span>Nadri Global AI</span>
            <p>Copyright © Nadri Global AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {policyModal}
    </>
  );
}
