import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiCalendar,
  FiCloud,
  FiHome,
  FiMap,
  FiMapPin,
  FiMessageCircle,
  FiSearch,
  FiThermometer,
  FiUserCheck,
} from 'react-icons/fi';
import { listStagger, pageFade, riseIn, softScaleIn } from '../../shared/animation/pageMotion';
import styles from './GuidePage.module.css';

const QUICK_CARDS = [
  {
    Icon: FiMap,
    iconClass: styles.quickIconFestival,
    title: '축제 · 체험',
    desc: '충북 곳곳의 축제와 체험 프로그램을 한눈에',
  },
  {
    Icon: FiHome,
    iconClass: styles.quickIconLodging,
    title: '숙소 · 캠핑',
    desc: '숙박시설과 캠핑장 정보를 한 곳에서 검색',
  },
  {
    Icon: FiCloud,
    iconClass: styles.quickIconWeather,
    title: '날씨 · 옷차림',
    desc: '지역별 날씨와 AI 기반 옷차림 추천',
  },
  {
    Icon: FiMessageCircle,
    iconClass: styles.quickIconAi,
    title: 'AI 여행 도우미',
    desc: '궁금한 것을 물어보면 AI가 바로 답변',
  },
];

const STEPS = [
  {
    heading: '지역 선택',
    text: '충북 11개 시·군(청주, 충주, 제천, 보은, 옥천, 영동, 증평, 진천, 괴산, 음성, 단양) 중 원하는 지역을 필터로 선택하세요.',
  },
  {
    heading: '정보 탐색',
    text: '축제·체험, 숙소·캠핑장 목록을 둘러보고 원하는 항목을 클릭해 상세 정보를 확인하세요.',
  },
  {
    heading: '날씨 확인',
    text: '날씨 탭에서 현재 날씨와 예보를 보고, AI 옷차림 추천까지 한 번에 확인하세요.',
  },
  {
    heading: 'AI 도우미 활용',
    text: '화면 오른쪽 아래 "AI 여행 도우미" 버튼을 눌러 궁금한 것을 자유롭게 물어보세요.',
  },
];

const FEATURES = [
  {
    Icon: FiSearch,
    title: '키워드 검색',
    text: '숙소명, 캠핑장명, 지역명 등으로 빠르게 원하는 정보를 찾을 수 있어요.',
  },
  {
    Icon: FiMapPin,
    title: '지역 필터',
    text: '충북 11개 시·군을 선택해 해당 지역 정보만 골라서 볼 수 있어요.',
  },
  {
    Icon: FiCalendar,
    title: '유형별 분류',
    text: '숙소와 캠핑장, 축제와 체험을 유형별로 구분해서 탐색할 수 있어요.',
  },
  {
    Icon: FiThermometer,
    title: '실시간 날씨',
    text: '지역별 현재 날씨와 기온, 예보를 실시간으로 확인할 수 있어요.',
  },
  {
    Icon: FiUserCheck,
    title: 'AI 옷차림 추천',
    text: '현재 날씨와 체감온도를 분석해 최적의 옷차림을 추천해 드려요.',
  },
  {
    Icon: FiMessageCircle,
    title: 'AI 채팅 도우미',
    text: '충북 여행에 관한 어떤 질문이든 AI가 친절하게 답변해 드려요.',
  },
];

const FAQS = [
  {
    q: '캠핑장 정보는 어디서 볼 수 있나요?',
    a: '상단 메뉴에서 [숙소·캠핑] 탭을 선택하고, 유형 필터에서 "캠핑장"을 고르면 충북의 캠핑장만 모아볼 수 있어요.',
  },
  {
    q: 'AI 도우미는 어떤 질문을 할 수 있나요?',
    a: '충북 여행지 추천, 축제 일정, 맛집, 교통편, 날씨 등 여행과 관련된 모든 것을 자유롭게 물어보세요. 오른쪽 하단 보라색 "AI 여행 도우미" 버튼을 누르면 바로 시작할 수 있어요.',
  },
  {
    q: '날씨 정보는 얼마나 자주 업데이트되나요?',
    a: '기상청 API를 통해 실시간으로 날씨 데이터를 받아오며, 3시간 단위 단기 예보도 함께 제공돼요.',
  },
  {
    q: '축제 일정은 어떻게 확인하나요?',
    a: '[축제·체험] 탭에서 원하는 지역과 카테고리를 선택하면 해당 조건에 맞는 축제 목록을 볼 수 있어요. 카드를 클릭하면 일정, 장소, 주최자 정보를 자세히 확인할 수 있어요.',
  },
];

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={pageFade}
    >
      {/* Hero */}
      <div className={styles.hero}>
        <motion.div className={styles.heroInner} variants={riseIn}>
          <motion.div className={styles.heroText} variants={riseIn}>
            <h1 className={styles.heroTitle}>충북 여행 플랫폼 이렇게 이용하세요</h1>
            <p className={styles.heroSub}>
              충청북도 11개 시·군의 축제, 숙소, 캠핑, 날씨, AI 도우미까지<br />
              여행에 필요한 모든 정보를 한 곳에서 확인하세요.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className={styles.content} variants={listStagger}>
        {/* Quick cards */}
        <motion.div className={styles.quickRow} variants={listStagger}>
          {QUICK_CARDS.map(card => (
            <motion.div key={card.title} className={styles.quickCard} variants={softScaleIn}>
              <div className={`${styles.quickIcon} ${card.iconClass}`}>
                <card.Icon aria-hidden="true" />
              </div>
              <div className={styles.quickTitle}>{card.title}</div>
              <div className={styles.quickDesc}>{card.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* How to use */}
        <motion.section className={styles.section} variants={riseIn}>
          <h2 className={styles.sectionTitle}>이용 방법</h2>
          <motion.div className={styles.stepList} variants={listStagger}>
            {STEPS.map((step, i) => (
              <motion.div key={step.heading} className={styles.stepCard} variants={riseIn}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepHeading}>{step.heading}</div>
                  <div className={styles.stepText}>{step.text}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section className={styles.section} variants={riseIn}>
          <h2 className={styles.sectionTitle}>주요 기능</h2>
          <motion.div className={styles.featureGrid} variants={listStagger}>
            {FEATURES.map(f => (
              <motion.div key={f.title} className={styles.featureCard} variants={softScaleIn}>
                <f.Icon className={styles.featureIcon} aria-hidden="true" />
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureText}>{f.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* FAQ */}
        <motion.section className={styles.section} variants={riseIn}>
          <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
          <motion.div className={styles.faqList} variants={listStagger}>
            {FAQS.map(faq => (
              <motion.div key={faq.q} className={styles.faqItem} variants={riseIn}>
                <div className={styles.faqQ}>{faq.q}</div>
                <div className={styles.faqA}>{faq.a}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA */}
        <motion.div className={styles.ctaBar} variants={riseIn}>
          <div className={styles.ctaTitle}>지금 바로 충북 여행을 시작해보세요</div>
          <div className={styles.ctaSub}>축제, 숙소, 캠핑, 날씨 정보가 모두 준비되어 있어요.</div>
          <button
            type="button"
            className={styles.ctaBtn}
            onClick={() => navigate('/festival')}
          >
            <FiMap size={15} aria-hidden="true" />
            축제·체험 둘러보기
            <FiArrowRight size={14} aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
