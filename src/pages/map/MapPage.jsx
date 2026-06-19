import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPlaces } from '../../api/placeApi';
import { importGoogleMapsLibrary } from '../../lib/googleMapsLoader';
import PlaceResultList from './components/PlaceResultList/PlaceResultList';
import PlaceSearchPanel from './components/PlaceSearchPanel/PlaceSearchPanel';
import SelectedPlaceCard from './components/SelectedPlaceCard/SelectedPlaceCard';
import styles from './MapPage.module.css';

const CHUNGBUK_CENTER = {
  lat: 36.6357,
  lng: 127.4917,
};

const DEFAULT_SEARCH = {
  keyword: '',
  category: 'ALL',
};

export default function MapPage() {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstancesRef = useRef(new Map());
  const searchAbortControllerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapErrorMessage, setMapErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('ALL');
  const [appliedSearch, setAppliedSearch] = useState(DEFAULT_SEARCH);
  const [places, setPlaces] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const selectedPlace =
    places.find(place => place.placeId === selectedPlaceId) || null;

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
    };
  }, []);

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

    places.forEach((place, index) => {
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
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '900',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#724598',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 12,
        },
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

      marker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: isSelected ? '#00aebb' : '#724598',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: isSelected ? 4 : 3,
        scale: isSelected ? 16 : 12,
      });
      marker.setZIndex(isSelected ? 1000 : undefined);
    });
  }, [selectedPlaceId]);

  const requestPlaces = useCallback(async ({ search, pageToken, append = false }) => {
    if (!append) {
      searchAbortControllerRef.current?.abort();
    }

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setPlaces([]);
      setNextPageToken(null);
      setSelectedPlaceId(null);
    }

    setSearchErrorMessage('');

    try {
      const response = await fetchPlaces({
        keyword: search.keyword,
        category: search.category,
        size: 10,
        pageToken,
        signal: controller.signal,
      });

      setPlaces(currentPlaces =>
        append ? [...currentPlaces, ...response.items] : response.items,
      );
      setNextPageToken(response.nextPageToken);
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
        setIsLoadingMore(false);
      }
    }
  }, []);

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
    };

    setAppliedSearch(nextSearch);
    requestPlaces({ search: nextSearch });
  }

  function handleCategoryChange(nextCategory) {
    const nextSearch = {
      keyword: keyword.trim(),
      category: nextCategory,
    };

    setCategory(nextCategory);
    setAppliedSearch(nextSearch);
    requestPlaces({ search: nextSearch });
  }

  function handleRetry() {
    requestPlaces({ search: appliedSearch });
  }

  function handleLoadMore() {
    if (!nextPageToken || isLoadingMore) {
      return;
    }

    requestPlaces({
      search: appliedSearch,
      pageToken: nextPageToken,
      append: true,
    });
  }

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <PlaceSearchPanel
            keyword={keyword}
            category={category}
            isLoading={isLoading}
            onKeywordChange={setKeyword}
            onCategoryChange={handleCategoryChange}
            onSubmit={handleSearchSubmit}
          />

          <PlaceResultList
            places={places}
            selectedPlaceId={selectedPlaceId}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            errorMessage={searchErrorMessage}
            hasSearched={hasSearched}
            nextPageToken={nextPageToken}
            onSelectPlace={handleSelectPlace}
            onRetry={handleRetry}
            onLoadMore={handleLoadMore}
          />
        </div>

        <div className={styles.mapColumn}>
          <div className={styles.mapHeader}>
            <div>
              <p className={styles.mapEyebrow}>GOOGLE MAPS</p>
              <h2>검색 장소 지도</h2>
            </div>
            <p>검색 목록이나 지도 마커를 선택해 길찾기 목적지를 지정할 수 있습니다.</p>
          </div>

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
              onClear={() => setSelectedPlaceId(null)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
