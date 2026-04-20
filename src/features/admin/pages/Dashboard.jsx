import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import { getAdminDashboard } from "../../../services/allAPI";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 rounded-full gradient-bg opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group gradient-bg text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base sm:text-sm opacity-90 font-medium">Total Students</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2">{data.totalStudents}</p>
              </div>
              <div className="text-5xl opacity-30">👥</div>
            </div>
            <p className="mt-4 text-sm opacity-75">📊   </p>
          </div>

          <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base sm:text-sm opacity-90 font-medium">Active Classes</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2">{data.totalClasses}</p>
              </div>
              <div className="text-5xl opacity-30">📚</div>
            </div>
            <p className="mt-4 text-sm opacity-75">✅ Running smoothly</p>
          </div>

          <div className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base sm:text-sm opacity-90 font-medium">Completed</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2">{data.classStats.done}</p>
              </div>
              <div className="text-5xl opacity-30">✨</div>
            </div>
            <p className="mt-4 text-sm opacity-75">📈 Excellent progress</p>
          </div>

          <div className="group bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base sm:text-sm opacity-90 font-medium">Scheduled</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2">{data.classStats.scheduled}</p>
              </div>
              <div className="text-5xl opacity-30">📅</div>
            </div>
            <p className="mt-4 text-sm opacity-75">🔔 Upcoming</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upcoming Classes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  📅 Upcoming Classes
                </h2>
              </div>

              <div className="p-6">
                {data.upcomingClasses && data.upcomingClasses.length > 0 ? (
                  <div className="space-y-3">
                    {data.upcomingClasses.slice(0, 5).map((cls) => (
                      <div key={cls._id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:shadow-md transition-all border border-slate-200 hover:border-slate-300">
                        <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {cls.student?.name?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{cls.student?.name || "Unknown"}</p>
                          <p className="text-sm text-gray-600 truncate">{cls.tutor?.subject || "Subject"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">{new Date(cls.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming classes</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Students Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  👤 Recent Students
                </h2>
              </div>

              <div className="p-6">
                {data.recentStudents && data.recentStudents.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentStudents.slice(0, 4).map((s) => (
                      <div key={s._id} className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                        <p className="font-semibold text-gray-900 text-sm">{s.student?.name}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">{s.student?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">📍 {s.school}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent students</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;