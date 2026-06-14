import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./shared/components/Header";
import FloatingChatbot from "./shared/components/FloatingChatbot";
import LodgingPage from "./domain/lodging/LodgingPage";
import "./App.css";

// 팀원 페이지 완성되면 여기에 import 추가
// import MapPage from "./domain/map/MapPage";
// import FestivalPage from "./domain/festival/FestivalPage";
// import CoursePage from "./domain/course/CoursePage";
// import ClothingPage from "./domain/clothing/ClothingPage";

function Placeholder({ title }) {
  return (
    <div className="placeholder">
      <div className="placeholder-inner">
        <p className="placeholder-icon">🚧</p>
        <h2 className="placeholder-title">{title}</h2>
        <p className="placeholder-desc">준비 중인 페이지입니다.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("ko");

  return (
    <BrowserRouter>
      <div className="app-root">
        {/* 언어 전환 버튼 */}
        <div className="lang-switcher">
          <button
            type="button"
            onClick={() => setLang("ko")}
            className={`lang-btn ${lang === "ko" ? "lang-btn--active-ko" : ""}`}
          >
            KO
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`lang-btn ${lang === "en" ? "lang-btn--active-en" : ""}`}
          >
            EN
          </button>
        </div>

        {/* 공통 헤더 */}
        <Header lang={lang} />

        {/* 페이지 라우팅 */}
        <Routes>
          <Route path="/" element={<Placeholder title="메인 페이지" />} />
          <Route
            path="/guide"
            element={<Placeholder title="사용설명서 페이지" />}
          />
          <Route path="/map" element={<Placeholder title="지도 페이지" />} />
          <Route
            path="/festival"
            element={<Placeholder title="체험·축제 페이지" />}
          />
          <Route path="/lodging" element={<LodgingPage />} />
          <Route
            path="/course"
            element={<Placeholder title="AI 추천 페이지" />}
          />
          <Route
            path="/clothing"
            element={<Placeholder title="날씨 의류 페이지" />}
          />
        </Routes>

        {/* 플로팅 챗봇 */}
        <FloatingChatbot lang={lang} />
      </div>
    </BrowserRouter>
  );
}
