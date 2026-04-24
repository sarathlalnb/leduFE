import { Menu, LogOut, Bell, Settings } from "lucide-react";

const Navbar = ({ setIsOpen }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="h-16 bg-white border-b-2 border-slate-100 shadow-sm flex items-center justify-between px-4 md:px-8">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        <h1 className="font-bold text-2xl gradient-text"><span style={{fontFamily: "ExpressaSerial-Bold"}}>Ledu.</span> Admin</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600 hidden sm:block">
          <Bell size={20} />
        </button>
        
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600 hidden sm:block">
          <Settings size={20} />
        </button> */}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;