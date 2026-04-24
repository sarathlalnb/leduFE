import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, FileText, ClipboardList, X, Award, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import logo from '../../assets/leduW.png'

const menu = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard, color: "from-blue-500 to-cyan-500", description: "Overview & stats" },
  { name: "Classes", path: "/student/classes", icon: BookOpen, color: "from-green-500 to-emerald-500", description: "Scheduled classes" },
  { name: "Requests", path: "/student/requests", icon: FileText, color: "from-orange-500 to-red-500", description: "Your requests" },
  { name: "Tests", path: "/student/tests", icon: ClipboardList, color: "from-purple-500 to-pink-500", description: "Test results" },
];

const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Mock stats for interactive elements
  const stats = {
    completedClasses: 24,
    averageScore: 85,
    pendingRequests: 2,
    upcomingTests: 3
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-500 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${isOpen ? "shadow-2xl" : "shadow-lg"}`}
      >

        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img className="w-25" src={logo} alt="" />
              <div>
              
            
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Classes</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{stats.completedClasses}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">Avg Score</span>
              </div>
              <p className="text-lg font-bold text-green-900">{stats.averageScore}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-xl border border-orange-100/50">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Requests</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{stats.pendingRequests}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Tests</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{stats.upcomingTests}</p>
            </div>
          </div>
        </div> */}

        {/* Navigation */}
        <nav className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 px-2">Navigation</h3>
          <div className="space-y-2">
            {menu.map((item, index) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
                    ${isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                      : "text-gray-700 hover:bg-gray-100/80 hover:scale-102"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Background gradient on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />

                      {/* Icon */}
                      <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                        isActive ? "bg-white/20" : "bg-gray-100/80 group-hover:bg-white/80"
                      }`}>
                        <Icon size={18} className={isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"} />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex-1">
                        <p className={isActive ? "text-white font-semibold" : "text-gray-900 group-hover:text-gray-900"}>
                          {item.name}
                        </p>
                        <p className={`text-xs transition-all duration-300 ${
                          isActive
                            ? "text-white/80"
                            : hoveredItem === index
                              ? "text-gray-500 opacity-100 translate-y-0"
                              : "text-gray-400 opacity-0 -translate-y-1"
                        }`}>
                          {item.description}
                        </p>
                      </div>

                      {/* Active indicator */}
                      <div className={`w-2 h-2 rounded-full bg-white transition-all duration-300 ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                      }`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 bg-gray-50/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Student Portal v1.0</p>
            <p className="text-xs text-gray-400"><span style={{fontFamily: "ExpressaSerial-Bold"}}>Ledu.</span> Learning Platform</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;