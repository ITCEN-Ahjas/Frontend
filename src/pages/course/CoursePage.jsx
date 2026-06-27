import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { importGoogleMapsLibrary } from '../../lib/googleMapsLoader';
import styles from './CoursePage.module.css';

const CHUNGBUK_CENTER = {
  lat: 36.6357,
  lng: 127.4917,
};

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

const FALLBACK_PLACE_COORDINATES = [
  {
    keywords: ['수암골'],
    latitude: 36.6432,
    longitude: 127.4933,
  },
  {
    keywords: ['운보의집', '운보'],
    latitude: 36.7197,
    longitude: 127.5821,
  },
  {
    keywords: ['청주삼겹살거리', '삼겹살거리', '서문시장'],
    latitude: 36.6358,
    longitude: 127.4885,
  },
  {
    keywords: ['미동산수목원', '미동산'],
    latitude: 36.6175,
    longitude: 127.6596,
  },
  {
    keywords: ['상당산성'],
    latitude: 36.6589,
    longitude: 127.5364,
  },
  {
    keywords: ['청남대'],
    latitude: 36.4621,
    longitude: 127.4908,
  },
  {
    keywords: ['국립청주박물관', '청주박물관'],
    latitude: 36.6538,
    longitude: 127.5126,
  },
  {
    keywords: ['문암생태공원'],
    latitude: 36.6665,
    longitude: 127.4476,
  },
  {
    keywords: ['성안길'],
    latitude: 36.6356,
    longitude: 127.4895,
  },
  {
    keywords: ['제천중앙시장'],
    latitude: 37.1365,
    longitude: 128.2091,
  },
  {
    keywords: ['도담삼봉'],
    latitude: 37.0006,
    longitude: 128.3436,
  },
  {
    keywords: ['다리안계곡'],
    latitude: 36.9842,
    longitude: 128.4108,
  },
  {
    keywords: ['정방사'],
    latitude: 37.0605,
    longitude: 128.2368,
  },
];

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

function toFiniteNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function findFallbackCoordinates(placeName) {
  const normalizedName = String(placeName || '').replace(/\s+/g, '').toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return FALLBACK_PLACE_COORDINATES.find(item =>
    item.keywords.some(keyword => normalizedName.includes(keyword.replace(/\s+/g, '').toLowerCase())),
  ) || null;
}

function createApproximateCoordinates(index, baseCoordinates = CHUNGBUK_CENTER) {
  const offsetSteps = [
    { lat: 0, lng: 0 },
    { lat: 0.018, lng: 0.018 },
    { lat: -0.018, lng: 0.018 },
    { lat: 0.018, lng: -0.018 },
    { lat: -0.018, lng: -0.018 },
    { lat: 0.032, lng: 0 },
    { lat: 0, lng: 0.032 },
    { lat: -0.032, lng: 0 },
  ];
  const offset = offsetSteps[index % offsetSteps.length];

  return {
    latitude: baseCoordinates.lat + offset.lat,
    longitude: baseCoordinates.lng + offset.lng,
    approximate: true,
  };
}

function createResolvedPlace(place, coordinates, index, baseCoordinates) {
  if (place.latitude !== null && place.longitude !== null) {
    return {
      ...place,
      isApproximateLocation: false,
    };
  }

  const fallbackCoordinates =
    coordinates || createApproximateCoordinates(index, baseCoordinates);

  return {
    ...place,
    latitude: fallbackCoordinates.latitude ?? place.latitude,
    longitude: fallbackCoordinates.longitude ?? place.longitude,
    isApproximateLocation: Boolean(fallbackCoordinates.approximate),
  };
}

function getPlaceDetails(service, placeId) {
  return new Promise(resolve => {
    service.getDetails(
      {
        placeId,
        fields: ['geometry', 'formatted_address', 'photos'],
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
          resolve(null);
          return;
        }

        resolve(place);
      },
    );
  });
}

function geocodePlace(geocoder, place) {
  const query = [place.title, place.address, '충북']
    .filter(Boolean)
    .join(' ');

  return geocoder.geocode({
    address: query,
    region: 'KR',
  });
}

function formatStayMinutes(value) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '';
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0 && restMinutes > 0) {
    return `${hours}시간 ${restMinutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  return `${restMinutes}분`;
}

function normalizeItineraryItem(item, index) {
  const place = item?.place || item?.placeName || item?.name || item?.title;
  const fallbackCoordinates = findFallbackCoordinates(place);
  const latitude = toFiniteNumber(item?.latitude) ?? fallbackCoordinates?.latitude ?? null;
  const longitude = toFiniteNumber(item?.longitude) ?? fallbackCoordinates?.longitude ?? null;

  return {
    placeId: stringify(item?.placeId || item?.id) || `course-place-${index + 1}`,
    order: Number(item?.order) || index + 1,
    day: Number(item?.day) || 1,
    time: item?.time || item?.startTime || item?.arrivalTime || `${String(9 + index).padStart(2, '0')}:00`,
    startTime: stringify(item?.startTime),
    endTime: stringify(item?.endTime),
    title: stringify(place) || `추천 장소 ${index + 1}`,
    category: stringify(item?.category) || '추천 장소',
    address: stringify(item?.address),
    imageUrl: stringify(item?.imageUrl || item?.photoUrl),
    description: stringify(item?.description || item?.activity || item?.recommendationReason || item?.reason),
    weatherReason: stringify(item?.weatherReason || item?.weatherReflectionReason || item?.weatherNote),
    moveTip: stringify(item?.moveTip || item?.transportTip || item?.travelTip),
    latitude,
    longitude,
  };
}

function normalizePlanBOption(option, index) {
  if (typeof option === 'string') {
    return {
      id: `plan-b-${index + 1}`,
      triggerCondition: '대체 코스',
      replaceFrom: '',
      replaceTo: '',
      reason: option,
    };
  }

  return {
    id: `plan-b-${index + 1}`,
    triggerCondition: stringify(option?.triggerCondition) || '대체 코스',
    replaceFrom: stringify(option?.replaceFrom),
    replaceTo: stringify(option?.replaceTo),
    reason: stringify(option?.reason || option?.description || option?.summary),
  };
}

function normalizeRecommendation(response) {
  const itinerary = asArray(response?.itinerary || response?.days?.flatMap(day => day?.places || []))
    .map(normalizeItineraryItem);
  const routeOverview = response?.routeOverview || {};
  const planBOptions = asArray(response?.planBOptions || response?.planB || response?.alternatives)
    .map(normalizePlanBOption);
  const weatherNoteDetails = asArray(response?.weatherNoteDetails || response?.weatherNotes);

  return {
    summary: stringify(response?.summary) || '추천 요약이 아직 제공되지 않았습니다.',
    overviewTitle: stringify(routeOverview?.title),
    totalDistance: stringify(response?.totalDistance || response?.distance) || '지도 동선 기준 확인',
    totalDuration:
      stringify(response?.totalDuration || response?.duration) ||
      formatStayMinutes(routeOverview?.totalStayMinutes) ||
      '계산 예정',
    totalPlaces: Number(routeOverview?.totalPlaces) || itinerary.length,
    weatherSummary: stringify(routeOverview?.weatherSummary),
    styleTags: asArray(routeOverview?.styleTags).map(stringify).filter(Boolean),
    itinerary,
    planB: asArray(response?.planB || response?.alternatives),
    planBOptions,
    weatherNotes: weatherNoteDetails,
  };
}

function getMappablePlaces(items) {
  return items.filter(item => item.latitude !== null && item.longitude !== null);
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

function getCssColor(variableName) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function createNumberMarkerIcon(order, isSelected = false) {
  const color = getCssColor(isSelected ? '--color-chungbuk-cyan' : '--color-chungbuk-purple');
  const strokeColor = getCssColor('--color-white');
  const size = isSelected ? 48 : 42;
  const height = isSelected ? 58 : 52;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 42 52">
        <path fill="${color}" stroke="${strokeColor}" stroke-width="4" d="M21 2C10.51 2 2 10.51 2 21c0 13.68 19 28 19 28s19-14.32 19-28C40 10.51 31.49 2 21 2Z"/>
        <circle cx="21" cy="21" r="11" fill="${strokeColor}"/>
        <text x="21" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="${color}">${order}</text>
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(size, height),
    anchor: new window.google.maps.Point(size / 2, height),
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
  const planBItems = result.planBOptions.length > 0
    ? result.planBOptions
    : result.planB.map(normalizePlanBOption);

  return (
    <div className={styles.infoStack}>
      <section className={styles.infoNotice}>
        <h3>여행톡</h3>
        <p>여행자가 코스 선택 전에 확인할 수 있는 짧은 안내와 대체 코스를 모아 보여줍니다.</p>
      </section>
      {planBItems.length > 0 ? (
        planBItems.map((item, index) => (
          <article key={item.id || `${stringify(item)}-${index}`} className={styles.planBCard}>
            <span>{item.triggerCondition || `대체 코스 ${index + 1}`}</span>
            {item.replaceFrom || item.replaceTo ? (
              <strong>
                {item.replaceFrom || '기존 장소'} → {item.replaceTo || '대체 장소'}
              </strong>
            ) : (
              <strong>대체 코스 {index + 1}</strong>
            )}
            {item.reason && <p>{item.reason}</p>}
          </article>
        ))
      ) : (
        <article className={styles.planBCard}>
          <span>대체 코스</span>
          <strong>응답에 대체 코스가 포함되면 이 영역에 표시됩니다.</strong>
        </article>
      )}
    </div>
  );
}

function PlannerTabs({ result, selectedPlaceId, onSelectPlace }) {
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
      {activeTab === 'articles' && <ArticlesTab result={result} />}
      {activeTab === 'talk' && <TalkTab result={result} />}
    </section>
  );
}

function PlannerMap({ result, selectedPlaceId, onSelectPlace }) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstancesRef = useRef(new Map());
  const routeLineRef = useRef(null);
  const coordinateResolveAttemptRef = useRef(new Set());
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapErrorMessage, setMapErrorMessage] = useState('');
  const [resolvedCoordinates, setResolvedCoordinates] = useState({});
  const places = result?.itinerary || [];
  const placeSignature = useMemo(
    () => places.map(place => place.placeId).join('|'),
    [places],
  );
  const routeBaseCoordinates = useMemo(() => {
    const knownPlace = places.find(
      place => place.latitude !== null && place.longitude !== null,
    );

    if (knownPlace) {
      return {
        lat: knownPlace.latitude,
        lng: knownPlace.longitude,
      };
    }

    const resolvedCoordinate = Object.values(resolvedCoordinates).find(Boolean);

    if (resolvedCoordinate) {
      return {
        lat: resolvedCoordinate.latitude,
        lng: resolvedCoordinate.longitude,
      };
    }

    return CHUNGBUK_CENTER;
  }, [places, resolvedCoordinates]);
  const resolvedPlaces = useMemo(
    () =>
      places.map((place, index) =>
        createResolvedPlace(
          place,
          resolvedCoordinates[place.placeId],
          index,
          routeBaseCoordinates,
        ),
      ),
    [places, resolvedCoordinates, routeBaseCoordinates],
  );
  const mappablePlaces = useMemo(() => getMappablePlaces(resolvedPlaces), [resolvedPlaces]);

  useEffect(() => {
    coordinateResolveAttemptRef.current.clear();
    setResolvedCoordinates({});
  }, [placeSignature]);

  useEffect(() => {
    let isCancelled = false;

    async function initializeMap() {
      try {
        const { Map } = await importGoogleMapsLibrary('maps');

        if (isCancelled || !mapElementRef.current || mapInstanceRef.current) {
          return;
        }

        mapInstanceRef.current = new Map(mapElementRef.current, {
          center: CHUNGBUK_CENTER,
          zoom: 9,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          cameraControl: false,
          gestureHandling: 'greedy',
        });

        setMapStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setMapErrorMessage(
          error instanceof Error
            ? error.message
            : 'Google 지도를 불러오는 중 오류가 발생했습니다.',
        );
        setMapStatus('error');
      }
    }

    initializeMap();

    return () => {
      isCancelled = true;
      markerInstancesRef.current.forEach(marker => marker.setMap(null));
      markerInstancesRef.current.clear();
      routeLineRef.current?.setMap(null);
      routeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      mapStatus !== 'ready' ||
      !window.google?.maps ||
      !mapInstanceRef.current ||
      places.length === 0
    ) {
      return undefined;
    }

    let isCancelled = false;
    const unresolvedPlaces = places.filter(
      place =>
        place.latitude === null &&
        place.longitude === null &&
        !resolvedCoordinates[place.placeId] &&
        !coordinateResolveAttemptRef.current.has(place.placeId),
    );

    if (unresolvedPlaces.length === 0) {
      return undefined;
    }

    async function resolveMissingCoordinates() {
      const { PlacesService } = await importGoogleMapsLibrary('places');
      const placesService = new PlacesService(mapInstanceRef.current);
      const geocoder = new window.google.maps.Geocoder();
      const nextCoordinates = {};

      for (const place of unresolvedPlaces) {
        coordinateResolveAttemptRef.current.add(place.placeId);

        try {
          const placeDetails = place.placeId
            ? await getPlaceDetails(placesService, place.placeId)
            : null;
          const detailLocation = placeDetails?.geometry?.location;

          if (detailLocation) {
            nextCoordinates[place.placeId] = {
              latitude: detailLocation.lat(),
              longitude: detailLocation.lng(),
            };
            continue;
          }

          const response = await geocodePlace(geocoder, place);
          const geocodeLocation = response.results?.[0]?.geometry?.location;

          if (!geocodeLocation) {
            continue;
          }

          nextCoordinates[place.placeId] = {
            latitude: geocodeLocation.lat(),
            longitude: geocodeLocation.lng(),
          };
        } catch {
          // 좌표 보강 실패 시 해당 장소는 일정에만 표시한다.
        }
      }

      if (!isCancelled && Object.keys(nextCoordinates).length > 0) {
        setResolvedCoordinates(previous => ({
          ...previous,
          ...nextCoordinates,
        }));
      }
    }

    resolveMissingCoordinates();

    return () => {
      isCancelled = true;
    };
  }, [mapStatus, places, resolvedCoordinates]);

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapInstanceRef.current) {
      return undefined;
    }

    const markerInstances = markerInstancesRef.current;
    const routePath = mappablePlaces.map(place => ({
      lat: place.latitude,
      lng: place.longitude,
    }));
    const bounds = new window.google.maps.LatLngBounds();

    markerInstances.forEach(marker => marker.setMap(null));
    markerInstances.clear();
    routeLineRef.current?.setMap(null);
    routeLineRef.current = null;

    mappablePlaces.forEach(place => {
      const position = {
        lat: place.latitude,
        lng: place.longitude,
      };

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        title: place.title,
        icon: createNumberMarkerIcon(place.order, selectedPlaceId === place.placeId),
        zIndex: selectedPlaceId === place.placeId ? 1000 : place.order,
      });

      marker.addListener('click', () => onSelectPlace(place));
      markerInstances.set(place.placeId, marker);
      bounds.extend(position);
    });

    if (routePath.length >= 2) {
      routeLineRef.current = new window.google.maps.Polyline({
        map: mapInstanceRef.current,
        path: routePath,
        strokeColor: getCssColor('--color-chungbuk-purple'),
        strokeOpacity: 0.82,
        strokeWeight: 5,
      });
    }

    if (routePath.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(14);
    } else if (routePath.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 72);
    } else {
      mapInstanceRef.current.setCenter(CHUNGBUK_CENTER);
      mapInstanceRef.current.setZoom(9);
    }

    return () => {
      markerInstances.forEach(marker => marker.setMap(null));
      markerInstances.clear();
      routeLineRef.current?.setMap(null);
      routeLineRef.current = null;
    };
  }, [mapStatus, mappablePlaces, onSelectPlace, selectedPlaceId]);

  useEffect(() => {
    if (mapStatus !== 'ready') {
      return;
    }

    markerInstancesRef.current.forEach((marker, placeId) => {
      const place = mappablePlaces.find(item => item.placeId === placeId);
      const isSelected = selectedPlaceId === placeId;

      if (!place) {
        return;
      }

      marker.setIcon(createNumberMarkerIcon(place.order, isSelected));
      marker.setZIndex(isSelected ? 1000 : place.order);

      if (isSelected) {
        mapInstanceRef.current?.panTo({
          lat: place.latitude,
          lng: place.longitude,
        });
      }
    });
  }, [mapStatus, mappablePlaces, selectedPlaceId]);

  return (
    <section className={styles.mapPanel} aria-label="AI 추천 코스 지도">
      <div className={styles.mapToolbar}>
        <div>
          <span>Route Map</span>
          <strong>
            {places.length > 0
              ? `${mappablePlaces.length}/${places.length}개 지도 표시 지점`
              : '지도 표시 지점 대기 중'}
          </strong>
        </div>
        <button type="button" disabled>
          <FiMap aria-hidden="true" />
          Google Map
        </button>
      </div>

      <div className={styles.mapCanvas}>
        <div ref={mapElementRef} className={styles.googleMap} aria-label="추천 코스 Google 지도" />

        {mapStatus !== 'ready' && (
          <div className={styles.mapState} role={mapStatus === 'error' ? 'alert' : 'status'}>
            {mapStatus === 'loading' ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <strong>지도를 불러오고 있습니다.</strong>
              </>
            ) : (
              <>
                <FiMapPin aria-hidden="true" />
                <strong>지도를 표시할 수 없습니다.</strong>
                <p>{mapErrorMessage}</p>
              </>
            )}
          </div>
        )}

        {mapStatus === 'ready' && places.length > 0 && mappablePlaces.length === 0 && (
          <div className={styles.mapNotice}>
            <FiMapPin aria-hidden="true" />
            <strong>추천 장소 좌표를 찾고 있습니다.</strong>
            <p>백엔드 응답에 좌표가 없어서 장소명으로 지도 위치를 보강하는 중입니다.</p>
          </div>
        )}

        {mapStatus === 'ready' && places.length === 0 && (
          <div className={styles.mapNotice}>
            <FiMapPin aria-hidden="true" />
            <strong>추천 결과를 기다리고 있습니다.</strong>
            <p>여행 조건을 입력하면 지도에 추천 장소와 이동 동선이 표시됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}

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

        </aside>

        <div className={styles.mapColumn}>
          <PlannerMap
            result={normalizedResult}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />
        </div>

        <aside className={styles.resultColumn}>
          {normalizedResult ? (
            <PlannerTabs
              result={normalizedResult}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handleSelectPlace}
            />
          ) : (
            <StatusPanel status={resultState.status} error={resultState.error} />
          )}
        </aside>
      </div>
    </section>
  );
}
