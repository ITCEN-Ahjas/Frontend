import { motion } from 'framer-motion';
import { riseIn } from '../../../../shared/animation/pageMotion';
import styles from './FestivalHero.module.css';

export default function FestivalHero() {
  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.inner}
        initial="hidden"
        animate="visible"
        variants={riseIn}
      >
        <motion.div className={styles.text} variants={riseIn}>
          <h1 className={styles.title}>충북 축제·체험</h1>
          <p className={styles.description}>충북의 다채로운 축제와 체험 프로그램을 찾아보세요.</p>
          <p className={styles.subDescription}>Find festivals and local activities in Chungbuk.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
