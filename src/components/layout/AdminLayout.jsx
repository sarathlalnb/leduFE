import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main */}
      <div className="flex-1 md:ml-64 min-h-screen bg-gray-50">

        {/* Navbar */}
        <Navbar setIsOpen={setIsOpen} />

        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;