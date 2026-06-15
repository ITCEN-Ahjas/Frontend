import ExperienceCard from '../../../../shared/components/common/ExperienceCard';
import { formatPeriod } from '../../utils/festivalFormat';
import styles from './FestivalGrid.module.css';

export default function FestivalGrid({ festivals, onClickDetail }) {
  return (
    <div className={styles.grid}>
      {festivals.map(item => (
        <ExperienceCard
          key={item.id}
          imageUrl={item.imageUrl}
          title={item.title}
          region={item.region}
          description={item.description}
          period={formatPeriod(item.startDate, item.endDate)}
          tel={item.tel}
          badges={[
            { label: item.status, variant: 'status' },
            { label: item.category, variant: 'category' },
          ]}
          onClick={() => onClickDetail(item.id)}
        />
      ))}
    </div>
  );
}
