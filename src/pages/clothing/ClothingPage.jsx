import { TRAVEL_STYLES, useOutfitRecommendation } from '../../hooks/useOutfitRecommendation';
import styles from './ClothingPage.module.css';

const OUTFIT_CARD_LABELS = [
  { key: 'outerwear', label: '아우터' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes', label: '신발' },
];

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) {
    return '업데이트 시간 정보 없음';
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export default function ClothingPage() {
  const {
    regions,
    selectedRegion,
    selectedTravelStyle,

    activeRecommendation,
    weatherRecommendation,
    recommendationsByStyle,

    isRegionsLoading,
    isRecommendationsLoading,

    regionsError,
    recommendationsError,

    selectRegion,
    selectTravelStyle,
    retryRegions,
    retryRecommendations,
  } = useOutfitRecommendation();

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div className={styles.content}>
          <h1>AI 옷차림 추천</h1>
          <p>선택한 충북 지역의 날씨와 체감온도를 분석해 여행에 맞는 옷차림을 추천합니다.</p>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.stateCard}>
          <h2>충북 여행 지역 선택</h2>
          <p className={styles.helperText}>여행할 충북 지역을 직접 선택해 주세요.</p>

          {isRegionsLoading && (
            <p className={styles.statusText}>충북 지역 목록을 불러오는 중입니다.</p>
          )}

          {regionsError && (
            <div className={styles.errorBox}>
              <p>{regionsError}</p>
              <button type="button" className={styles.retryButton} onClick={retryRegions}>
                다시 불러오기
              </button>
            </div>
          )}

          {!isRegionsLoading && !regionsError && (
            <div className={styles.buttonGroup}>
              {regions.map(region => (
                <button
                  key={region}
                  type="button"
                  className={[
                    styles.choiceButton,
                    selectedRegion === region ? styles.choiceButtonActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </section>

        {!selectedRegion && (
          <section className={styles.stateCard}>
            <h2>여행 지역을 선택해 주세요</h2>
            <p className={styles.helperText}>
              지역을 선택하면 6개 여행 스타일 추천을 한 번에 준비합니다.
            </p>
          </section>
        )}

        {selectedRegion && isRecommendationsLoading && (
          <section className={styles.stateCard}>
            <p className={styles.statusText}>
              {selectedRegion}의 6개 여행 스타일 추천을 준비하는 중입니다.
            </p>
          </section>
        )}

        {recommendationsError && (
          <section className={styles.errorBox}>
            <h2>일부 AI 옷차림 추천을 불러오지 못했습니다.</h2>
            <p>{recommendationsError}</p>
            <button type="button" className={styles.retryButton} onClick={retryRecommendations}>
              추천 다시 불러오기
            </button>
          </section>
        )}

        {weatherRecommendation && !isRecommendationsLoading && (
          <>
            <section className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>선택 지역 기준</p>
                  <h2>충북 {weatherRecommendation.region}</h2>
                </div>
                <p className={styles.updatedAt}>
                  {formatUpdatedAt(weatherRecommendation.updatedAt)} 업데이트
                </p>
              </div>

              <div className={styles.metricGrid}>
                <article className={styles.metricItem}>
                  <span>현재 기온</span>
                  <strong>{weatherRecommendation.currentWeather.temperature}°C</strong>
                </article>

                <article className={styles.metricItem}>
                  <span>체감온도</span>
                  <strong>
                    {weatherRecommendation.feelsLikeWeather.feelsLikeTemperature}
                    °C
                  </strong>
                </article>

                <article className={styles.metricItem}>
                  <span>습도</span>
                  <strong>{weatherRecommendation.currentWeather.humidity}%</strong>
                </article>

                <article className={styles.metricItem}>
                  <span>바람</span>
                  <strong>{weatherRecommendation.currentWeather.windStatus}</strong>
                </article>

                <article className={styles.metricItem}>
                  <span>강수 확률</span>
                  <strong>{weatherRecommendation.currentWeather.precipitationProbability}%</strong>
                </article>
              </div>

              <div className={styles.feelsLikeBox}>
                <h3>체감 날씨</h3>
                <p>
                  {weatherRecommendation.feelsLikeWeather.description ||
                    '현재 날씨 정보를 바탕으로 옷차림을 추천합니다.'}
                </p>
              </div>
            </section>

            <section className={styles.stateCard}>
              <h2>여행 스타일 선택</h2>
              <p className={styles.helperText}>
                여행 스타일을 선택하면 저장된 추천 결과가 바로 바뀝니다.
              </p>

              <div className={styles.buttonGroup}>
                {TRAVEL_STYLES.map(travelStyle => {
                  const isAvailable = Boolean(recommendationsByStyle[travelStyle]);

                  return (
                    <button
                      key={travelStyle}
                      type="button"
                      disabled={!isAvailable}
                      className={[
                        styles.choiceButton,
                        selectedTravelStyle === travelStyle ? styles.choiceButtonActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selectTravelStyle(travelStyle)}
                    >
                      {travelStyle}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeRecommendation && !isRecommendationsLoading && (
          <>
            <section className={styles.dataCard}>
              <h2>AI 추천 옷차림</h2>

              <div className={styles.outfitGrid}>
                {OUTFIT_CARD_LABELS.map(({ key, label }) => {
                  const outfit = activeRecommendation.outfitCards[key];

                  return (
                    <article key={key} className={styles.outfitCard}>
                      <span>{label}</span>
                      <h3>{outfit.name}</h3>
                      <p>{outfit.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.dataCard}>
              <h2>챙기면 좋은 준비물</h2>

              <div className={styles.preparationGrid}>
                {activeRecommendation.preparationItems.map(item => (
                  <article key={item.code} className={styles.preparationCard}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
