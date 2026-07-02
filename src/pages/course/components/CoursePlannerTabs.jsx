import { useState } from 'react';
import { TAB_ITEMS } from '../coursePlannerConfig';
import {
  groupItineraryByDay,
  stringify,
} from '../courseRecommendationNormalizer';
import styles from '../CoursePage.module.css';

function SummaryTab({ result }) {
  return (
    <div className={styles.tabContent}>
      <section className={styles.summaryBox}>
        <h3>{result.overviewTitle || '추천 요약'}</h3>
        <p>{result.summary}</p>
        {result.styleTags.length > 0 && (
          <div className={styles.styleTagList}>
            {result.styleTags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
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
        <div>
          <span>추천 장소</span>
          <strong>{result.totalPlaces}곳</strong>
        </div>
        <div>
          <span>날씨 반영</span>
          <strong>{result.weatherSummary || '일정별 안내 확인'}</strong>
        </div>
      </div>

      <section className={styles.weatherBox}>
        <h3>날씨 주의사항</h3>
        {result.weatherNotes.length > 0 ? (
          <ul>
            {result.weatherNotes.map((note, index) => (
              <li key={`${stringify(note)}-${index}`}>
                {typeof note === 'object' && note !== null ? (
                  <>
                    <strong>{stringify(note.timeRange) || '여행 시간대'}</strong>
                    <span>{stringify(note.summary) || stringify(note)}</span>
                  </>
                ) : (
                  stringify(note)
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>현재 응답에 별도 날씨 주의사항이 포함되지 않았습니다.</p>
        )}
      </section>
    </div>
  );
}

function getPlacePlanBOptions(result, place) {
  return result.planBOptions.filter(option => {
    if (!option.replaceFrom) {
      return false;
    }

    return (
      option.replaceFrom === place.title ||
      option.replaceFrom === place.placeId ||
      place.title.includes(option.replaceFrom) ||
      option.replaceFrom.includes(place.title)
    );
  });
}

function ItineraryTab({ result, selectedPlaceId, onSelectPlace }) {
  const dayEntries = Object.entries(groupItineraryByDay(result.itinerary));

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
            {items.map((item, index) => {
              const isSelected = selectedPlaceId === item.placeId;
              const placePlanBOptions = getPlacePlanBOptions(result, item);

              return (
                <button
                  key={`${day}-${item.placeId}-${index}`}
                  type="button"
                  className={isSelected ? styles.selectedPlaceItem : styles.placeItem}
                  onClick={() => onSelectPlace(item)}
                >
                  <span className={styles.placeOrder}>{item.order}</span>
                  <span className={styles.placeBody}>
                    {item.imageUrl && (
                      <span className={styles.placeImageBox}>
                        <img src={item.imageUrl} alt="" loading="lazy" />
                      </span>
                    )}
                    <span className={styles.placeMeta}>
                      <span>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.time}</span>
                      <span>{item.category}</span>
                    </span>
                    <strong>{item.title}</strong>
                    {item.address && <span className={styles.address}>{item.address}</span>}
                    <span className={styles.reasonPanel}>
                      <span>
                        <b>추천 이유</b>
                        {item.description || '추천 이유가 응답에 포함되지 않았습니다.'}
                      </span>
                      <span>
                        <b>날씨 반영</b>
                        {item.weatherReason || '날씨 반영 이유가 응답에 포함되지 않았습니다.'}
                      </span>
                    </span>
                    {(item.moveTip || placePlanBOptions.length > 0) && (
                      <span className={styles.reasonList}>
                        {item.moveTip && <span>이동 팁: {item.moveTip}</span>}
                        {placePlanBOptions.map(option => (
                          <span key={option.id}>
                            대체 코스: {option.replaceTo || option.reason}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CoursePlannerTabs({ result, selectedPlaceId, onSelectPlace }) {
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
      {activeTab === 'itinerary' && (
        <ItineraryTab
          result={result}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={onSelectPlace}
        />
      )}
    </section>
  );
}
