import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchResidenceCities,
  fetchTimeSlotOutfitRecommendations,
  normalizeCitySearchQuery,
  WeatherApiError,
} from '../api/weatherApi';

export const CHUNGBUK_REGIONS = [
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

export const RESIDENCE_COUNTRIES = [
  { code: 'JP', label: 'Japan' },
  { code: 'US', label: 'United States' },
  { code: 'CN', label: 'China' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'TH', label: 'Thailand' },
  { code: 'PH', label: 'Philippines' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
];

const DEFAULT_REGION = '청주';
const DEFAULT_COUNTRY_CODE = 'JP';
const CITY_SEARCH_DELAY = 350;
const AI_CACHE_REFRESH_DELAY = 4500;

const timeSlotRecommendationCache = new Map();
const pendingRecommendationRequests = new Map();
const residenceCitySearchCache = new Map();
const pendingCitySearchRequests = new Map();

function normalizeOutfitCard(card) {
  if (!card?.name) {
    throw new WeatherApiError('AI 옷차림 카드 응답 형식이 올바르지 않습니다.');
  }

  return {
    code: card.code || '',
    name: card.name,
    description: card.description || '',
  };
}

function normalizePreparationItem(item) {
  if (!item?.name) {
    return null;
  }

  return {
    code: item.code || item.name,
    name: item.name,
    description: item.description || '',
  };
}

function normalizeResidenceComparison(comparison) {
  if (!comparison) {
    return null;
  }

  return {
    residenceCity: comparison.residenceCity || '',
    residenceCountry: comparison.residenceCountry || '',
    residenceFeelsLikeTemperature: comparison.residenceFeelsLikeTemperature,
    targetFeelsLikeTemperature: comparison.targetFeelsLikeTemperature,
    temperatureDifference: comparison.temperatureDifference,
    message: comparison.message || '',
  };
}

function normalizeTimeSlotRecommendation(recommendation) {
  const outfitCards = recommendation?.outfitCards;

  if (
    !recommendation?.timeSlot ||
    !recommendation?.timeSlotName ||
    !recommendation?.currentWeather ||
    !recommendation?.feelsLikeWeather ||
    !outfitCards
  ) {
    throw new WeatherApiError('시간대별 옷차림 추천 응답 형식이 올바르지 않습니다.');
  }

  return {
    timeSlot: recommendation.timeSlot,
    timeSlotName: recommendation.timeSlotName,
    forecastAt: recommendation.forecastAt || null,
    startTime: recommendation.startTime || '',
    endTime: recommendation.endTime || '',
    currentWeather: recommendation.currentWeather,
    feelsLikeWeather: recommendation.feelsLikeWeather,
    outfitCards: {
      outerwear: normalizeOutfitCard(outfitCards.outerwear),
      top: normalizeOutfitCard(outfitCards.top),
      bottom: normalizeOutfitCard(outfitCards.bottom),
      shoes: normalizeOutfitCard(outfitCards.shoes),
    },
    preparationItems: Array.isArray(recommendation.preparationItems)
      ? recommendation.preparationItems.map(normalizePreparationItem).filter(Boolean)
      : [],
    residenceComparison: normalizeResidenceComparison(recommendation.residenceComparison),
  };
}

function normalizeResidenceWeather(residenceWeather) {
  if (!residenceWeather) {
    return null;
  }

  return {
    city: residenceWeather.city || '',
    country: residenceWeather.country || '',
    countryCode: residenceWeather.countryCode || '',
    admin1: residenceWeather.admin1 || '',
    latitude: residenceWeather.latitude,
    longitude: residenceWeather.longitude,
    observedAt: residenceWeather.observedAt || null,
    temperature: residenceWeather.temperature,
    feelsLikeTemperature: residenceWeather.feelsLikeTemperature,
    weatherCondition: residenceWeather.weatherCondition || '',
  };
}

function normalizeTimeSlotPayload(payload) {
  if (!payload?.region || !Array.isArray(payload?.recommendations)) {
    throw new WeatherApiError('시간대별 옷차림 추천 응답 형식이 올바르지 않습니다.');
  }

  const recommendations = payload.recommendations.map(normalizeTimeSlotRecommendation);

  if (recommendations.length === 0) {
    throw new WeatherApiError('표시할 시간대별 옷차림 추천이 없습니다.');
  }

  return {
    region: payload.region,
    updatedAt: payload.updatedAt || null,
    forecastDate: payload.forecastDate || null,
    source: payload.source || 'fallback',
    residenceWeather: normalizeResidenceWeather(payload.residenceWeather),
    recommendations,
  };
}

function normalizeResidenceCity(city) {
  if (!city?.city || !city?.countryCode) {
    return null;
  }

  return {
    city: city.city,
    country: city.country || '',
    countryCode: city.countryCode,
    admin1: city.admin1 || '',
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

function normalizeResidenceCities(payload) {
  if (!Array.isArray(payload)) {
    throw new WeatherApiError('도시 검색 응답 형식이 올바르지 않습니다.');
  }

  const seen = new Set();

  return payload
    .map(normalizeResidenceCity)
    .filter(Boolean)
    .filter(city => {
      const key = `${city.city}|${city.countryCode}|${city.latitude}|${city.longitude}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function createRecommendationCacheKey(region, residenceCity) {
  if (!residenceCity) {
    return `${region}|without-residence-city`;
  }

  return `${region}|${residenceCity.countryCode}|${residenceCity.city}`;
}

function requestTimeSlotRecommendation(region, residenceCity, forceRefresh) {
  const cacheKey = createRecommendationCacheKey(region, residenceCity);

  if (!forceRefresh && timeSlotRecommendationCache.has(cacheKey)) {
    return Promise.resolve(timeSlotRecommendationCache.get(cacheKey));
  }

  if (!forceRefresh && pendingRecommendationRequests.has(cacheKey)) {
    return pendingRecommendationRequests.get(cacheKey);
  }

  const requestPromise = fetchTimeSlotOutfitRecommendations({
    region,
    residenceCity: residenceCity?.city,
    residenceCountryCode: residenceCity?.countryCode,
  })
    .then(normalizeTimeSlotPayload)
    .then(data => {
      timeSlotRecommendationCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      pendingRecommendationRequests.delete(cacheKey);
    });

  pendingRecommendationRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

function requestResidenceCities(countryCode, query) {
  const normalizedQuery = normalizeCitySearchQuery(query);
  const cacheKey = `${countryCode}|${normalizedQuery.replace(/\s/g, '').toLocaleLowerCase()}`;

  if (residenceCitySearchCache.has(cacheKey)) {
    return Promise.resolve(residenceCitySearchCache.get(cacheKey));
  }

  if (pendingCitySearchRequests.has(cacheKey)) {
    return pendingCitySearchRequests.get(cacheKey);
  }

  const requestPromise = fetchResidenceCities({ countryCode, query: normalizedQuery })
    .then(normalizeResidenceCities)
    .then(cities => {
      residenceCitySearchCache.set(cacheKey, cities);
      return cities;
    })
    .finally(() => {
      pendingCitySearchRequests.delete(cacheKey);
    });

  pendingCitySearchRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

function collectDailyPreparationItems(recommendations) {
  const itemMap = new Map();

  recommendations.forEach(recommendation => {
    recommendation.preparationItems.forEach(item => {
      if (!itemMap.has(item.code)) {
        itemMap.set(item.code, item);
      }
    });
  });

  return Array.from(itemMap.values());
}

export function useOutfitRecommendation() {
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_REGION);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [residenceCountryCode, setResidenceCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [residenceCityQuery, setResidenceCityQuery] = useState('');
  const [residenceCityOptions, setResidenceCityOptions] = useState([]);
  const [selectedResidenceCity, setSelectedResidenceCity] = useState(null);
  const [citySearchState, setCitySearchState] = useState({
    status: 'idle',
    error: '',
  });

  const [recommendationState, setRecommendationState] = useState({
    status: 'loading',
    data: null,
    error: '',
  });

  const requestVersionRef = useRef(0);
  const aiRefreshAttemptedRef = useRef(new Set());

  const loadRecommendations = useCallback(async (region, residenceCity, { forceRefresh = false } = {}) => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    const cacheKey = createRecommendationCacheKey(region, residenceCity);
    const cachedData = timeSlotRecommendationCache.get(cacheKey);

    if (cachedData && !forceRefresh) {
      setRecommendationState({
        status: 'success',
        data: cachedData,
        error: '',
      });
      return;
    }

    setRecommendationState(previousState => ({
      status: 'loading',
      data: previousState.data,
      error: '',
    }));

    try {
      const data = await requestTimeSlotRecommendation(region, residenceCity, forceRefresh);

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setRecommendationState({
        status: 'success',
        data,
        error: '',
      });
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setRecommendationState(previousState => ({
        status: 'error',
        data: previousState.data,
        error: error.message || '시간대별 옷차림 추천을 불러오지 못했습니다.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadRecommendations(selectedRegion, selectedResidenceCity);
  }, [loadRecommendations, selectedRegion, selectedResidenceCity]);

  useEffect(() => {
    const query = residenceCityQuery.trim();

    if (
      query.length < 2 ||
      (selectedResidenceCity &&
        selectedResidenceCity.city === query &&
        selectedResidenceCity.countryCode === residenceCountryCode)
    ) {
      setResidenceCityOptions([]);
      setCitySearchState({ status: 'idle', error: '' });
      return undefined;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      setCitySearchState({ status: 'loading', error: '' });

      void requestResidenceCities(residenceCountryCode, query)
        .then(cities => {
          if (isCancelled) {
            return;
          }

          setResidenceCityOptions(cities);
          setCitySearchState({ status: 'success', error: '' });
        })
        .catch(error => {
          if (isCancelled) {
            return;
          }

          setResidenceCityOptions([]);
          setCitySearchState({
            status: 'error',
            error: error.message || '도시 검색에 실패했습니다.',
          });
        });
    }, CITY_SEARCH_DELAY);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [residenceCityQuery, residenceCountryCode, selectedResidenceCity]);

  const batchData =
    recommendationState.data?.region === selectedRegion ? recommendationState.data : null;

  useEffect(() => {
    if (!batchData?.recommendations?.length) {
      return;
    }

    const hasSelectedSlot = batchData.recommendations.some(
      recommendation => recommendation.timeSlot === selectedTimeSlot,
    );

    if (!hasSelectedSlot) {
      setSelectedTimeSlot(batchData.recommendations[0].timeSlot);
    }
  }, [batchData, selectedTimeSlot]);

  useEffect(() => {
    if (!batchData || batchData.source !== 'fallback') {
      return undefined;
    }

    const cacheKey = createRecommendationCacheKey(selectedRegion, selectedResidenceCity);

    if (aiRefreshAttemptedRef.current.has(cacheKey)) {
      return undefined;
    }

    aiRefreshAttemptedRef.current.add(cacheKey);

    const timeoutId = window.setTimeout(() => {
      void loadRecommendations(selectedRegion, selectedResidenceCity, { forceRefresh: true });
    }, AI_CACHE_REFRESH_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [batchData, loadRecommendations, selectedRegion, selectedResidenceCity]);

  const selectRegion = useCallback(region => {
    if (!CHUNGBUK_REGIONS.includes(region)) {
      return;
    }

    setSelectedRegion(region);
    setSelectedTimeSlot(null);
  }, []);

  const selectTimeSlot = useCallback(timeSlot => {
    setSelectedTimeSlot(timeSlot);
  }, []);

  const selectResidenceCountry = useCallback(countryCode => {
    if (!RESIDENCE_COUNTRIES.some(country => country.code === countryCode)) {
      return;
    }

    setResidenceCountryCode(countryCode);
    setResidenceCityQuery('');
    setResidenceCityOptions([]);
    setSelectedResidenceCity(null);
    setCitySearchState({ status: 'idle', error: '' });
  }, []);

  const changeResidenceCityQuery = useCallback(query => {
    setResidenceCityQuery(query);
    setResidenceCityOptions([]);
    setSelectedResidenceCity(null);
  }, []);

  const selectResidenceCity = useCallback(city => {
    if (!city?.city || !city?.countryCode) {
      return;
    }

    setSelectedResidenceCity(city);
    setResidenceCountryCode(city.countryCode);
    setResidenceCityQuery(city.city);
    setResidenceCityOptions([]);
    setCitySearchState({ status: 'idle', error: '' });
  }, []);

  const retryRecommendations = useCallback(() => {
    void loadRecommendations(selectedRegion, selectedResidenceCity, {
      forceRefresh: true,
    });
  }, [loadRecommendations, selectedRegion, selectedResidenceCity]);

  const activeRecommendation =
    batchData?.recommendations.find(recommendation => recommendation.timeSlot === selectedTimeSlot) ||
    batchData?.recommendations[0] ||
    null;

  const dailyPreparationItems = useMemo(
    () => collectDailyPreparationItems(batchData?.recommendations || []),
    [batchData],
  );

  return useMemo(
    () => ({
      regions: CHUNGBUK_REGIONS,
      residenceCountries: RESIDENCE_COUNTRIES,

      selectedRegion,
      selectedTimeSlot,
      selectedResidenceCity,
      residenceCountryCode,
      residenceCityQuery,
      residenceCityOptions,
      citySearchError: citySearchState.error,
      isCitySearchLoading: citySearchState.status === 'loading',

      batchData,
      activeRecommendation,
      dailyPreparationItems,

      isRecommendationsLoading: recommendationState.status === 'loading',
      isRefreshing: recommendationState.status === 'loading' && Boolean(batchData),
      recommendationsError: recommendationState.error,

      selectRegion,
      selectTimeSlot,
      selectResidenceCountry,
      changeResidenceCityQuery,
      selectResidenceCity,
      retryRecommendations,
    }),
    [
      activeRecommendation,
      batchData,
      changeResidenceCityQuery,
      citySearchState.error,
      dailyPreparationItems,
      recommendationState.error,
      recommendationState.status,
      residenceCityOptions,
      residenceCityQuery,
      residenceCountryCode,
      selectRegion,
      selectResidenceCity,
      selectResidenceCountry,
      selectTimeSlot,
      selectedRegion,
      selectedResidenceCity,
      selectedTimeSlot,
      retryRecommendations,
    ],
  );
}
