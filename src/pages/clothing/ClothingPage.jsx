import {
  createElement,
} from 'react';
import {
  FiBattery,
  FiCircle,
  FiCloud,
  FiCloudRain,
  FiDroplet,
  FiInfo,
  FiMapPin,
  FiMoon,
  FiPackage,
  FiShield,
  FiSun,
  FiThermometer,
  FiUmbrella,
  FiWind,
} from 'react-icons/fi';
import { useOutfitRecommendation } from '../../hooks/useOutfitRecommendation';
import styles from './ClothingPage.module.css';

const OUTFIT_CARD_LABELS = [
  { key: 'outerwear', label: '아우터' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'shoes', label: '신발' },
];

const TIME_SLOT_META = {
  morning: { Icon: FiSun, label: '아침' },
  daytime: { Icon: FiSun, label: '낮' },
  afternoon: { Icon: FiCloud, label: '오후' },
  evening: { Icon: FiMoon, label: '저녁' },
};

function formatTemperature(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '-';
  }

  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function formatTimeRange(startTime, endTime) {
  const start = String(startTime || '').slice(0, 5);
  const end = String(endTime || '').slice(0, 5);

  if (!start || !end) {
    return '시간 정보 없음';
  }

  return `${start}–${end}`;
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

function getWeatherIcon(weatherCondition) {
  const condition = String(weatherCondition || '');

  if (condition.includes('눈')) {
    return FiCloud;
  }

  if (condition.includes('비') || condition.includes('소나기')) {
    return FiCloudRain;
  }

  if (condition.includes('맑음')) {
    return FiSun;
  }

  return FiCloud;
}

function getPreparationIcon(code) {
  const iconMap = {
    umbrella: FiUmbrella,
    waterproof_pouch: FiPackage,
    extra_socks: FiShield,
    light_outerwear: FiShield,
    warm_accessory: FiShield,
    hot_pack: FiCircle,
    water_bottle: FiDroplet,
    thermal_bottle: FiDroplet,
    battery: FiBattery,
    sunscreen: FiSun,
    hat: FiShield,
    insect_repellent: FiShield,
    portable_fan: FiWind,
  };

  return iconMap[code] || FiPackage;
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
          stroke="currentColor"
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
          stroke="currentColor"
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
          stroke="currentColor"
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function HeroArtwork() {
  return (
    <svg className={styles.heroArtwork} viewBox="0 0 760 330" aria-hidden="true">
      <path d="M0 255 105 178l90 58 118-96 119 84 101-70 127 101H0Z" fill="var(--color-illustration-mountain)" />
      <path d="M0 274 101 221l91 42 115-56 116 44 104-45 133 68H0Z" fill="var(--color-illustration-mountain-deep)" />
      <path d="M318 165h185v102H318z" fill="var(--color-illustration-building)" />
      <path d="M304 166 410 109l106 57-15 14H319l-15-14Z" fill="var(--color-illustration-roof)" />
      <path d="M320 159h180l-90-48-90 48Z" fill="var(--color-illustration-roof-light)" />
      <path d="M410 178c-24 0-43 21-43 47v42h86v-42c0-26-19-47-43-47Z" fill="var(--color-illustration-door)" />
      <path d="M410 191c-16 0-29 14-29 31v45h58v-45c0-17-13-31-29-31Z" fill="var(--color-illustration-door-light)" />
      <path d="M313 177h195" stroke="var(--color-illustration-accent)" strokeWidth="6" />
      <path d="M610 50h10v143h-10z" fill="var(--color-illustration-pole)" />
      <path d="m594 51 21-38 21 38H594Z" fill="var(--color-illustration-pole)" />
      <path
        d="M171 166v90M153 190v66M560 175v83M578 198v60"
        stroke="var(--color-illustration-tree)"
        strokeLinecap="round"
        strokeWidth="11"
      />
      <circle cx="171" cy="145" r="29" fill="var(--color-illustration-tree-light)" />
      <circle cx="153" cy="175" r="22" fill="var(--color-illustration-tree-soft)" />
      <circle cx="560" cy="153" r="30" fill="var(--color-illustration-tree-alt)" />
      <circle cx="578" cy="178" r="22" fill="var(--color-illustration-tree-alt-soft)" />
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
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.skeletonMetric}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonIcon}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonLabel}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonValue}`} />
            </div>
          ))}
        </div>
      </section>
      <section className={styles.skeletonOutfit}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonFeelsTitle}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
      </section>
    </div>
  );
}

export default function ClothingPage() {
  const {
    regions,
    residenceCountries,
    selectedRegion,
    selectedTimeSlot,
    selectedResidenceCity,
    residenceCountryCode,
    residenceCityQuery,
    residenceCityOptions,
    citySearchError,
    isCitySearchLoading,
    batchData,
    activeRecommendation,
    dailyPreparationItems,
    isRecommendationsLoading,
    recommendationsError,
    selectRegion,
    selectTimeSlot,
    selectResidenceCountry,
    changeResidenceCityQuery,
    selectResidenceCity,
    retryRecommendations,
  } = useOutfitRecommendation();

  const hasData = Boolean(batchData && activeRecommendation);
  const currentWeather = activeRecommendation?.currentWeather;
  const feelsLikeWeather = activeRecommendation?.feelsLikeWeather;
  const residenceWeather = batchData?.residenceWeather;
  const residenceComparison = activeRecommendation?.residenceComparison;
  const timeSlotMeta = TIME_SLOT_META[activeRecommendation?.timeSlot] || {
    Icon: FiCloud,
    label: activeRecommendation?.timeSlotName || '시간대',
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>TIME-SLOT WEATHER GUIDE</p>
            <h1>AI 옷차림 추천</h1>
            <p>
              충북 여행 시간대와 현재 거주 도시의 날씨를 비교해
              <br />
              지금 필요한 옷차림과 준비물을 안내합니다.
            </p>
          </div>
          <HeroArtwork />
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.locationSelectionCard}>
          <div className={styles.locationSelectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>TRAVEL &amp; RESIDENCE</p>
              <h2>여행 지역과 현재 거주 도시를 선택해 주세요</h2>
            </div>
          </div>

          <div className={styles.locationSelectionGrid}>
            <label className={styles.selectionField}>
              <span>여행 지역</span>
              <select value={selectedRegion} onChange={event => selectRegion(event.target.value)}>
                {regions.map(region => (
                  <option key={region} value={region}>
                    충북 {region}
                  </option>
                ))}
              </select>
              <small>여행 예정 지역을 선택해 주세요.</small>
            </label>

            <div className={styles.residenceSelectionField}>
              <span className={styles.selectionFieldLabel}>현재 거주 도시</span>
              <div className={styles.residenceInlineControls}>
                <label className={styles.countryField}>
                  <span className={styles.visuallyHidden}>국가</span>
                  <select
                    value={residenceCountryCode}
                    onChange={event => selectResidenceCountry(event.target.value)}
                    aria-label="현재 거주 국가"
                  >
                    {residenceCountries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.cityFieldWrap}>
                  <label className={styles.citySearchField}>
                    <span className={styles.visuallyHidden}>현재 거주 도시</span>
                    <input
                      type="search"
                      value={residenceCityQuery}
                      placeholder="도시 검색: ne / New York"
                      onChange={event => changeResidenceCityQuery(event.target.value)}
                    />
                  </label>

                  {isCitySearchLoading && <p className={styles.citySearchNotice}>도시를 찾고 있어요.</p>}
                  {citySearchError && <p className={styles.citySearchError}>{citySearchError}</p>}

                  {!isCitySearchLoading &&
                    !citySearchError &&
                    residenceCityQuery.trim().length >= 2 &&
                    !selectedResidenceCity && (
                      <div className={styles.cityResultPanel}>
                        {residenceCityOptions.length > 0 ? (
                          residenceCityOptions.map(city => (
                            <button
                              key={`${city.city}-${city.countryCode}-${city.latitude}-${city.longitude}`}
                              type="button"
                              className={styles.cityResultButton}
                              onClick={() => selectResidenceCity(city)}
                            >
                              <strong>{city.city}</strong>
                              <span>
                                {[city.admin1, city.country].filter(Boolean).join(', ') || city.countryCode}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className={styles.emptyCityResult}>검색 결과가 없습니다. 도시 이름을 확인해 주세요.</p>
                        )}
                      </div>
                    )}
                </div>
              </div>
              <small>
                {selectedResidenceCity
                  ? `${selectedResidenceCity.city}, ${[selectedResidenceCity.admin1, selectedResidenceCity.country]
                      .filter(Boolean)
                      .join(', ')}`
                  : '국가를 고른 뒤 두 글자 이상 입력해 도시를 선택해 주세요.'}
              </small>
            </div>
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
            <section className={styles.weatherInsightSection}>
              <div className={styles.weatherInsightHeader}>
                <div>
                  <p className={styles.weatherInsightEyebrow}>여행지 체감 날씨 안내</p>
                  <h2>
                    충북 {batchData.region} {activeRecommendation.timeSlotName} 체감날씨
                  </h2>
                </div>
                <p className={styles.weatherInsightTime}>
                  {formatTimeRange(activeRecommendation.startTime, activeRecommendation.endTime)}
                </p>
              </div>

              <div className={styles.weatherInsight}>
                <FiSun className={styles.weatherInsightIcon} aria-hidden="true" />
                <div>
                  {residenceWeather && residenceComparison ? (
                    <>
                      <strong>{residenceComparison.message}</strong>
                      <p className={styles.weatherInsightDetail}>
                        {residenceWeather.city} 체감 {formatTemperature(residenceWeather.feelsLikeTemperature)}°C · 충북{' '}
                        {activeRecommendation.timeSlotName} 체감{' '}
                        {formatTemperature(feelsLikeWeather.feelsLikeTemperature)}°C
                      </p>
                    </>
                  ) : (
                    <strong>
                      충북 {batchData.region}의 {activeRecommendation.timeSlotName} 체감온도는{' '}
                      {formatTemperature(feelsLikeWeather.feelsLikeTemperature)}°C예요.
                    </strong>
                  )}
                  {(feelsLikeWeather.summary || feelsLikeWeather.detail) && (
                    <p className={styles.weatherInsightDetail}>
                      {feelsLikeWeather.summary || feelsLikeWeather.detail}
                      {feelsLikeWeather.summary && feelsLikeWeather.detail ? ` ${feelsLikeWeather.detail}` : ''}
                    </p>
                  )}
                  {!residenceWeather && (
                    <p className={styles.weatherInsightHint}>
                      현재 거주 도시를 선택하면 평소 날씨와의 체감온도 차이도 함께 알려드려요.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.timeSlotSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>여행 시간대를 선택해 주세요</h2>
                </div>
              </div>

              <div className={styles.timeSlotTabGroup}>
                {batchData.recommendations.map(recommendation => {
                  const meta = TIME_SLOT_META[recommendation.timeSlot] || {
                    Icon: FiCloud,
                    label: recommendation.timeSlotName,
                  };
                  const isSelected = selectedTimeSlot === recommendation.timeSlot;
                  const SlotIcon = meta.Icon;

                  return (
                    <button
                      key={recommendation.timeSlot}
                      type="button"
                      className={[styles.timeSlotTab, isSelected ? styles.timeSlotTabActive : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selectTimeSlot(recommendation.timeSlot)}
                    >
                      {createElement(SlotIcon, {
                        className: styles.timeSlotIcon,
                        'aria-hidden': 'true',
                      })}
                      <span>
                        <strong>{meta.label}</strong>
                        <small>{formatTimeRange(recommendation.startTime, recommendation.endTime)}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.weatherSection}>
              <div className={styles.selectedTimeHeader}>
                <div className={styles.locationInfo}>
                  <FiMapPin className={styles.locationPin} aria-hidden="true" />
                  <div>
                    <p className={styles.timeSlotLabel}>
                      {createElement(timeSlotMeta.Icon, {
                        className: styles.inlineIcon,
                        'aria-hidden': 'true',
                      })}
                      {timeSlotMeta.label} ·{' '}
                      {formatTimeRange(activeRecommendation.startTime, activeRecommendation.endTime)}
                    </p>
                    <div className={styles.locationTitleRow}>
                      <h2>충북 {batchData.region} 날씨</h2>
                    </div>
                    <p>{formatUpdatedAt(batchData.updatedAt)}</p>
                  </div>
                </div>

                <div className={styles.weatherSummaryBadge}>
                  {createElement(getWeatherIcon(currentWeather.weatherCondition), {
                    'aria-hidden': 'true',
                  })}
                  <strong>{currentWeather.weatherCondition}</strong>
                </div>
              </div>

              <div className={styles.weatherMetricGrid}>
                <article className={styles.weatherMetric}>
                  <FiThermometer className={styles.metricSymbol} aria-hidden="true" />
                  <p>예상 기온</p>
                  <strong>{formatTemperature(currentWeather.temperature)}°C</strong>
                </article>
                <article className={styles.weatherMetric}>
                  <FiThermometer className={styles.metricSymbol} aria-hidden="true" />
                  <p>체감온도</p>
                  <strong className={styles.accentValue}>
                    {formatTemperature(feelsLikeWeather.feelsLikeTemperature)}°C
                  </strong>
                </article>
                <article className={styles.weatherMetric}>
                  <FiDroplet className={styles.metricSymbol} aria-hidden="true" />
                  <p>습도</p>
                  <strong>{currentWeather.humidity}%</strong>
                </article>
                <article className={styles.weatherMetric}>
                  <FiWind className={styles.metricSymbol} aria-hidden="true" />
                  <p>바람</p>
                  <strong>{currentWeather.windStatus}</strong>
                  <small>{currentWeather.windSpeed}m/s</small>
                </article>
                <article className={styles.weatherMetric}>
                  <FiCloudRain className={styles.metricSymbol} aria-hidden="true" />
                  <p>강수 확률</p>
                  <strong>{currentWeather.precipitationProbability}%</strong>
                </article>
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
              <div className={styles.recommendationHeader}>
                <div>
                  <h2>{activeRecommendation.timeSlotName}에 추천하는 옷차림</h2>
                </div>
              </div>

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
            </section>

            <section className={styles.preparationSection}>
              <div className={styles.preparationHeader}>
                <div>
                  <h2>하루 동안 챙기면 좋은 준비물</h2>
                </div>
              </div>

              <div
                className={[
                  styles.preparationGrid,
                  styles[`preparationGridCount${Math.min(dailyPreparationItems.length, 6)}`],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {dailyPreparationItems.map(item => {
                  const PreparationIcon = getPreparationIcon(item.code);

                  return (
                    <article key={item.code} className={styles.preparationItem}>
                      <PreparationIcon className={styles.preparationIcon} aria-hidden="true" />
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className={styles.weatherNotice}>
              <FiInfo aria-hidden="true" />
              날씨 정보는 변동될 수 있으니, 출발 전 최신 예보를 한 번 더 확인해 주세요.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
