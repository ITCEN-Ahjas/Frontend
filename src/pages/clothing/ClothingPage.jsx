import { TRAVEL_STYLES, useOutfitRecommendation } from '../../hooks/useOutfitRecommendation';
import styles from './ClothingPage.module.css';

const OUTFIT_CARD_LABELS = [
  { key: 'outerwear', label: '아우터' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes', label: '신발' },
];

const TRAVEL_STYLE_META = {
  '기본 추천': { icon: '♟', label: '기본 추천' },
  '많이 걷는 여행': { icon: '⌁', label: '많이 걷는 여행' },
  '야외 활동': { icon: '△', label: '야외 활동' },
  '실내 중심': { icon: '⌂', label: '실내 중심' },
  '야간 일정': { icon: '☾', label: '야간 일정' },
  '비 오는 날 대비': { icon: '☂', label: '비 오는 날 대비' },
};

function formatTemperature(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '-';
  }

  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) {
    return '업데이트 시간 정보 없음';
  }

  const time = String(updatedAt).split('T')[1];

  if (!time) {
    return updatedAt;
  }

  return `${time.slice(0, 5)} 업데이트`;
}

function getWeatherSymbol(weatherCondition) {
  const condition = String(weatherCondition || '');

  if (condition.includes('눈')) {
    return '❄';
  }

  if (condition.includes('비') || condition.includes('소나기')) {
    return '☂';
  }

  if (condition.includes('맑음')) {
    return '☀';
  }

  return '☁';
}

function getPreparationSymbol(code) {
  const symbolMap = {
    umbrella: '☂',
    waterproof_pouch: '▣',
    extra_socks: '⌁',
    light_outerwear: '♧',
    warm_accessory: '✳',
    hot_pack: '◉',
    water_bottle: '▯',
    thermal_bottle: '▯',
    battery: '▰',
    sunscreen: '☀',
    hat: '⌒',
    insect_repellent: '✦',
    portable_fan: '◌',
  };

  return symbolMap[code] || '✦';
}

function OutfitIllustration({ type }) {
  if (type === 'outerwear') {
    return (
      <svg viewBox="0 0 180 160" aria-hidden="true">
        <path
          d="M57 46 76 30h28l19 16 22 20-15 24-14-8v61H64V82l-14 8-15-24 22-20Z"
          fill="currentColor"
        />
        <path
          d="M90 31v112M64 67l26 25 26-25"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (type === 'top') {
    return (
      <svg viewBox="0 0 180 160" aria-hidden="true">
        <path
          d="m62 35 18-10h20l18 10 27 16-14 28-18-8v69H67V71l-18 8-14-28 27-16Z"
          fill="currentColor"
        />
        <path
          d="M80 25c0 13 20 13 20 0"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (type === 'bottom') {
    return (
      <svg viewBox="0 0 180 160" aria-hidden="true">
        <path d="M58 25h64l9 112h-31l-10-61-10 61H49l9-112Z" fill="currentColor" />
        <path
          d="M61 44h58M90 44v32"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 160" aria-hidden="true">
      <path
        d="M35 105c20-1 36-13 48-34l20 12c14 9 26 17 42 18 8 1 12 5 12 13v13H35v-22Z"
        fill="currentColor"
      />
      <path
        d="M47 108h97M61 117h16m8 0h16m8 0h16"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function HeroArtwork() {
  return (
    <svg className={styles.heroArtwork} viewBox="0 0 760 330" aria-hidden="true">
      <path d="M0 255 105 178l90 58 118-96 119 84 101-70 127 101H0Z" fill="#dcebdc" />
      <path d="M0 274 101 221l91 42 115-56 116 44 104-45 133 68H0Z" fill="#c4dfc8" />
      <path d="M318 165h185v102H318z" fill="#e7eceb" />
      <path d="M304 166 410 109l106 57-15 14H319l-15-14Z" fill="#2f3e55" />
      <path d="M320 159h180l-90-48-90 48Z" fill="#52647e" />
      <path d="M410 178c-24 0-43 21-43 47v42h86v-42c0-26-19-47-43-47Z" fill="#3b475a" />
      <path d="M410 191c-16 0-29 14-29 31v45h58v-45c0-17-13-31-29-31Z" fill="#f4f5f2" />
      <path d="M313 177h195" stroke="#e67144" strokeWidth="6" />
      <path d="M610 50h10v143h-10z" fill="#8b95ac" />
      <path d="m594 51 21-38 21 38H594Z" fill="#8b95ac" />
      <path
        d="M171 166v90M153 190v66M560 175v83M578 198v60"
        stroke="#9fbd87"
        strokeLinecap="round"
        strokeWidth="11"
      />
      <circle cx="171" cy="145" r="29" fill="#a4c983" />
      <circle cx="153" cy="175" r="22" fill="#b8d89a" />
      <circle cx="560" cy="153" r="30" fill="#a9cb89" />
      <circle cx="578" cy="178" r="22" fill="#c0dca1" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeletonStack}>
      <section className={styles.weatherSkeleton}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTime}`} />

        <div className={styles.skeletonMetricGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeletonMetric}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonIcon}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonLabel}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonValue}`} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.skeletonFeelsLike}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonFeelsTitle}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLineShort}`} />
      </section>
    </div>
  );
}

export default function ClothingPage() {
  const {
    regions,
    selectedRegion,
    selectedTravelStyle,
    batchData,
    activeRecommendation,
    recommendationsByStyle,
    isRecommendationsLoading,
    isRefreshing,
    recommendationsError,
    selectRegion,
    selectTravelStyle,
    retryRecommendations,
  } = useOutfitRecommendation();

  const currentWeather = batchData?.currentWeather;
  const feelsLikeWeather = batchData?.feelsLikeWeather;

  const hasData = Boolean(batchData && currentWeather && feelsLikeWeather && activeRecommendation);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1>AI 옷차림 추천</h1>
            <p>
              선택한 충북 지역의 날씨와 체감온도를 분석해
              <br />
              여행에 맞는 옷차림을 추천합니다.
            </p>
          </div>

          <HeroArtwork />
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.regionFilterCard}>
          <div className={styles.regionFilterHeader}>
            <div>
              <p className={styles.regionEyebrow}>충북 11개 지역</p>
              <h2>여행 지역을 선택해 주세요</h2>
            </div>

            <span className={styles.selectedRegionBadge}>{selectedRegion} 선택됨</span>
          </div>

          <div className={styles.regionChipGroup}>
            {regions.map(region => (
              <button
                key={region}
                type="button"
                className={[
                  styles.regionChip,
                  selectedRegion === region ? styles.regionChipActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </section>

        {isRecommendationsLoading && !hasData && <LoadingSkeleton />}

        {recommendationsError && !hasData && (
          <section className={styles.errorBox}>
            <h2>옷차림 추천을 불러오지 못했습니다.</h2>
            <p>{recommendationsError}</p>

            <button type="button" className={styles.retryButton} onClick={retryRecommendations}>
              다시 불러오기
            </button>
          </section>
        )}

        {hasData && (
          <>
            <section className={styles.weatherCard}>
              <div className={styles.weatherCardHeader}>
                <div className={styles.locationInfo}>
                  <span className={styles.locationPin}>⌖</span>

                  <div>
                    <div className={styles.locationTitleRow}>
                      <h2>충북 {batchData.region}</h2>

                      <span className={styles.basisBadge}>선택 지역 기준</span>
                    </div>

                    <p>{formatUpdatedAt(batchData.updatedAt)}</p>
                  </div>
                </div>

                {isRefreshing && <span className={styles.refreshBadge}>최신 정보 불러오는 중</span>}
              </div>

              <div className={styles.weatherMetricGrid}>
                <article className={styles.weatherSummary}>
                  <span className={styles.weatherSymbol}>
                    {getWeatherSymbol(currentWeather.weatherCondition)}
                  </span>
                  <strong>{currentWeather.weatherCondition}</strong>
                </article>

                <article className={styles.weatherMetric}>
                  <span className={styles.metricSymbol}>♨</span>
                  <p>현재 기온</p>
                  <strong>{formatTemperature(currentWeather.temperature)}°C</strong>
                </article>

                <article className={styles.weatherMetric}>
                  <span className={styles.metricSymbol}>♨</span>
                  <p>체감온도</p>
                  <strong className={styles.accentValue}>
                    {formatTemperature(feelsLikeWeather.feelsLikeTemperature)}
                    °C
                  </strong>
                </article>

                <article className={styles.weatherMetric}>
                  <span className={styles.metricSymbol}>◈</span>
                  <p>습도</p>
                  <strong>{currentWeather.humidity}%</strong>
                </article>

                <article className={styles.weatherMetric}>
                  <span className={styles.metricSymbol}>≋</span>
                  <p>바람</p>
                  <strong>{currentWeather.windStatus}</strong>
                  <small>({currentWeather.windSpeed}m/s)</small>
                </article>

                <article className={styles.weatherMetric}>
                  <span className={styles.metricSymbol}>☂</span>
                  <p>강수 확률</p>
                  <strong>{currentWeather.precipitationProbability}%</strong>
                </article>
              </div>
            </section>

            <section className={styles.feelsLikeCard}>
              <div className={styles.feelsLikeIcon}>☼</div>

              <div className={styles.feelsLikeContent}>
                <h2>체감 날씨</h2>

                {feelsLikeWeather.summary && <p>{feelsLikeWeather.summary}</p>}

                {feelsLikeWeather.detail && <p>{feelsLikeWeather.detail}</p>}
              </div>
            </section>

            {recommendationsError && (
              <section className={styles.inlineErrorBox}>
                <p>{recommendationsError}</p>

                <button type="button" onClick={retryRecommendations}>
                  다시 시도
                </button>
              </section>
            )}

            <section className={styles.recommendationSection}>
              <h2>여행 스타일 선택</h2>

              <div className={styles.travelStyleGroup}>
                {TRAVEL_STYLES.map(travelStyle => {
                  const isSelected = selectedTravelStyle === travelStyle;

                  const isAvailable = Boolean(recommendationsByStyle[travelStyle]);

                  const meta = TRAVEL_STYLE_META[travelStyle];

                  return (
                    <button
                      key={travelStyle}
                      type="button"
                      disabled={!isAvailable}
                      className={[
                        styles.travelStyleButton,
                        isSelected ? styles.travelStyleButtonActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selectTravelStyle(travelStyle)}
                    >
                      <span>{meta.icon}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              <p className={styles.travelStyleGuide}>
                선택한 여행 상황에 맞춘 옷차림을 추천해드려요.
              </p>

              <div className={styles.sectionDivider} />

              <h2 className={styles.outfitHeading}>AI 추천 옷차림</h2>

              <div className={styles.outfitGrid}>
                {OUTFIT_CARD_LABELS.map(({ key, label }) => {
                  const outfit = activeRecommendation.outfitCards[key];

                  return (
                    <article
                      key={key}
                      className={[styles.outfitCard, styles[`outfitCard${key}`]]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <p className={styles.outfitLabel}>{label}</p>

                      <div className={styles.outfitArtworkWrap}>
                        <OutfitIllustration type={key} />
                      </div>

                      <h3>{outfit.name}</h3>

                      <p className={styles.outfitDescription}>{outfit.description}</p>
                    </article>
                  );
                })}
              </div>

              <section className={styles.preparationSection}>
                <h2>챙기면 좋은 준비물</h2>

                <div className={styles.preparationGrid}>
                  {activeRecommendation.preparationItems.map(item => (
                    <article key={item.code} className={styles.preparationItem}>
                      <span className={styles.preparationIcon}>
                        {getPreparationSymbol(item.code)}
                      </span>

                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className={styles.weatherNotice}>
                <span>i</span>
                날씨 정보는 실시간 변동될 수 있으니, 여행 일정 전 최신 날씨를 확인해 주세요.
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
