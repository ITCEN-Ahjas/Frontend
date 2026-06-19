import styles from './SelectedPlaceCard.module.css';

export default function SelectedPlaceCard({ place, onClear }) {
  if (!place) {
    return null;
  }

  return (
    <aside className={styles.card} aria-live="polite">
      <div className={styles.content}>
        <span className={styles.badge}>선택한 목적지</span>
        <h3>{place.name || '이름 없는 장소'}</h3>
        <p>{place.address || '주소 정보 없음'}</p>
      </div>

      <div className={styles.actions}>
        <span>다음 단계에서 길찾기를 연결합니다.</span>
        <button type="button" onClick={onClear}>
          선택 취소
        </button>
      </div>
    </aside>
  );
}
