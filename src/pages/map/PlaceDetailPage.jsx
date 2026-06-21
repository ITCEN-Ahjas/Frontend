import { Link, useParams } from 'react-router-dom';
import styles from './PlaceDetailPage.module.css';

export default function PlaceDetailPage() {
  const { placeId } = useParams();

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <Link to="/map" className={styles.backLink}>
          지도 검색으로 돌아가기
        </Link>

        <div className={styles.placeholder}>
          <p className={styles.kicker}>PLACE DETAIL</p>
          <h1>장소 상세 정보</h1>
          <p>선택한 장소의 상세 정보를 불러올 준비가 완료되었습니다.</p>
          <span>{placeId}</span>
        </div>
      </div>
    </section>
  );
}
