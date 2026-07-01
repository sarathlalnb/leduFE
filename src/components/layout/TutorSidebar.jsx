import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, X, LogOut } from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/tutor/dashboard", icon: LayoutDashboard },
  { name: "Classes", path: "/tutor/classes", icon: CalendarDays },
];

const TutorSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed z-40 top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tutor portal</p>
            <div className="text-2xl font-semibold" style={{ fontFamily: "ExpressaSerial-Bold" }}>Ledu</div>
          </div>
          <button className="md:hidden p-2 hover:bg-slate-800 rounded-lg" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.name} to={item.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${isActive ? "bg-gradient-to-r from-red-500 to-purple-600 shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default TutorSidebar;
