import { useState } from 'react';
import PageHero from '../../shared/components/common/PageHero';
import Pagination from '../../shared/components/common/Pagination';
import SectionHeader from '../../shared/components/common/SectionHeader';
import FestivalFilterPanel from './components/FestivalFilterPanel';
import FestivalList from './components/FestivalList';

const PREVIEW_FESTIVALS = [
  {
    id: '2858917',
    title: '보은 대추축제',
    region: '보은',
    category: '문화축제',
    status: '진행 중',
    startDate: '20241011',
    endDate: '20241020',
    address: '충청북도 보은군 보은읍 대추로 42',
    description: '보은 특산물인 대추를 주제로 한 지역 축제입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1524594154906-7fddc6d1b46f?auto=format&fit=crop&w=1200&q=80',
    tel: '043-123-4567',
  },
  {
    id: '2858918',
    title: '단양 패러글라이딩 체험',
    region: '단양',
    category: '액티비티',
    status: '상시 운영',
    startDate: '20240101',
    endDate: '20251231',
    address: '충청북도 단양군 단양읍 강변로 5',
    description: '단양의 산과 강에서 즐기는 스릴 넘치는 패러글라이딩 체험.',
    imageUrl:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    tel: '043-234-5678',
  },
  {
    id: '2858919',
    title: '청주 문화재 야행',
    region: '청주',
    category: '문화축제',
    status: '예정',
    startDate: '20240906',
    endDate: '20240908',
    address: '충청북도 청주시 흥덕구 문화로 10',
    description: '청주의 유서 깊은 문화재를 야간에 즐기는 특별한 행사입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80',
    tel: '043-345-6789',
  },
  {
    id: '2858920',
    title: '제천 국제음악영화제',
    region: '제천',
    category: '문화축제',
    status: '예정',
    startDate: '20240905',
    endDate: '20240910',
    address: '충청북도 제천시 청풍면 영화로 1',
    description: '국제 음악과 영화가 만나는 제천의 대표 문화 축제입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    tel: '043-456-7890',
  },
  {
    id: '2858921',
    title: '영동 와인축제',
    region: '영동',
    category: '먹거리',
    status: '진행 중',
    startDate: '20241003',
    endDate: '20241006',
    address: '충청북도 영동군 영동읍 와인길 88',
    description: '영동 특산 와인과 지역 먹거리를 함께 즐기는 축제입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb4f?auto=format&fit=crop&w=1200&q=80',
    tel: '043-567-8901',
  },
  {
    id: '2858922',
    title: '속리산 둘레길 걷기',
    region: '보은',
    category: '자연체험',
    status: '상시 운영',
    startDate: '20240101',
    endDate: '20251231',
    address: '충청북도 보은군 속리산면 둘레길 1',
    description: '속리산 둘레길을 따라 자연을 만끽하는 트레킹 코스.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    tel: '043-678-9012',
  },
  {
    id: '2858923',
    title: '충주 자유시장 야시장',
    region: '충주',
    category: '전통시장',
    status: '상시 운영',
    startDate: '20240101',
    endDate: '20251231',
    address: '충청북도 충주시 중앙탑면 시장로 44',
    description: '충주의 대표 시장에서 즐기는 야시장 먹거리와 문화.',
    imageUrl:
      'https://images.unsplash.com/photo-1514361892634-6c2b9c7d84ca?auto=format&fit=crop&w=1200&q=80',
    tel: '043-789-0123',
  },
  {
    id: '2858924',
    title: '옥천 금강 카누 · 카약 체험',
    region: '옥천',
    category: '액티비티',
    status: '상시 운영',
    startDate: '20240101',
    endDate: '20251231',
    address: '충청북도 옥천군 옥천읍 금강로 78',
    description: '금강 위에서 카누와 카약을 즐기는 수상 액티비티.',
    imageUrl:
      'https://images.unsplash.com/photo-1521302080396-0b30e12193e5?auto=format&fit=crop&w=1200&q=80',
    tel: '043-890-1234',
  },
];

export default function FestivalPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedRegion('전체');
    setSelectedCategory('전체');
    setCurrentPage(1);
  };

  const filteredFestivals = PREVIEW_FESTIVALS.filter(festival => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const keywordMatch =
      normalizedKeyword === '' ||
      [festival.title, festival.region, festival.category, festival.address, festival.description]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedKeyword));

    const regionMatch = selectedRegion === '전체' || festival.region === selectedRegion;
    const categoryMatch = selectedCategory === '전체' || festival.category === selectedCategory;

    return keywordMatch && regionMatch && categoryMatch;
  });

  return (
    <>
      <PageHero
        eyebrow="체험·축제"
        title="충북 축제·체험"
        description="충북의 다채로운 축제와 체험 프로그램을 찾아보세요."
        subDescription="Find festivals and local activities in Chungbuk."
      />

      <FestivalFilterPanel
        keyword={keyword}
        selectedRegion={selectedRegion}
        selectedCategory={selectedCategory}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
        onRegionChange={setSelectedRegion}
        onCategoryChange={setSelectedCategory}
        onReset={handleReset}
      />

      <SectionHeader
        eyebrow="진행 중인 프로그램"
        title="전체 축제 목록"
        rightText={`전체 ${filteredFestivals.length}건`}
      />

      <div className="mt-6">
        <FestivalList
          festivals={filteredFestivals}
          onClickDetail={id => console.log('상세보기', id)}
        />
      </div>

      <div className="mt-10 flex justify-center">
        <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
      </div>
    </>
  );
}
