import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchPlaces, PLACE_CATEGORIES } from '../../api/placeApi';
import { CHUNGBUK_BOUNDARY_PATH } from '../../data/chungbukBoundary';
import { CHUNGBUK_REGION_BOUNDARY_PATHS } from '../../data/chungbukRegionBoundaries';
import {
  CHUNGBUK_REGIONS,
  getChungbukRegionLabel,
} from '../../data/chungbukRegions';
import { importGoogleMapsLibrary } from '../../lib/googleMapsLoader';
import PlaceResultList from './components/PlaceResultList/PlaceResultList';
import PlaceSearchPanel from './components/PlaceSearchPanel/PlaceSearchPanel';
import SelectedPlaceCard from './components/SelectedPlaceCard/SelectedPlaceCard';
import { listStagger, pageFade, riseIn } from '../../shared/animation/pageMotion';
import styles from './MapPage.module.css';

const CHUNGBUK_CENTER = {
  lat: 36.6357,
  lng: 127.4917,
};

const DEFAULT_SEARCH = {
  keyword: '',
  category: 'ALL',
  region: 'ALL',
};

const PLACE_FETCH_SIZE = 20;
const RESULT_PAGE_SIZE = 4;
const OLIVE_YOUNG_CATEGORY = 'OLIVE_YOUNG';
const OLIVE_YOUNG_SEARCH_KEYWORD = '올리브영';
const SEARCH_CATEGORY_VALUES = PLACE_CATEGORIES
  .filter(category => category.value !== 'ALL')
  .map(category => category.value);
const CATEGORY_SEARCH_TERMS = {
  TOURIST_ATTRACTION: ['관광지', '관광', '명소', '여행지', '볼거리', 'tourist', 'attraction'],
  RESTAURANT: ['음식점', '식당', '맛집', '음식', '먹거리', 'restaurant', 'food'],
  SHOPPING: ['쇼핑', '상점', '매장', '가게', 'shopping', 'store'],
  OLIVE_YOUNG: ['올리브영', '올영', 'oliveyoung', 'olive young'],
};
const CHUNGBUK_BOUNDARY_STYLE = {
  fillOpacity: 0.14,
  outerStrokeOpacity: 0.24,
  outerStrokeWeight: 7,
  innerStrokeOpacity: 0.86,
  innerStrokeWeight: 3,
};
const SELECTED_REGION_BOUNDARY_STYLE = {
  fillOpacity: 0.28,
  outerStrokeOpacity: 0.28,
  outerStrokeWeight: 8,
  innerStrokeOpacity: 0.96,
  innerStrokeWeight: 3,
  zoom: 10,
};

function getCssColor(variableName) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function createMarkerIcon(isSelected = false) {
  const fillColor = getCssColor('--color-chungbuk-purple');
  const selectedFillColor = getCssColor('--color-chungbuk-cyan');
  const strokeColor = getCssColor('--color-white');
  const shadowColor = 'rgba(49, 46, 129, 0.32)';
  const markerFillColor = isSelected ? selectedFillColor : fillColor;
  const width = isSelected ? 44 : 36;
  const height = isSelected ? 54 : 44;
  const viewBoxWidth = 48;
  const viewBoxHeight = 58;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">
        <ellipse cx="24" cy="53" rx="10.8" ry="3.4" fill="${shadowColor}"/>
        <path fill="${markerFillColor}" d="M24 1.5C12.7 1.5 3.6 10.4 3.6 21.5c0 14.2 15.9 26.7 19.4 33.5.4.8 1.6.8 2 0 3.5-6.8 19.4-19.3 19.4-33.5C44.4 10.4 35.3 1.5 24 1.5Z"/>
        <circle cx="24" cy="21" r="9.3" fill="${strokeColor}"/>
        <circle cx="24" cy="21" r="4.6" fill="${markerFillColor}"/>
        ${isSelected ? `<circle cx="24" cy="21" r="13.3" fill="none" stroke="${markerFillColor}" stroke-width="2.6" opacity="0.46"/>` : ''}
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(width, height),
    anchor: new window.google.maps.Point(width / 2, height - 3),
  };
}

function createDirectionsUrl(place) {
  const params = new URLSearchParams({ api: '1' });
  const destination = [place?.name, place?.address]
    .filter(Boolean)
    .join(' ');

  params.set('destination', destination || place?.address || place?.name || '');

  if (place?.placeId) {
    params.set('destination_place_id', place.placeId);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function mergeUniquePlaces(placeGroups) {
  const placeMap = new Map();

  placeGroups.flat().forEach(place => {
    if (!place?.placeId || placeMap.has(place.placeId)) {
      return;
    }

    placeMap.set(place.placeId, place);
  });

  return Array.from(placeMap.values());
}

function getApiCategory(category) {
  return category === OLIVE_YOUNG_CATEGORY ? 'ALL' : category;
}

function getDisplayCategory(category) {
  return PLACE_CATEGORIES.find(item => item.value === category)?.label || '';
}

function createBoundaryOverlays(map) {
  const boundaryColor = getCssColor('--color-chungbuk-purple');

  return {
    fill: new window.google.maps.Polygon({
      paths: CHUNGBUK_BOUNDARY_PATH,
      strokeOpacity: 0,
      fillColor: boundaryColor,
      fillOpacity: CHUNGBUK_BOUNDARY_STYLE.fillOpacity,
      clickable: false,
      zIndex: 1,
      map,
    }),
    outerLine: new window.google.maps.Polyline({
      path: [...CHUNGBUK_BOUNDARY_PATH, CHUNGBUK_BOUNDARY_PATH[0]],
      strokeColor: boundaryColor,
      strokeOpacity: CHUNGBUK_BOUNDARY_STYLE.outerStrokeOpacity,
      strokeWeight: CHUNGBUK_BOUNDARY_STYLE.outerStrokeWeight,
      clickable: false,
      zIndex: 2,
      map,
    }),
    innerLine: new window.google.maps.Polyline({
      path: [...CHUNGBUK_BOUNDARY_PATH, CHUNGBUK_BOUNDARY_PATH[0]],
      strokeColor: boundaryColor,
      strokeOpacity: CHUNGBUK_BOUNDARY_STYLE.innerStrokeOpacity,
      strokeWeight: CHUNGBUK_BOUNDARY_STYLE.innerStrokeWeight,
      clickable: false,
      zIndex: 3,
      map,
    }),
  };
}

function createClosedPath(path) {
  if (path.length === 0) {
    return [];
  }

  return [...path, path[0]];
}

function createRegionBoundaryOverlays(map, paths) {
  const boundaryColor = getCssColor('--color-chungbuk-purple');
  const outlinePath = paths.reduce((largestPath, path) => (
    path.length > largestPath.length ? path : largestPath
  ), []);

  return [
    new window.google.maps.Polygon({
      paths: outlinePath,
      strokeOpacity: 0,
      fillColor: boundaryColor,
      fillOpacity: SELECTED_REGION_BOUNDARY_STYLE.fillOpacity,
      clickable: false,
      zIndex: 4,
      map,
    }),
    new window.google.maps.Polyline({
      path: createClosedPath(outlinePath),
      strokeColor: boundaryColor,
      strokeOpacity: SELECTED_REGION_BOUNDARY_STYLE.outerStrokeOpacity,
      strokeWeight: SELECTED_REGION_BOUNDARY_STYLE.outerStrokeWeight,
      clickable: false,
      zIndex: 5,
      map,
    }),
    new window.google.maps.Polyline({
      path: createClosedPath(outlinePath),
      strokeColor: boundaryColor,
      strokeOpacity: SELECTED_REGION_BOUNDARY_STYLE.innerStrokeOpacity,
      strokeWeight: SELECTED_REGION_BOUNDARY_STYLE.innerStrokeWeight,
      clickable: false,
      zIndex: 6,
      map,
    }),
  ];
}

function clearBoundaryOverlays(overlays) {
  if (Array.isArray(overlays)) {
    overlays.forEach(overlay => overlay.setMap(null));
    return;
  }

  overlays?.fill?.setMap(null);
  overlays?.outerLine?.setMap(null);
  overlays?.innerLine?.setMap(null);
}

function createBoundaryBounds() {
  const bounds = new window.google.maps.LatLngBounds();

  CHUNGBUK_BOUNDARY_PATH.forEach(position => bounds.extend(position));

  return bounds;
}

function createPathsBounds(paths) {
  const bounds = new window.google.maps.LatLngBounds();

  paths.flat().forEach(position => bounds.extend(position));

  return bounds;
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();
}

function getSearchTokens(keyword) {
  return String(keyword ?? '')
    .trim()
    .split(/\s+/)
    .map(normalizeSearchText)
    .filter(Boolean);
}

function getCategoryValueByLabel(label) {
  return PLACE_CATEGORIES.find(category => category.label === label)?.value || '';
}

function getPlaceCategoryValue(place) {
  return getCategoryValueByLabel(place?.category) || place?.category || '';
}

function getRegionSearchTerms(regionValue) {
  const label = getChungbukRegionLabel(regionValue);
  const shortLabel = label.replace(/[시군]$/, '');

  return [label, shortLabel]
    .map(normalizeSearchText)
    .filter(Boolean);
}

function getPlaceSearchText(place) {
  return [
    place?.name,
    place?.address,
    place?.category,
    place?.primaryTypeName,
    place?.primaryType,
  ].map(normalizeSearchText).join(' ');
}

function matchesSelectedRegion(place, regionValue) {
  if (regionValue === 'ALL') {
    return true;
  }

  const placeText = getPlaceSearchText(place);

  return getRegionSearchTerms(regionValue).some(term => placeText.includes(term));
}

function matchesSelectedCategory(place, categoryValue) {
  if (categoryValue === 'ALL') {
    return true;
  }

  const placeCategoryValue = getPlaceCategoryValue(place);

  if (categoryValue === OLIVE_YOUNG_CATEGORY) {
    return getPlaceSearchText(place).includes(normalizeSearchText(OLIVE_YOUNG_SEARCH_KEYWORD));
  }

  return placeCategoryValue === categoryValue || place?.category === getDisplayCategory(categoryValue);
}

function matchesKeywordToken(place, token) {
  const placeText = getPlaceSearchText(place);
  const categoryValue = getPlaceCategoryValue(place);
  const matchedRegion = CHUNGBUK_REGIONS.some(region =>
    region.value !== 'ALL' &&
    getRegionSearchTerms(region.value).some(term =>
      (term.includes(token) || token.includes(term)) && placeText.includes(term),
    ),
  );
  const matchedCategory = Object.entries(CATEGORY_SEARCH_TERMS).some(([value, terms]) => {
    if (categoryValue !== value && place?.category !== getDisplayCategory(value)) {
      return false;
    }

    return terms.map(normalizeSearchText).some(term => term.includes(token) || token.includes(term));
  });

  return placeText.includes(token) || matchedRegion || matchedCategory;
}

function applyClientFilters(places, search) {
  const tokens = getSearchTokens(search.keyword);

  return places.filter(place => (
    matchesSelectedRegion(place, search.region) &&
    matchesSelectedCategory(place, search.category) &&
    tokens.every(token => matchesKeywordToken(place, token))
  ));
}

async function fetchAllPlacesForCategory({ keyword, category, displayCategory, signal }) {
  const places = [];
  let pageToken;

  do {
    const response = await fetchPlaces({
      keyword,
      category: getApiCategory(category),
      size: PLACE_FETCH_SIZE,
      pageToken,
      signal,
    });

    places.push(
      ...response.items.map(place => ({
        ...place,
        category: displayCategory || place.category,
      })),
    );
    pageToken = response.nextPageToken;
  } while (pageToken);

  return places;
}

function createSearchKeyword(search, category) {
  const keyword = String(search.keyword ?? '').trim();
  const regionLabel = getChungbukRegionLabel(search.region);
  const categoryKeyword = category === OLIVE_YOUNG_CATEGORY ? OLIVE_YOUNG_SEARCH_KEYWORD : '';

  return [
    search.region === 'ALL' ? '' : regionLabel,
    categoryKeyword,
    keyword,
  ].filter(Boolean).join(' ');
}

function fetchAllPlacesForSearchCategory({ search, category, signal }) {
  return fetchAllPlacesForCategory({
    keyword: createSearchKeyword(search, category),
    category,
    displayCategory: getDisplayCategory(category),
    signal,
  });
}

async function fetchAllPlaces({ search, signal }) {
  if (search.category !== 'ALL') {
    return fetchAllPlacesForSearchCategory({
      search,
      category: search.category,
      signal,
    });
  }

  const placeGroups = await Promise.all(
    SEARCH_CATEGORY_VALUES.map(category =>
      fetchAllPlacesForSearchCategory({
        search,
        category,
        signal,
      }),
    ),
  );

  return mergeUniquePlaces(placeGroups);
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const boundaryOverlayRef = useRef(null);
  const selectedRegionOverlayRef = useRef([]);
  const markerInstancesRef = useRef(new Map());
  const searchAbortControllerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapErrorMessage, setMapErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('ALL');
  const [region, setRegion] = useState('ALL');
  const [appliedSearch, setAppliedSearch] = useState(DEFAULT_SEARCH);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [visibleResultCount, setVisibleResultCount] = useState(RESULT_PAGE_SIZE);

  const selectedPlace =
    places.find(place => place.placeId === selectedPlaceId) || null;
  const visiblePlaces = places.slice(0, visibleResultCount);
  const hasMoreResults = visibleResultCount < places.length;

  const handleOpenDirections = useCallback(() => {
    if (!selectedPlace) {
      return;
    }

    const directionsWindow = window.open(
      createDirectionsUrl(selectedPlace),
      '_blank',
      'noopener,noreferrer',
    );

    if (directionsWindow) {
      directionsWindow.opener = null;
    }
  }, [selectedPlace]);

  const handleOpenPlaceDetail = useCallback(
    place => {
      if (!place?.placeId) {
        return;
      }

      navigate(`/map/places/${encodeURIComponent(place.placeId)}`);
    },
    [navigate],
  );

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

        boundaryOverlayRef.current = createBoundaryOverlays(mapInstanceRef.current);
        mapInstanceRef.current.fitBounds(createBoundaryBounds(), 44);

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
      clearBoundaryOverlays(boundaryOverlayRef.current);
      clearBoundaryOverlays(selectedRegionOverlayRef.current);
      boundaryOverlayRef.current = null;
      selectedRegionOverlayRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapInstanceRef.current) {
      return;
    }

    clearBoundaryOverlays(selectedRegionOverlayRef.current);
    selectedRegionOverlayRef.current = [];

    if (region === 'ALL') {
      if (!boundaryOverlayRef.current) {
        boundaryOverlayRef.current = createBoundaryOverlays(mapInstanceRef.current);
      }

      mapInstanceRef.current.fitBounds(createBoundaryBounds(), 44);
      return;
    }

    clearBoundaryOverlays(boundaryOverlayRef.current);
    boundaryOverlayRef.current = null;

    const selectedRegionPaths = CHUNGBUK_REGION_BOUNDARY_PATHS[region];

    if (!selectedRegionPaths) {
      return;
    }

    selectedRegionOverlayRef.current = createRegionBoundaryOverlays(
      mapInstanceRef.current,
      selectedRegionPaths,
    );
    mapInstanceRef.current.panTo(createPathsBounds(selectedRegionPaths).getCenter());
    mapInstanceRef.current.setZoom(SELECTED_REGION_BOUNDARY_STYLE.zoom);
  }, [mapStatus, region]);

  const handleSelectPlace = useCallback((place, scrollToResult = false) => {
    if (!place?.placeId) {
      return;
    }

    setSelectedPlaceId(place.placeId);

    const position = {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
    };

    if (Number.isFinite(position.lat) && Number.isFinite(position.lng)) {
      mapInstanceRef.current?.panTo(position);

      if ((mapInstanceRef.current?.getZoom() || 0) < 14) {
        mapInstanceRef.current?.setZoom(14);
      }
    }

    if (scrollToResult) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(`place-result-${place.placeId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, []);

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapInstanceRef.current) {
      return undefined;
    }

    const markerInstances = markerInstancesRef.current;

    markerInstances.forEach(marker => marker.setMap(null));
    markerInstances.clear();

    const bounds = new window.google.maps.LatLngBounds();
    let validPlaceCount = 0;

    places.forEach(place => {
      const position = {
        lat: Number(place.latitude),
        lng: Number(place.longitude),
      };

      if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
        return;
      }

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position,
        title: place.name || '장소',
        icon: createMarkerIcon(),
      });

      marker.addListener('click', () => handleSelectPlace(place, true));
      markerInstances.set(place.placeId, marker);
      bounds.extend(position);
      validPlaceCount += 1;
    });

    if (validPlaceCount === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(14);
    } else if (validPlaceCount > 1) {
      mapInstanceRef.current.fitBounds(bounds, 72);
    }

    return () => {
      markerInstances.forEach(marker => marker.setMap(null));
      markerInstances.clear();
    };
  }, [handleSelectPlace, mapStatus, places]);

  useEffect(() => {
    markerInstancesRef.current.forEach((marker, placeId) => {
      const isSelected = placeId === selectedPlaceId;

      marker.setIcon(createMarkerIcon(isSelected));
      marker.setZIndex(isSelected ? 1000 : undefined);
    });
  }, [selectedPlaceId]);

  const requestPlaces = useCallback(async ({ search }) => {
    searchAbortControllerRef.current?.abort();

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    setIsLoading(true);
    setPlaces([]);
    setSelectedPlaceId(null);
    setVisibleResultCount(RESULT_PAGE_SIZE);
    setSearchErrorMessage('');

    try {
      const responseItems = await fetchAllPlaces({
        search,
        signal: controller.signal,
      });
      const filteredItems = applyClientFilters(responseItems, search);

      setPlaces(filteredItems);
      setHasSearched(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setSearchErrorMessage(
        error instanceof Error ? error.message : '장소 검색 중 오류가 발생했습니다.',
      );
    } finally {
      if (searchAbortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      requestPlaces({ search: DEFAULT_SEARCH });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [requestPlaces]);

  useEffect(
    () => () => {
      searchAbortControllerRef.current?.abort();
    },
    [],
  );

  function handleSearchSubmit(event) {
    event.preventDefault();

    const nextSearch = {
      keyword: keyword.trim(),
      category,
      region,
    };

    setAppliedSearch(nextSearch);
    requestPlaces({ search: nextSearch });
  }

  function handleCategoryChange(nextCategory) {
    const nextSearch = {
      keyword: keyword.trim(),
      category: nextCategory,
      region,
    };

    setCategory(nextCategory);
    setAppliedSearch(nextSearch);
    requestPlaces({ search: nextSearch });
  }

  function handleRegionChange(nextRegion) {
    const nextSearch = {
      keyword: keyword.trim(),
      category,
      region: nextRegion,
    };

    setRegion(nextRegion);
    setAppliedSearch(nextSearch);
    requestPlaces({ search: nextSearch });
  }

  function handleRetry() {
    requestPlaces({ search: appliedSearch });
  }

  function handleLoadMore() {
    if (visibleResultCount < places.length) {
      setVisibleResultCount(currentCount =>
        Math.min(currentCount + RESULT_PAGE_SIZE, places.length),
      );
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
            <h1 className={styles.heroTitle}>충북 지도</h1>
            <p className={styles.heroDescription}>
              충북의 관광지, 음식점, 쇼핑 장소를 지도에서 찾아보세요.
            </p>
            <p className={styles.heroSubDescription}>Search places and plan your route in Chungbuk.</p>
          </motion.div>
        </motion.div>
      </section>

      <motion.div className={styles.content} variants={listStagger}>
        <motion.div className={styles.sidebar} variants={riseIn}>
          <PlaceSearchPanel
            keyword={keyword}
            category={category}
            region={region}
            isLoading={isLoading}
            onKeywordChange={setKeyword}
            onCategoryChange={handleCategoryChange}
            onRegionChange={handleRegionChange}
            onSubmit={handleSearchSubmit}
          />

          <PlaceResultList
            places={visiblePlaces}
            totalPlaceCount={places.length}
            selectedPlaceId={selectedPlaceId}
            isLoading={isLoading}
            errorMessage={searchErrorMessage}
            hasSearched={hasSearched}
            hasMoreResults={hasMoreResults}
            onSelectPlace={handleSelectPlace}
            onOpenPlaceDetail={handleOpenPlaceDetail}
            onRetry={handleRetry}
            onLoadMore={handleLoadMore}
          />
        </motion.div>

        <motion.div className={styles.mapColumn} variants={riseIn}>
          <div className={styles.mapCard}>
            <div
              ref={mapElementRef}
              className={styles.map}
              aria-label="충청북도 Google 지도"
            />

            {mapStatus !== 'ready' && (
              <div className={styles.mapState} role={mapStatus === 'error' ? 'alert' : 'status'}>
                {mapStatus === 'loading' ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    <strong>지도를 불러오고 있습니다.</strong>
                  </>
                ) : (
                  <>
                    <span className={styles.errorIcon} aria-hidden="true">
                      !
                    </span>
                    <strong>지도를 표시할 수 없습니다.</strong>
                    <p>{mapErrorMessage}</p>
                    <p className={styles.errorGuide}>
                      `.env`의 Google Maps API 키와 웹사이트 제한 설정을 확인해주세요.
                    </p>
                  </>
                )}
              </div>
            )}

            <SelectedPlaceCard
              place={selectedPlace}
              onOpenDirections={handleOpenDirections}
              onClear={() => setSelectedPlaceId(null)}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
