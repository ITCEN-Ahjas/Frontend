import Card from '../../../shared/components/common/Card';

function formatDate(dateString) {
  if (!dateString || dateString.length !== 8) {
    return dateString || '-';
  }

  return `${dateString.slice(0, 4)}.${dateString.slice(4, 6)}.${dateString.slice(6, 8)}`;
}

export default function FestivalList({ festivals, onClickDetail }) {
  if (!festivals || festivals.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4 xl:gap-8">
      {festivals.map(festival => {
        const period = `${formatDate(festival.startDate)} - ${formatDate(festival.endDate)}`;

        return (
          <Card
            key={festival.id}
            imageUrl={festival.imageUrl}
            imageAlt={festival.title}
            badges={[
              { label: festival.status ?? '진행 중', variant: 'status' },
              { label: festival.category ?? '카테고리', variant: 'category' },
            ]}
            title={festival.title}
            subtitle={festival.region}
            description={festival.description ?? festival.address}
            metaItems={[
              { label: '기간', value: period },
              { label: '문의', value: festival.tel ?? '-' },
            ]}
            actionLabel="상세보기"
            onAction={() => onClickDetail?.(festival.id)}
          />
        );
      })}
    </div>
  );
}
