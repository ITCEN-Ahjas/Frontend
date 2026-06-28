import { Link } from 'react-router-dom';
import styles from '../MainPage.module.css';

export default function MainFeatureStrip({ featureCards }) {
  return (
    <section className={styles.featureStrip} aria-label="주요 기능 바로가기">
      {featureCards.map(feature => (
        <Link key={feature.id} to={feature.href}>
          <span>{feature.label}</span>
          <strong>{feature.title}</strong>
        </Link>
      ))}
    </section>
  );
}
