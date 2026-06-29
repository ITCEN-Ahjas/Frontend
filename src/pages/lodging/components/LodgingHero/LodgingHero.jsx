import { motion } from 'framer-motion';
import { riseIn } from '../../../../shared/animation/pageMotion';
import styles from './LodgingHero.module.css';

export default function LodgingHero() {
  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.inner}
        initial="hidden"
        animate="visible"
        variants={riseIn}
      >
        <motion.div className={styles.text} variants={riseIn}>
          <h1 className={styles.title}>충북 숙박</h1>
          <p className={styles.description}>충북 곳곳의 숙소 정보를 한눈에 비교해 보세요.</p>
          <p className={styles.subDescription}>Find places to stay in Chungbuk.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
