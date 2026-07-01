import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import TutorSidebar from "./TutorSidebar";

const TutorLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TutorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-500 ease-out ${isMobile ? "ml-0" : "ml-80"} min-h-screen`}>
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-purple-600">Tutor dashboard</p>
              <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "ExpressaSerial-Bold" }}>Ledu</h2>
            </div>
            <button
              className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TutorLayout;
