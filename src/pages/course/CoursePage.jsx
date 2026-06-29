import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { requestRouteRecommendation } from '../../api/routeRecommendationApi';
import { listStagger, pageFade, riseIn } from '../../shared/animation/pageMotion';
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
    <motion.section
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={pageFade}
    >
      <section className={styles.hero}>
        <motion.div className={styles.heroInner} variants={riseIn}>
          <motion.div className={styles.heroText} variants={riseIn}>
            <h1 className={styles.heroTitle}>AI 여행 코스 추천</h1>
            <p className={styles.heroDescription}>
              취향과 일정에 맞춰 충북 여행 코스를 추천받아보세요.
            </p>
            <p className={styles.heroSubDescription}>Build a Chungbuk route with AI recommendations.</p>
          </motion.div>
        </motion.div>
      </section>

      <motion.div className={styles.content} variants={listStagger}>
        <motion.aside className={styles.sidebar} variants={riseIn}>
          <CoursePreferenceForm
            formValues={formValues}
            isLoading={resultState.status === 'loading'}
            onChange={updateField}
            onSubmit={handleSubmit}
            onToggleInterest={toggleInterest}
          />
        </motion.aside>

        <motion.div className={styles.mapColumn} variants={riseIn}>
          <CoursePlannerMap
            result={normalizedResult}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />
        </motion.div>

        <motion.aside className={styles.resultColumn} variants={riseIn}>
          {normalizedResult ? (
            <CoursePlannerTabs
              result={normalizedResult}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handleSelectPlace}
            />
          ) : (
            <CourseStatusPanel status={resultState.status} error={resultState.error} />
          )}
        </motion.aside>
      </motion.div>
    </motion.section>
  );
}
