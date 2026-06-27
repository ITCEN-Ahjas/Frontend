import { useMemo, useState } from 'react';
import { requestRouteRecommendation } from '../../api/routeRecommendationApi';
import styles from './CoursePage.module.css';

const REGION_OPTIONS = ['청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'];

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
    { value: 'low', label: '저예산' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '넉넉함' },
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
    time: item?.time || item?.startTime || item?.arrivalTime || `${String(9 + index).padStart(2, '0')}:00`,
    title: stringify(place) || `코스 ${index + 1}`,
    description: stringify(item?.description || item?.activity || item?.recommendationReason || item?.reason),
    weatherReason: stringify(item?.weatherReason || item?.weatherReflectionReason || item?.weatherNote),
    moveTip: stringify(item?.moveTip || item?.transportTip || item?.travelTip),
  };
}

function normalizeRecommendation(response) {
  return {
    summary: stringify(response?.summary) || '추천 요약이 없습니다.',
    itinerary: asArray(response?.itinerary).map(normalizeItineraryItem),
    planB: asArray(response?.planB),
    weatherNotes: asArray(response?.weatherNotes),
  };
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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>AI ROUTE RECOMMENDATION</p>
            <h1>날씨와 장소 후보를 반영한 AI 여행 추천</h1>
            <p>
              지역, 관심사, 동행 형태, 이동 조건을 입력하면 기존 날씨/장소 데이터를 AI 요청 형식으로
              변환해 시간대별 여행 동선을 추천합니다.
            </p>
          </div>

          <div className={styles.heroPanel} aria-label="추천 요청 구성">
            <div className={styles.metric}>
              <span>요청 API</span>
              <strong>POST /api/v1/recommend/routes</strong>
            </div>
            <div className={styles.metric}>
              <span>날씨 데이터</span>
              <strong>weatherTimeline 변환</strong>
            </div>
            <div className={styles.metric}>
              <span>장소 데이터</span>
              <strong>candidatePlaces 변환</strong>
            </div>
            <div className={styles.metric}>
              <span>결과 화면</span>
              <strong>요약, 동선, 플랜B</strong>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <form className={styles.formPanel} onSubmit={handleSubmit}>
          <div className={styles.panelHeader}>
            <h2>AI 코스 추천 입력</h2>
            <p>추천 API에 필요한 여행 조건을 입력하세요.</p>
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
                    {option.label}
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
              <input
                id="travelDate"
                name="travelDate"
                type="date"
                value={formValues.travelDate}
                onChange={updateField}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="startTime">시작 시간</label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={formValues.startTime}
                onChange={updateField}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="endTime">종료 시간</label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={formValues.endTime}
                onChange={updateField}
              />
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
            {resultState.status === 'loading' ? 'AI 추천 생성 중' : 'AI 코스 추천 받기'}
          </button>
        </form>

        <section className={styles.resultPanel} aria-live="polite">
          {resultState.status === 'idle' && (
            <div className={styles.emptyBox}>
              폼을 입력하고 추천을 요청하면 추천 요약, 날씨 주의사항, 시간대별 여행 동선, 이동 팁,
              플랜B가 여기에 표시됩니다.
            </div>
          )}

          {resultState.status === 'loading' && (
            <div className={styles.statusBox}>
              날씨 데이터와 후보 장소를 AI 요청 형식으로 변환한 뒤 추천 API를 호출하고 있습니다.
            </div>
          )}

          {resultState.status === 'error' && <div className={styles.errorBox}>{resultState.error}</div>}

          {normalizedResult && (
            <div className={styles.resultStack}>
              <section className={styles.sectionCard}>
                <h2>추천 요약</h2>
                <p>{normalizedResult.summary}</p>
              </section>

              <section className={styles.sectionCard}>
                <h2>날씨 주의사항</h2>
                {normalizedResult.weatherNotes.length > 0 ? (
                  <ul className={styles.noteList}>
                    {normalizedResult.weatherNotes.map((note, index) => (
                      <li key={`${stringify(note)}-${index}`}>{stringify(note)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>별도 날씨 주의사항이 없습니다.</p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h2>시간대별 여행 동선</h2>
                {normalizedResult.itinerary.length > 0 ? (
                  <div className={styles.timeline}>
                    {normalizedResult.itinerary.map((item, index) => (
                      <article key={`${item.time}-${item.title}-${index}`} className={styles.timelineItem}>
                        <div className={styles.time}>{item.time}</div>
                        <div className={styles.timelineBody}>
                          <h3>{item.title}</h3>
                          {item.description && <p>{item.description}</p>}
                          <div className={styles.tagRow}>
                            {item.weatherReason && (
                              <span className={styles.tag}>날씨 반영: {item.weatherReason}</span>
                            )}
                            {item.moveTip && <span className={styles.tag}>이동 팁: {item.moveTip}</span>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>시간대별 동선이 응답에 포함되지 않았습니다.</p>
                )}
              </section>

              <section className={styles.sectionCard}>
                <h2>플랜B</h2>
                {normalizedResult.planB.length > 0 ? (
                  <ul className={styles.planList}>
                    {normalizedResult.planB.map((item, index) => (
                      <li key={`${stringify(item)}-${index}`}>{stringify(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>대체 코스가 응답에 포함되지 않았습니다.</p>
                )}
              </section>

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
