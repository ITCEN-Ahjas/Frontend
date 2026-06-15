import Header from '../Header';

export default function PageLayout({
  children,
  className = '',
  contentClassName = '',
  lang = 'ko',
}) {
  return (
    <>
      <Header lang={lang} />

      <main className={`mx-auto w-full max-w-[154rem] pt-[8rem] ${className}`}>
        <div className={`px-[2.4rem] sm:px-[3.2rem] lg:px-[5.6rem] ${contentClassName}`}>
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex w-full max-w-[154rem] flex-col gap-4 px-[2.4rem] sm:px-[3.2rem] lg:px-[5.6rem] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">
            © 2026 Chungbuk Travel. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>문의: info@chungbuk.travel</span>
            <span>서울특별시</span>
          </div>
        </div>
      </footer>
    </>
  );
}
