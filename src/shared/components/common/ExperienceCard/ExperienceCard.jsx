import { useState } from 'react';
import styles from './ExperienceCard.module.css';

function getBadgeClass(variant) {
  if (variant === 'category') {
    return styles.badgeCategory;
  }

  if (variant === 'dark') {
    return styles.badgeDark;
  }

  return styles.badgeStatus;
}

export default function ExperienceCard({
  imageUrl,
  title,
  region,
  description,
  period,
  tel,
  badges = [],
  onClick,
}) {
  const [failedImage, setFailedImage] = useState('');
  const showImage = imageUrl && failedImage !== imageUrl;

  return (
    <article className={styles.card}>
      <div className={styles.imageBox}>
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className={styles.image}
            onError={() => setFailedImage(imageUrl)}
          />
        ) : (
          <div className={styles.fallbackImage}>CHUNGBUK</div>
        )}

        {badges.length > 0 && (
          <div className={styles.badgeGroup}>
            {badges.map((badge, index) => (
              <span
                key={`${badge.label}-${index}`}
                className={`${styles.badge} ${getBadgeClass(badge.variant)}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {region && (
          <p className={styles.region}>
            <span aria-hidden="true">📍</span>
            {region}
          </p>
        )}

        <h3 className={styles.title}>{title}</h3>

        <p className={styles.description}>{description}</p>

        <div className={styles.metaList}>
          {period && (
            <div className={styles.metaItem}>
              <span aria-hidden="true">🗓️</span>
              <span>{period}</span>
            </div>
          )}

          {tel && (
            <div className={styles.metaItem}>
              <span aria-hidden="true">☎️</span>
              <span>{tel}</span>
            </div>
          )}
        </div>

        <button type="button" onClick={onClick} className={styles.actionButton}>
          상세보기
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </article>
  );
}
