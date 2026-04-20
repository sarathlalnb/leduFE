import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";

const StudentLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

      {/* Sidebar */}
      <StudentSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ease-out ${
        isMobile ? 'ml-0' : 'ml-80'
      } min-h-screen`}>

        {/* Navbar */}
        <StudentNavbar setIsOpen={setIsOpen} />

        {/* Page Content */}
        <main className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Content Container */}
          <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay Animation */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default StudentLayout;