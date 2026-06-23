import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchBatchOutfitRecommendations, WeatherApiError } from '../api/weatherApi';

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

export const TRAVEL_STYLES = [
  '기본 추천',
  '많이 걷는 여행',
  '야외 활동',
  '실내 중심',
  '야간 일정',
  '비 오는 날 대비',
];

const DEFAULT_REGION = '청주';

const regionBatchCache = new Map();
const pendingRegionRequests = new Map();

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

function normalizeRecommendation(payload, region, travelStyle, source) {
  const outfitCards = payload?.outfitCards;

  if (!outfitCards) {
    throw new WeatherApiError('AI 옷차림 추천 응답 형식이 올바르지 않습니다.');
  }

  return {
    region: payload.region || region,
    travelStyle: payload.travelStyle || travelStyle,
    source: payload.source || source || 'fallback',
    outfitCards: {
      outerwear: normalizeOutfitCard(outfitCards.outerwear),
      top: normalizeOutfitCard(outfitCards.top),
      bottom: normalizeOutfitCard(outfitCards.bottom),
      shoes: normalizeOutfitCard(outfitCards.shoes),
    },
    preparationItems: Array.isArray(payload.preparationItems)
      ? payload.preparationItems.slice(0, 4)
      : [],
  };
}

function normalizeBatchPayload(payload) {
  if (
    !payload?.region ||
    !payload?.currentWeather ||
    !payload?.feelsLikeWeather ||
    !payload?.recommendations
  ) {
    throw new WeatherApiError('배치 옷차림 추천 응답 형식이 올바르지 않습니다.');
  }

  const recommendations = {};

  TRAVEL_STYLES.forEach(travelStyle => {
    const recommendation = payload.recommendations[travelStyle];

    if (!recommendation) {
      throw new WeatherApiError(`${travelStyle} 추천 결과가 없습니다.`);
    }

    recommendations[travelStyle] = normalizeRecommendation(
      recommendation,
      payload.region,
      travelStyle,
      payload.source,
    );
  });

  return {
    region: payload.region,
    updatedAt: payload.updatedAt || null,
    source: payload.source || 'fallback',
    currentWeather: payload.currentWeather,
    feelsLikeWeather: payload.feelsLikeWeather,
    recommendations,
  };
}

function requestBatchRecommendation(region, forceRefresh) {
  if (!forceRefresh && regionBatchCache.has(region)) {
    return Promise.resolve(regionBatchCache.get(region));
  }

  if (!forceRefresh && pendingRegionRequests.has(region)) {
    return pendingRegionRequests.get(region);
  }

  const requestPromise = fetchBatchOutfitRecommendations({ region })
    .then(normalizeBatchPayload)
    .then(batchData => {
      regionBatchCache.set(region, batchData);
      return batchData;
    })
    .finally(() => {
      pendingRegionRequests.delete(region);
    });

  pendingRegionRequests.set(region, requestPromise);

  return requestPromise;
}

export function useOutfitRecommendation() {
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_REGION);

  const [selectedTravelStyle, setSelectedTravelStyle] = useState(TRAVEL_STYLES[0]);

  const [batchState, setBatchState] = useState({
    status: 'loading',
    data: null,
    error: '',
  });

  const requestVersionRef = useRef(0);

  const loadRegionRecommendation = useCallback(async (region, { forceRefresh = false } = {}) => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    const cachedData = regionBatchCache.get(region);

    if (cachedData && !forceRefresh) {
      setBatchState({
        status: 'success',
        data: cachedData,
        error: '',
      });
      return;
    }

    setBatchState(previousState => ({
      status: 'loading',
      data: previousState.data,
      error: '',
    }));

    try {
      const batchData = await requestBatchRecommendation(region, forceRefresh);

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setBatchState({
        status: 'success',
        data: batchData,
        error: '',
      });
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setBatchState(previousState => ({
        status: 'error',
        data: previousState.data,
        error: error.message || 'AI 옷차림 추천을 불러오지 못했습니다.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadRegionRecommendation(selectedRegion);
  }, [loadRegionRecommendation, selectedRegion]);

  const selectRegion = useCallback(
    region => {
      if (!CHUNGBUK_REGIONS.includes(region)) {
        return;
      }

      if (region === selectedRegion) {
        return;
      }

      setSelectedRegion(region);
      setSelectedTravelStyle(TRAVEL_STYLES[0]);
    },
    [selectedRegion],
  );

  const selectTravelStyle = useCallback(travelStyle => {
    if (!TRAVEL_STYLES.includes(travelStyle)) {
      return;
    }

    setSelectedTravelStyle(travelStyle);
  }, []);

  const retryRecommendations = useCallback(() => {
    void loadRegionRecommendation(selectedRegion, {
      forceRefresh: true,
    });
  }, [loadRegionRecommendation, selectedRegion]);

  const batchData = batchState.data?.region === selectedRegion ? batchState.data : null;

  const activeRecommendation = batchData?.recommendations[selectedTravelStyle] || null;

  return useMemo(
    () => ({
      regions: CHUNGBUK_REGIONS,
      selectedRegion,
      selectedTravelStyle,

      batchData,
      activeRecommendation,
      recommendationsByStyle: batchData?.recommendations || {},

      isRecommendationsLoading: batchState.status === 'loading',
      isRefreshing: batchState.status === 'loading' && Boolean(batchData),

      recommendationsError: batchState.error,

      selectRegion,
      selectTravelStyle,
      retryRecommendations,
    }),
    [
      activeRecommendation,
      batchData,
      batchState.error,
      batchState.status,
      selectedRegion,
      selectedTravelStyle,
      selectRegion,
      selectTravelStyle,
      retryRecommendations,
    ],
  );
}
