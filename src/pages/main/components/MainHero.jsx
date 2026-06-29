import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { riseIn, softScaleIn } from '../../../shared/animation/pageMotion';
import styles from '../MainPage.module.css';

export default function MainHero({ heroImageSrc }) {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  function handleSearchSubmit(event) {
    event.preventDefault();

    const keyword = searchKeyword.trim();
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

    navigate(`/map${query}`);
  }

  return (
    <motion.div
      className={styles.heroCard}
      initial="hidden"
      animate="visible"
      variants={riseIn}
    >
      <motion.div className={styles.heroContent} variants={riseIn}>
        <h1>
          충북 여행을 <span>한눈에</span>
        </h1>
        <p>지도 검색부터 체험·축제, 숙박, AI 여행 추천까지 충북 여행을 쉽고 편리하게 계획해보세요.</p>

        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <label className={styles.searchLabel}>
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={searchKeyword}
              onChange={event => setSearchKeyword(event.target.value)}
              placeholder="어디로 떠나볼까요?"
              aria-label="충북 여행 검색어"
            />
          </label>
          <button type="submit">검색</button>
        </form>
      </motion.div>

      <motion.div className={styles.heroVisual} aria-label="충북 여행 대표 이미지" variants={softScaleIn}>
        <img src={heroImageSrc} alt="" className={styles.heroImage} />
      </motion.div>
    </motion.div>
  );
}
