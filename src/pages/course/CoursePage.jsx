import { useCallback, useMemo, useState } from 'react';
import { requestRouteRecommendation } from '../../api/routeRecommendationApi';
import CoursePlannerMap from './components/CoursePlannerMap';
import CoursePlannerTabs from './components/CoursePlannerTabs';
import CoursePreferenceForm from './components/CoursePreferenceForm';
import CourseStatusPanel from './components/CourseStatusPanel';
import { INITIAL_FORM } from './coursePlannerConfig';
import { normalizeRecommendation } from './courseRecommendationNormalizer';
import styles from './CoursePage.module.css';

export default function CoursePage() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [resultState, setResultState] = useState({
    status: 'idle',
    data: null,
    error: '',
  });

  const normalizedResult = useMemo(
    () => (resultState.data ? normalizeRecommendation(resultState.data) : null),
    [resultState.data],
  );

  const handleSelectPlace = useCallback(place => {
    setSelectedPlaceId(place?.placeId || null);
  }, []);

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

    setSelectedPlaceId(null);
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
          <CoursePreferenceForm
            formValues={formValues}
            isLoading={resultState.status === 'loading'}
            onChange={updateField}
            onSubmit={handleSubmit}
            onToggleInterest={toggleInterest}
          />
        </aside>

        <div className={styles.mapColumn}>
          <CoursePlannerMap
            result={normalizedResult}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />
        </div>

        <aside className={styles.resultColumn}>
          {normalizedResult ? (
            <CoursePlannerTabs
              result={normalizedResult}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handleSelectPlace}
            />
          ) : (
            <CourseStatusPanel status={resultState.status} error={resultState.error} />
          )}
        </aside>
      </div>
    </section>
  );
}
