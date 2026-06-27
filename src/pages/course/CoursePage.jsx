import { useMemo, useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiCloud,
  FiMap,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
} from 'react-icons/fi';
import { requestRouteRecommendation } from '../../api/routeRecommendationApi';
import styles from './CoursePage.module.css';

const REGION_OPTIONS = [
  '청주',
  '충주',
  '제천',
  '보은',
  '옥천',
  '영동',
  '증평',
  '진천',
  '괴산',
  '음성',
  '단양',
];

const INTEREST_OPTIONS = [
  { value: 'nature', label: '자연' },
  { value: 'history', label: '역사' },
  { value: 'culture', label: '문화' },
  { value: 'food', label: '맛집' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'healing', label: '힐링' },
];

const SELECT_OPTIONS = {
  companionType: [
    { value: 'solo', label: '혼자' },
    { value: 'couple', label: '연인' },
    { value: 'family', label: '가족' },
    { value: 'friends', label: '친구' },
  ],
  budget: [
    { value: 'low', label: '절약' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '여유' },
  ],
  activityIntensity: [
    { value: 'low', label: '여유롭게' },
    { value: 'medium', label: '적당히' },
    { value: 'high', label: '활동적으로' },
  ],
  transportMode: [
    { value: 'walk', label: '도보' },
    { value: 'publicTransit', label: '대중교통' },
    { value: 'car', label: '차량' },
  ],
};

const TAB_ITEMS = [
  { id: 'summary', label: '여행 요약', icon: FiMap },
  { id: 'itinerary', label: '세부 일정', icon: FiNavigation },
  { id: 'articles', label: '연관 기사', icon: FiCloud },
  { id: 'talk', label: '여행톡', icon: FiMessageCircle },
];

const INITIAL_FORM = {
  region: '청주',
  interests: ['nature'],
  companionType: 'friends',
  budget: 'medium',
  activityIntensity: 'medium',
  transportMode: 'car',
  travelDate: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '18:00',
  startLocation: '청주 시외버스터미널',
  endLocation: '청주 시외버스터미널',
};

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function stringify(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(stringify).filter(Boolean).join(', ');
  }

  if (typeof value === 'object') {
    return value.reason || value.description || value.name || value.title || JSON.stringify(value);
  }

  return String(value);
}

function normalizeItineraryItem(item, index) {
  const place = item?.place || item?.placeName || item?.name || item?.title;

  return {
    order: Number(item?.order) || index + 1,
    day: Number(item?.day) || 1,
    time: item?.time || item?.startTime || item?.arrivalTime || `${String(9 + index).padStart(2, '0')}:00`,
    title: stringify(place) || `추천 장소 ${index + 1}`,
    category: stringify(item?.category) || '추천 장소',
    address: stringify(item?.address),
    description: stringify(item?.description || item?.activity || item?.recommendationReason || item?.reason),
    weatherReason: stringify(item?.weatherReason || item?.weatherReflectionReason || item?.weatherNote),
    moveTip: stringify(item?.moveTip || item?.transportTip || item?.travelTip),
  };
}

function normalizeRecommendation(response) {
  const itinerary = asArray(response?.itinerary || response?.days?.flatMap(day => day?.places || []))
    .map(normalizeItineraryItem);

  return {
    summary: stringify(response?.summary) || '추천 요약이 아직 제공되지 않았습니다.',
    totalDistance: stringify(response?.totalDistance || response?.distance) || '계산 예정',
    totalDuration: stringify(response?.totalDuration || response?.duration) || '계산 예정',
    itinerary,
    planB: asArray(response?.planB || response?.alternatives),
    weatherNotes: asArray(response?.weatherNotes || response?.weatherWarnings),
  };
}

function groupItineraryByDay(items) {
  return items.reduce((groups, item) => {
    const dayKey = `Day ${item.day}`;

    return {
      ...groups,
      [dayKey]: [...(groups[dayKey] || []), item],
    };
  }, {});
}

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} value={value} onChange={onChange}>
        {options.map(option => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusPanel({ status, error }) {
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

function SummaryTab({ result }) {
  return (
    <div className={styles.tabContent}>
      <section className={styles.summaryBox}>
        <h3>추천 요약</h3>
        <p>{result.summary}</p>
      </section>

      <div className={styles.summaryStats}>
        <div>
          <span>총 이동거리</span>
          <strong>{result.totalDistance}</strong>
        </div>
        <div>
          <span>예상 소요시간</span>
          <strong>{result.totalDuration}</strong>
        </div>
      </div>

      <section className={styles.weatherBox}>
        <h3>날씨 주의사항</h3>
        {result.weatherNotes.length > 0 ? (
          <ul>
            {result.weatherNotes.map((note, index) => (
              <li key={`${stringify(note)}-${index}`}>{stringify(note)}</li>
            ))}
          </ul>
        ) : (
          <p>현재 응답에 별도 날씨 주의사항이 포함되지 않았습니다.</p>
        )}
      </section>
    </div>
  );
}

function ItineraryTab({ result }) {
  const groupedItems = groupItineraryByDay(result.itinerary);
  const dayEntries = Object.entries(groupedItems);

  if (dayEntries.length === 0) {
    return (
      <div className={styles.emptyPanel}>
        <strong>세부 일정이 아직 없습니다.</strong>
        <p>추천 응답에 일정 데이터가 포함되면 Day별 코스로 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.dayList}>
      {dayEntries.map(([day, items]) => (
        <section key={day} className={styles.daySection}>
          <h3>{day}</h3>
          <div className={styles.placeList}>
            {items.map((item, index) => (
              <article key={`${day}-${item.title}-${index}`} className={styles.placeItem}>
                <div className={styles.placeOrder}>{item.order}</div>
                <div className={styles.placeBody}>
                  <div className={styles.placeMeta}>
                    <span>{item.time}</span>
                    <span>{item.category}</span>
                  </div>
                  <h4>{item.title}</h4>
                  {item.address && <p className={styles.address}>{item.address}</p>}
                  {item.description && <p>{item.description}</p>}
                  <div className={styles.reasonList}>
                    {item.weatherReason && <span>날씨 반영: {item.weatherReason}</span>}
                    {item.moveTip && <span>이동 팁: {item.moveTip}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ArticlesTab({ result }) {
  return (
    <div className={styles.infoStack}>
      <section className={styles.infoNotice}>
        <h3>연관 기사</h3>
        <p>추천된 장소와 지역 정보를 연결해 보여줄 영역입니다. 현재 커밋에서는 탭 구조만 준비했습니다.</p>
      </section>
      {result.weatherNotes.slice(0, 2).map((note, index) => (
        <article key={`${stringify(note)}-${index}`} className={styles.infoItem}>
          <span>날씨 기반 참고</span>
          <strong>{stringify(note)}</strong>
        </article>
      ))}
    </div>
  );
}

function TalkTab({ result }) {
  return (
    <div className={styles.infoStack}>
      <section className={styles.infoNotice}>
        <h3>여행톡</h3>
        <p>여행자가 코스 선택 전에 확인할 수 있는 짧은 안내와 대체 코스를 모아 보여줍니다.</p>
      </section>
      {result.planB.length > 0 ? (
        result.planB.map((item, index) => (
          <article key={`${stringify(item)}-${index}`} className={styles.infoItem}>
            <span>대체 코스 {index + 1}</span>
            <strong>{stringify(item)}</strong>
          </article>
        ))
      ) : (
        <article className={styles.infoItem}>
          <span>대체 코스</span>
          <strong>응답에 대체 코스가 포함되면 이 영역에 표시됩니다.</strong>
        </article>
      )}
    </div>
  );
}

function PlannerTabs({ result }) {
  const [activeTab, setActiveTab] = useState('summary');
  const activeItem = TAB_ITEMS.find(item => item.id === activeTab) || TAB_ITEMS[0];

  return (
    <section className={styles.resultPanel}>
      <div className={styles.resultHeader}>
        <span>AI 추천 결과</span>
        <h2>{activeItem.label}</h2>
      </div>

      <div className={styles.tabList} role="tablist" aria-label="AI 추천 코스 정보">
        {TAB_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? styles.activeTabButton : styles.tabButton}
              onClick={() => setActiveTab(item.id)}
              role="tab"
              aria-selected={isActive}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'summary' && <SummaryTab result={result} />}
      {activeTab === 'itinerary' && <ItineraryTab result={result} />}
      {activeTab === 'articles' && <ArticlesTab result={result} />}
      {activeTab === 'talk' && <TalkTab result={result} />}
    </section>
  );
}

function PlannerMapPreview({ result }) {
  const places = result?.itinerary || [];

  return (
    <section className={styles.mapPanel} aria-label="AI 추천 코스 지도">
      <div className={styles.mapToolbar}>
        <div>
          <span>Route Map</span>
          <strong>{places.length > 0 ? `${places.length}개 추천 지점` : '추천 지점 대기 중'}</strong>
        </div>
        <button type="button" disabled>
          <FiMap aria-hidden="true" />
          지도 연결 준비
        </button>
      </div>

      <div className={styles.mapCanvas}>
        <div className={styles.mapGrid} aria-hidden="true" />
        <div className={styles.routePreview}>
          {places.slice(0, 5).map((place, index) => (
            <div
              key={`${place.title}-${index}`}
              className={styles.routePoint}
              style={{
                left: `${18 + (index % 3) * 27}%`,
                top: `${22 + Math.floor(index / 3) * 33 + (index % 2) * 8}%`,
              }}
            >
              <span>{index + 1}</span>
              <strong>{place.title}</strong>
            </div>
          ))}
        </div>

        <div className={styles.mapEmptyText}>
          <FiMapPin aria-hidden="true" />
          <strong>다음 커밋에서 Google Map 마커와 동선을 연결합니다.</strong>
          <p>이번 커밋에서는 예시 화면 방향에 맞춰 지도형 플래너 레이아웃을 먼저 구성했습니다.</p>
        </div>
      </div>
    </section>
  );
}

export default function CoursePage() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [resultState, setResultState] = useState({
    status: 'idle',
    data: null,
    error: '',
  });

  const normalizedResult = useMemo(
    () => (resultState.data ? normalizeRecommendation(resultState.data) : null),
    [resultState.data],
  );

  function updateField(event) {
    const { name, value } = event.target;

    setFormValues(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleInterest(event) {
    const { value, checked } = event.target;

    setFormValues(previous => {
      const nextInterests = checked
        ? Array.from(new Set([...previous.interests, value]))
        : previous.interests.filter(interest => interest !== value);

      return {
        ...previous,
        interests: nextInterests.length > 0 ? nextInterests : [value],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setResultState(previous => ({
      ...previous,
      status: 'loading',
      error: '',
    }));

    try {
      const recommendation = await requestRouteRecommendation(formValues);

      setResultState({
        status: 'success',
        data: recommendation,
        error: '',
      });
    } catch (error) {
      setResultState(previous => ({
        ...previous,
        status: 'error',
        error: error instanceof Error ? error.message : 'AI 코스 추천 요청에 실패했습니다.',
      }));
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <form className={styles.formPanel} onSubmit={handleSubmit}>
            <div className={styles.panelHeader}>
              <p>AI ROUTE PLANNER</p>
              <h1>충북 여행 코스 만들기</h1>
              <span>여행 조건을 입력하면 날씨와 장소 정보를 반영한 코스를 추천합니다.</span>
            </div>

            <div className={styles.fieldGrid}>
              <SelectField
                id="region"
                label="지역"
                value={formValues.region}
                options={REGION_OPTIONS}
                onChange={updateField}
              />

              <div className={styles.fullField}>
                <label>관심사</label>
                <div className={styles.checkboxGroup}>
                  {INTEREST_OPTIONS.map(option => (
                    <label key={option.value} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formValues.interests.includes(option.value)}
                        onChange={toggleInterest}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <SelectField
                id="companionType"
                label="동행 형태"
                value={formValues.companionType}
                options={SELECT_OPTIONS.companionType}
                onChange={updateField}
              />

              <SelectField
                id="budget"
                label="예산"
                value={formValues.budget}
                options={SELECT_OPTIONS.budget}
                onChange={updateField}
              />

              <SelectField
                id="activityIntensity"
                label="활동 강도"
                value={formValues.activityIntensity}
                options={SELECT_OPTIONS.activityIntensity}
                onChange={updateField}
              />

              <SelectField
                id="transportMode"
                label="이동수단"
                value={formValues.transportMode}
                options={SELECT_OPTIONS.transportMode}
                onChange={updateField}
              />

              <div className={styles.field}>
                <label htmlFor="travelDate">여행 날짜</label>
                <div className={styles.iconInput}>
                  <FiCalendar aria-hidden="true" />
                  <input
                    id="travelDate"
                    name="travelDate"
                    type="date"
                    value={formValues.travelDate}
                    onChange={updateField}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="startTime">시작 시간</label>
                <div className={styles.iconInput}>
                  <FiClock aria-hidden="true" />
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formValues.startTime}
                    onChange={updateField}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="endTime">종료 시간</label>
                <div className={styles.iconInput}>
                  <FiClock aria-hidden="true" />
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formValues.endTime}
                    onChange={updateField}
                  />
                </div>
              </div>

              <div className={styles.fullField}>
                <label htmlFor="startLocation">시작 위치</label>
                <input
                  id="startLocation"
                  name="startLocation"
                  value={formValues.startLocation}
                  onChange={updateField}
                  placeholder="예: 청주 시외버스터미널"
                />
              </div>

              <div className={styles.fullField}>
                <label htmlFor="endLocation">종료 위치</label>
                <input
                  id="endLocation"
                  name="endLocation"
                  value={formValues.endLocation}
                  onChange={updateField}
                  placeholder="예: 청주 시외버스터미널"
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={resultState.status === 'loading'}
            >
              {resultState.status === 'loading' ? 'AI 코스 생성 중' : 'AI 코스 추천 받기'}
            </button>
          </form>

          {normalizedResult ? (
            <PlannerTabs result={normalizedResult} />
          ) : (
            <StatusPanel status={resultState.status} error={resultState.error} />
          )}
        </aside>

        <div className={styles.mapColumn}>
          <PlannerMapPreview result={normalizedResult} />
        </div>
      </div>
    </section>
  );
}
