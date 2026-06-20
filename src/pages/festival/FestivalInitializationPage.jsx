import { useEffect, useState } from 'react';
import { ensureFestivalInitialized, fetchFestivalSyncStatus } from '../../api/festivalApi';
import styles from './FestivalInitializationPage.module.css';
import FestivalPage from './FestivalPage';

const INITIAL_STATE = {
  loading: true,
  status: null,
  errorMessage: '',
};

let initializationStatusRequest = null;

function mergeInitializationStatus(initializationResponse, statusResponse) {
  const mergedStatus = {
    ...(initializationResponse ?? {}),
    ...(statusResponse ?? {}),
  };

  return {
    ...mergedStatus,
    ready: mergedStatus.ready === true || mergedStatus.initialSyncPhase === 'READY',
  };
}

function requestInitializationStatus({ force = false } = {}) {
  if (!force && initializationStatusRequest) {
    return initializationStatusRequest;
  }

  const request = (async () => {
    const initializationResponse = await ensureFestivalInitialized();

    try {
      const statusResponse = await fetchFestivalSyncStatus();

      return mergeInitializationStatus(initializationResponse, statusResponse);
    } catch {
      return mergeInitializationStatus(initializationResponse, null);
    }
  })();

  if (!force) {
    initializationStatusRequest = request;

    request.then(
      () => {
        if (initializationStatusRequest === request) {
          initializationStatusRequest = null;
        }
      },
      () => {
        if (initializationStatusRequest === request) {
          initializationStatusRequest = null;
        }
      },
    );
  }

  return request;
}

function isReady(status) {
  return status?.ready === true || status?.initialSyncPhase === 'READY';
}

function getWaitingDescription(pauseReason) {
  if (pauseReason === 'DAILY_QUOTA_EXCEEDED') {
    return '오늘 관광 정보 API 호출 한도가 부족해 준비 작업을 잠시 멈췄습니다. 다음 자동 갱신 때 이어서 처리합니다.';
  }

  if (pauseReason === 'TOUR_API_ERROR') {
    return '관광 정보 서버 연결이 일시적으로 불안정합니다. 잠시 후 다시 확인해 주세요.';
  }

  if (pauseReason === 'SERVER_INTERRUPTED') {
    return '서버가 다시 시작되어 준비 작업이 잠시 중단되었습니다. 다음 실행에서 이어서 처리합니다.';
  }

  return '축제·체험 정보를 준비하고 있습니다.';
}

function getScreenContent({ loading, status, errorMessage }) {
  if (loading) {
    return {
      badge: '상태 확인 중',
      phase: 'INITIALIZING',
      title: '축제·체험 정보를 확인하고 있어요',
      description: '여행 정보를 안전하게 불러오는 중입니다. 잠시만 기다려 주세요.',
      showRetryButton: false,
    };
  }

  if (errorMessage) {
    return {
      badge: '확인 필요',
      phase: 'ERROR',
      title: '초기 적재 상태를 확인하지 못했어요',
      description: errorMessage,
      showRetryButton: true,
    };
  }

  if (status?.initialSyncExecutionStatus === 'WAITING') {
    return {
      badge: '준비 대기 중',
      phase: status.initialSyncPhase || 'WAITING',
      title: '축제·체험 정보를 준비하고 있어요',
      description: getWaitingDescription(status.initialSyncPauseReason),
      showRetryButton: true,
    };
  }

  if (status?.initialSyncExecutionStatus === 'FAILED') {
    return {
      badge: '준비 재시도 필요',
      phase: status.initialSyncPhase || 'FAILED',
      title: '축제·체험 정보 준비가 잠시 멈췄어요',
      description: '상태를 다시 확인하거나 잠시 후 다시 시도해 주세요.',
      showRetryButton: true,
    };
  }

  if (status?.initialSyncPhase === 'DETAIL_SYNCING') {
    return {
      badge: '상세 정보 준비 중',
      phase: 'DETAIL_SYNCING',
      title: '축제·체험의 자세한 정보를 정리하고 있어요',
      description: '여행지 설명과 이용 정보를 확인하고 있습니다. 잠시 후 목록을 보여드릴게요.',
      showRetryButton: false,
    };
  }

  if (status?.initialSyncPhase === 'IMAGE_SYNCING') {
    return {
      badge: '이미지 정보 준비 중',
      phase: 'IMAGE_SYNCING',
      title: '여행지 이미지를 확인하고 있어요',
      description: '장소별 사진 정보를 정리하고 있습니다. 잠시 후 목록을 보여드릴게요.',
      showRetryButton: false,
    };
  }

  return {
    badge: '목록 준비 중',
    phase: status?.initialSyncPhase || 'LIST_SYNCING',
    title: '충북 축제·체험 정보를 준비하고 있어요',
    description: '축제, 관광지, 문화시설, 레포츠 정보를 불러오고 있습니다. 잠시만 기다려 주세요.',
    showRetryButton: false,
  };
}

export default function FestivalInitializationPage() {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    let isMounted = true;

    requestInitializationStatus()
      .then(status => {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          status,
          errorMessage: '',
        });
      })
      .catch(error => {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          status: null,
          errorMessage: error.message || '축제·체험 초기 적재 상태를 확인하지 못했습니다.',
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const retryInitialization = () => {
    setState(previousState => ({
      ...previousState,
      loading: true,
      errorMessage: '',
    }));

    requestInitializationStatus({ force: true })
      .then(status => {
        setState({
          loading: false,
          status,
          errorMessage: '',
        });
      })
      .catch(error => {
        setState({
          loading: false,
          status: null,
          errorMessage: error.message || '축제·체험 초기 적재 상태를 확인하지 못했습니다.',
        });
      });
  };

  if (isReady(state.status)) {
    return <FestivalPage />;
  }

  const content = getScreenContent(state);

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        <span className={styles.badge}>{content.badge}</span>

        <div className={styles.phaseRow}>
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.phase}>{content.phase}</span>
        </div>

        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.description}>{content.description}</p>

        {content.showRetryButton && (
          <button
            className={styles.retryButton}
            type="button"
            onClick={retryInitialization}
            disabled={state.loading}
          >
            상태 다시 확인하기
          </button>
        )}
      </section>
    </main>
  );
}
