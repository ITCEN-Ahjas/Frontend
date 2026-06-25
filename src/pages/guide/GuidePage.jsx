import { FiInfo } from 'react-icons/fi';

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[var(--color-page-bg)] pt-24">
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <FiInfo className="mx-auto mb-4 text-[3rem]" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-950 mb-2">사용설명서 페이지</h2>
          <p className="text-sm text-slate-400">준비 중인 페이지입니다.</p>
        </div>
      </div>
    </main>
  );
}
