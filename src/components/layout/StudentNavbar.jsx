import { Menu, LogOut, User, Bell, Search, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logo from '../../assets/leduW.png'

const StudentNavbar = ({ setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Add glassmorphism effect on scroll
    const handleScroll = () => {
      const navbar = document.querySelector('.student-navbar');
      if (window.scrollY > 10) {
        navbar?.classList.add('backdrop-blur-xl', 'bg-white/80', 'shadow-lg');
      } else {
        navbar?.classList.remove('backdrop-blur-xl', 'bg-white/80', 'shadow-lg');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="student-navbar h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-all duration-300">

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <img className="w-25" src={logo} alt="" />
          <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            Student Portal
          </h1>
        </div>
      </div>

    

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">

      


        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200/50">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-100/80 hover:bg-red-200/80 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-200" />
          </button>
        </div>
      </div>

      
    </header>
  );
};

export default StudentNavbar;