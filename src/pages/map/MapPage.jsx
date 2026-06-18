import { useEffect, useRef, useState } from 'react';
import { importGoogleMapsLibrary } from '../../lib/googleMapsLoader';
import styles from './MapPage.module.css';

const CHUNGBUK_CENTER = {
  lat: 36.6357,
  lng: 127.4917,
};

export default function MapPage() {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

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

        setErrorMessage(
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

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>CHUNGBUK MAP</p>
          <h1 className={styles.title}>충북 지도 검색</h1>
          <p className={styles.description}>
            충청북도의 관광지, 음식점, 쇼핑 장소를 검색하고 원하는 목적지까지의 경로를
            확인할 수 있습니다.
          </p>
        </header>

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
                  <p>{errorMessage}</p>
                  <p className={styles.errorGuide}>
                    `.env`의 Google Maps API 키와 웹사이트 제한 설정을 확인해주세요.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
