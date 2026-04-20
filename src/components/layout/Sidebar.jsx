import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, X } from "lucide-react";
import logo from '../../assets/leduB.png'

const menu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Requests", path: "/admin/requests", icon: FileText },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 overflow-y-auto`}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-slate-900 p-6 flex items-center justify-between border-b border-slate-700">
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">Ledu.</span>
        
          </div>
          <button
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-2 space-y-1 px-3 py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-4">Navigation</p>
          
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-500 to-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Text */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <div className="bg-gradient-to-r from-red-500/20 to-purple-600/20 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-300">Admin Dashboard v1.0</p>
            <p className="text-xs text-slate-400 mt-1">Ledu. Learning Platform</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;