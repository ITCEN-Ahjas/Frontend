import { useEffect, useMemo, useRef, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { importGoogleMapsLibrary } from '../lib/googleMapsLoader';
import styles from './DetailLocationMap.module.css';

function toFiniteNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function getCssColor(variableName) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function createMarkerIcon() {
  const fillColor = getCssColor('--color-chungbuk-purple');
  const strokeColor = getCssColor('--color-white');

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 48 58">
        <ellipse cx="24" cy="53" rx="10.8" ry="3.4" fill="rgba(49, 46, 129, 0.32)"/>
        <path fill="${fillColor}" d="M24 1.5C12.7 1.5 3.6 10.4 3.6 21.5c0 14.2 15.9 26.7 19.4 33.5.4.8 1.6.8 2 0 3.5-6.8 19.4-19.3 19.4-33.5C44.4 10.4 35.3 1.5 24 1.5Z"/>
        <circle cx="24" cy="21" r="9.3" fill="${strokeColor}"/>
        <circle cx="24" cy="21" r="4.6" fill="${fillColor}"/>
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(36, 44),
    anchor: new window.google.maps.Point(18, 41),
  };
}

export default function DetailLocationMap({
  className = '',
  latitude,
  longitude,
  title,
  address,
}) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const [status, setStatus] = useState('loading');

  const position = useMemo(() => {
    const lat = toFiniteNumber(latitude);
    const lng = toFiniteNumber(longitude);

    if (lat === null || lng === null) {
      return null;
    }

    return { lat, lng };
  }, [latitude, longitude]);

  useEffect(() => {
    let isCancelled = false;

    async function initializeMap() {
      if (!position) {
        setStatus('unavailable');
        return;
      }

      try {
        const { Map } = await importGoogleMapsLibrary('maps');

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapElementRef.current, {
            center: position,
            zoom: 15,
            mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            cameraControl: false,
            clickableIcons: false,
            gestureHandling: 'cooperative',
          });
        }

        markerInstanceRef.current?.setMap(null);
        markerInstanceRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position,
          title: title || address || '',
          icon: createMarkerIcon(),
        });

        mapInstanceRef.current.setCenter(position);
        setStatus('ready');
      } catch {
        if (!isCancelled) {
          setStatus('error');
        }
      }
    }

    initializeMap();

    return () => {
      isCancelled = true;
    };
  }, [address, position, title]);

  useEffect(() => {
    return () => {
      markerInstanceRef.current?.setMap(null);
      markerInstanceRef.current = null;
    };
  }, []);

  return (
    <div className={`${styles.mapShell} ${className}`}>
      <div ref={mapElementRef} className={styles.mapCanvas} aria-hidden={status !== 'ready'} />

      {status !== 'ready' && (
        <div className={styles.mapFallback}>
          <FiMapPin className={styles.mapPin} aria-hidden="true" />
          <span>
            {status === 'unavailable'
              ? '지도 좌표 정보가 없습니다.'
              : 'Google Maps를 불러오는 중입니다.'}
          </span>
        </div>
      )}
    </div>
  );
}
