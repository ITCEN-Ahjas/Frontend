import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPlaces } from '../../api/placeApi';
import { importGoogleMapsLibrary } from '../../lib/googleMapsLoader';
import PlaceResultList from './components/PlaceResultList/PlaceResultList';
import PlaceSearchPanel from './components/PlaceSearchPanel/PlaceSearchPanel';
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
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            errorMessage={searchErrorMessage}
            hasSearched={hasSearched}
            nextPageToken={nextPageToken}
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
            <p>검색 결과의 지도 마커와 목적지 선택은 다음 단계에서 연결됩니다.</p>
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
          </div>
        </div>
      </div>
    </section>
  );
}
