import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchOutfitRecommendation, fetchWeatherRegions, WeatherApiError } from '../api/weatherApi';

export const TRAVEL_STYLES = [
  '기본 추천',
  '많이 걷는 여행',
  '야외 활동',
  '실내 중심',
  '야간 일정',
  '비 오는 날 대비',
];

const INITIAL_REGIONS_STATE = {
  status: 'loading',
  data: [],
  error: '',
};

const INITIAL_RECOMMENDATIONS_STATE = {
  status: 'idle',
  data: {},
  error: '',
};

function normalizeOutfitCard(card) {
  if (!card?.name) {
    throw new WeatherApiError('AI 옷차림 카드 응답 형식이 올바르지 않습니다.');
  }

  return {
    name: card.name,
    description: card.description || '',
  };
}

function normalizeRecommendation(payload) {
  const outfitCards = payload?.outfitCards;

  if (!payload?.region || !payload?.currentWeather || !payload?.feelsLikeWeather || !outfitCards) {
    throw new WeatherApiError('AI 옷차림 추천 응답 형식이 올바르지 않습니다.');
  }

  return {
    region: payload.region,
    updatedAt: payload.updatedAt || null,
    travelStyle: payload.travelStyle || '기본 추천',
    currentWeather: payload.currentWeather,
    feelsLikeWeather: payload.feelsLikeWeather,
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

export function useOutfitRecommendation() {
  const [regionsState, setRegionsState] = useState(INITIAL_REGIONS_STATE);

  const [recommendationsState, setRecommendationsState] = useState(INITIAL_RECOMMENDATIONS_STATE);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTravelStyle, setSelectedTravelStyle] = useState(TRAVEL_STYLES[0]);
  const [regionsRequestVersion, setRegionsRequestVersion] = useState(0);

  const recommendationsAbortControllerRef = useRef(null);
  const regionCacheRef = useRef(new Map());

  const preloadRegionRecommendations = useCallback(
    async (region, { forceRefresh = false } = {}) => {
      const cachedRecommendations = regionCacheRef.current.get(region);

      if (cachedRecommendations && !forceRefresh) {
        setRecommendationsState({
          status: 'success',
          data: cachedRecommendations,
          error: '',
        });
        return;
      }

      recommendationsAbortControllerRef.current?.abort();

      const controller = new AbortController();
      recommendationsAbortControllerRef.current = controller;

      setRecommendationsState({
        status: 'loading',
        data: {},
        error: '',
      });

      const results = await Promise.allSettled(
        TRAVEL_STYLES.map(async travelStyle => {
          const payload = await fetchOutfitRecommendation(
            {
              region,
              travelStyle,
            },
            {
              signal: controller.signal,
            },
          );

          return {
            travelStyle,
            recommendation: normalizeRecommendation(payload),
          };
        }),
      );

      if (controller.signal.aborted) {
        return;
      }

      const nextRecommendations = {};
      const failedTravelStyles = [];

      results.forEach((result, index) => {
        const travelStyle = TRAVEL_STYLES[index];

        if (result.status === 'fulfilled') {
          nextRecommendations[result.value.travelStyle] = result.value.recommendation;
          return;
        }

        failedTravelStyles.push(travelStyle);
      });

      if (Object.keys(nextRecommendations).length === 0) {
        setRecommendationsState({
          status: 'error',
          data: {},
          error: 'AI 옷차림 추천을 불러오지 못했습니다.',
        });
        return;
      }

      if (failedTravelStyles.length === 0) {
        regionCacheRef.current.set(region, nextRecommendations);

        setRecommendationsState({
          status: 'success',
          data: nextRecommendations,
          error: '',
        });
        return;
      }

      setRecommendationsState({
        status: 'partial',
        data: nextRecommendations,
        error: `${failedTravelStyles.join(', ')} 추천을 불러오지 못했습니다.`,
      });
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchWeatherRegions({
      signal: controller.signal,
    })
      .then(regions => {
        if (controller.signal.aborted) {
          return;
        }

        setRegionsState({
          status: 'success',
          data: regions,
          error: '',
        });
      })
      .catch(error => {
        if (controller.signal.aborted || error.name === 'AbortError') {
          return;
        }

        setRegionsState({
          status: 'error',
          data: [],
          error: error.message || '충북 지역 목록을 불러오지 못했습니다.',
        });
      });

    return () => controller.abort();
  }, [regionsRequestVersion]);

  useEffect(() => {
    return () => {
      recommendationsAbortControllerRef.current?.abort();
    };
  }, []);

  const selectRegion = useCallback(
    region => {
      if (!region || region === selectedRegion) {
        return;
      }

      setSelectedRegion(region);
      void preloadRegionRecommendations(region);
    },
    [preloadRegionRecommendations, selectedRegion],
  );

  const selectTravelStyle = useCallback(travelStyle => {
    if (!travelStyle) {
      return;
    }

    setSelectedTravelStyle(travelStyle);
  }, []);

  const retryRegions = useCallback(() => {
    setRegionsState({
      status: 'loading',
      data: [],
      error: '',
    });

    setRegionsRequestVersion(previousVersion => previousVersion + 1);
  }, []);

  const retryRecommendations = useCallback(() => {
    if (!selectedRegion) {
      return;
    }

    void preloadRegionRecommendations(selectedRegion, {
      forceRefresh: true,
    });
  }, [preloadRegionRecommendations, selectedRegion]);

  const activeRecommendation = recommendationsState.data[selectedTravelStyle] || null;

  const weatherRecommendation =
    activeRecommendation ||
    recommendationsState.data[TRAVEL_STYLES[0]] ||
    Object.values(recommendationsState.data)[0] ||
    null;

  return useMemo(
    () => ({
      regions: regionsState.data,
      selectedRegion,
      selectedTravelStyle,

      activeRecommendation,
      weatherRecommendation,
      recommendationsByStyle: recommendationsState.data,

      isRegionsLoading: regionsState.status === 'loading',
      isRecommendationsLoading: recommendationsState.status === 'loading',

      regionsError: regionsState.error,
      recommendationsError: recommendationsState.error,

      selectRegion,
      selectTravelStyle,
      retryRegions,
      retryRecommendations,
    }),
    [
      regionsState,
      recommendationsState,
      selectedRegion,
      selectedTravelStyle,
      activeRecommendation,
      weatherRecommendation,
      selectRegion,
      selectTravelStyle,
      retryRegions,
      retryRecommendations,
    ],
  );
}
