import { FiMapPin } from 'react-icons/fi';
import styles from '../CoursePage.module.css';

export default function CourseStatusPanel({ status, error }) {
  if (status === 'loading') {
    return (
      <div className={styles.statusPanel} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <strong>AI가 충북 여행 코스를 구성하고 있습니다.</strong>
        <p>입력한 여행 조건을 바탕으로 일정, 날씨 고려사항, 대체 코스를 정리하는 중입니다.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.errorPanel} role="alert">
        <strong>추천 코스를 불러오지 못했습니다.</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.emptyPanel}>
      <FiMapPin aria-hidden="true" />
      <strong>여행 조건을 입력하면 AI 추천 코스가 표시됩니다.</strong>
      <p>추천 결과는 좌측 일정 패널과 우측 지도 영역에서 함께 확인할 수 있습니다.</p>
    </div>
  );
}
