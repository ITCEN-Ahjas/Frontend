import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ClothingPage from './pages/clothing/ClothingPage';
import CoursePage from './pages/course/CoursePage';
import FestivalPage from './pages/festival/FestivalPage';
import GuidePage from './pages/guide/GuidePage';
import LodgingPage from './pages/lodging/LodgingPage';
import MainPage from './pages/main/MainPage';
import MapPage from './pages/map/MapPage';
import FloatingChatbot from './shared/components/FloatingChatbot';
import PageLayout from './shared/components/common/PageLayout';

export default function App() {
  const [lang, setLang] = useState('ko');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f5f8fb]">
        <div className="absolute right-7 top-24 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={() => setLang('ko')}
            className={`rounded-full px-4 py-2 text-xs font-black transition ${
              lang === 'ko' ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-500'
            }`}
          >
            KO
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`rounded-full px-4 py-2 text-xs font-black transition ${
              lang === 'en' ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-500'
            }`}
          >
            EN
          </button>
        </div>

        <PageLayout lang={lang}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/festival" element={<FestivalPage />} />
            <Route path="/lodging" element={<LodgingPage />} />
            <Route path="/course" element={<CoursePage />} />
            <Route path="/clothing" element={<ClothingPage />} />
          </Routes>
        </PageLayout>

        <FloatingChatbot lang={lang} />
      </div>
    </BrowserRouter>
  );
}
