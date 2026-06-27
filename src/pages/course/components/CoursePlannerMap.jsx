import { useEffect, useMemo, useRef, useState } from 'react';
import { FiMap, FiMapPin } from 'react-icons/fi';
import { importGoogleMapsLibrary } from '../../../lib/googleMapsLoader';
import { CHUNGBUK_CENTER } from '../coursePlannerConfig';
import { getMappablePlaces } from '../courseRecommendationNormalizer';
import styles from '../CoursePage.module.css';

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

function getPlaceDetails(service, placeId) {
  return new Promise(resolve => {
    service.getDetails(
      {
        placeId,
        fields: ['geometry'],
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

function mergeResolvedCoordinates(place, coordinates) {
  if (place.latitude !== null && place.longitude !== null) {
    return place;
  }

  if (!coordinates) {
    return place;
  }

  return {
    ...place,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
}

export default function CoursePlannerMap({ result, selectedPlaceId, onSelectPlace }) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstancesRef = useRef(new Map());
  const routeLineRef = useRef(null);
  const coordinateResolveAttemptRef = useRef(new Set());
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapErrorMessage, setMapErrorMessage] = useState('');
  const [coordinateState, setCoordinateState] = useState({
    signature: '',
    values: {},
  });
  const places = useMemo(() => result?.itinerary || [], [result?.itinerary]);
  const placeSignature = useMemo(
    () => places.map(place => `${place.placeId}:${place.latitude}:${place.longitude}`).join('|'),
    [places],
  );
  const resolvedCoordinates = useMemo(
    () => (coordinateState.signature === placeSignature ? coordinateState.values : {}),
    [coordinateState, placeSignature],
  );
  const resolvedPlaces = useMemo(
    () => places.map(place => mergeResolvedCoordinates(place, resolvedCoordinates[place.placeId])),
    [places, resolvedCoordinates],
  );
  const mappablePlaces = useMemo(() => getMappablePlaces(resolvedPlaces), [resolvedPlaces]);

  useEffect(() => {
    coordinateResolveAttemptRef.current.clear();
  }, [placeSignature]);

  useEffect(() => {
    let isCancelled = false;
    const markerInstances = markerInstancesRef.current;

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
      markerInstances.forEach(marker => marker.setMap(null));
      markerInstances.clear();
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
        (place.latitude === null || place.longitude === null) &&
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
        setCoordinateState(previous => ({
          signature: placeSignature,
          values: {
            ...(previous.signature === placeSignature ? previous.values : {}),
            ...nextCoordinates,
          },
        }));
      }
    }

    resolveMissingCoordinates();

    return () => {
      isCancelled = true;
    };
  }, [mapStatus, placeSignature, places, resolvedCoordinates]);

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
