import { FiCalendar, FiClock } from 'react-icons/fi';
import {
  INTEREST_OPTIONS,
  REGION_OPTIONS,
  SELECT_OPTIONS,
} from '../coursePlannerConfig';
import styles from '../CoursePage.module.css';

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

export default function CoursePreferenceForm({
  formValues,
  isLoading,
  onChange,
  onSubmit,
  onToggleInterest,
}) {
  return (
    <form className={styles.formPanel} onSubmit={onSubmit}>
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
          onChange={onChange}
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
                  onChange={onToggleInterest}
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
          onChange={onChange}
        />

        <SelectField
          id="budget"
          label="예산"
          value={formValues.budget}
          options={SELECT_OPTIONS.budget}
          onChange={onChange}
        />

        <SelectField
          id="activityIntensity"
          label="활동 강도"
          value={formValues.activityIntensity}
          options={SELECT_OPTIONS.activityIntensity}
          onChange={onChange}
        />

        <SelectField
          id="transportMode"
          label="이동수단"
          value={formValues.transportMode}
          options={SELECT_OPTIONS.transportMode}
          onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
            />
          </div>
        </div>

        <div className={styles.fullField}>
          <label htmlFor="startLocation">시작 위치</label>
          <input
            id="startLocation"
            name="startLocation"
            value={formValues.startLocation}
            onChange={onChange}
            placeholder="예: 청주 시외버스터미널"
          />
        </div>

        <div className={styles.fullField}>
          <label htmlFor="endLocation">종료 위치</label>
          <input
            id="endLocation"
            name="endLocation"
            value={formValues.endLocation}
            onChange={onChange}
            placeholder="예: 청주 시외버스터미널"
          />
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'AI 코스 생성 중' : 'AI 코스 추천 받기'}
      </button>
    </form>
  );
}
