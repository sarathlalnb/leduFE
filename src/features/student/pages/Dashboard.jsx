import { useEffect, useState } from "react";
import { getStudentDashboard } from "../../../services/allAPI";
import StatsCard from "../../admin/components/StatsCard"; // Assuming we can import from admin

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    upcomingClasses: [],
    recentClasses: [],
    recentTests: [],
    upcomingTests: [],
    pendingRequests: [],
    studentProfile: {},
    statistics: {},
  });

  const fetchData = async () => {
    try {
      const res = await getStudentDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const {
    upcomingClasses,
    recentClasses,
    recentTests,
    upcomingTests,
    pendingRequests,
    studentProfile,
    statistics,
  } = dashboardData;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {studentProfile.name}</h1>
        <p className="text-lg opacity-90">
          {studentProfile.school && `School: ${studentProfile.school}`} | 
          {studentProfile.standard && ` Standard: ${studentProfile.standard}`}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span>Subjects: {studentProfile.subjects?.join(", ") || "N/A"}</span>
          <span>Total Hours: {studentProfile.totalHours || 0}</span>
          <span>Total Fees: ₹{studentProfile.totalFees || 0}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Classes"
          value={statistics.totalClasses || 0}
          icon="📚"
          gradient="bg-gradient-to-r from-green-400 to-blue-500"
        />
        <StatsCard
          title="Completed Classes"
          value={statistics.completedClasses || 0}
          icon="✅"
          gradient="bg-gradient-to-r from-yellow-400 to-orange-500"
        />
        <StatsCard
          title="Total Tests"
          value={statistics.totalTests || 0}
          icon="📝"
          gradient="bg-gradient-to-r from-pink-400 to-red-500"
        />
        <StatsCard
          title="Pending Requests"
          value={statistics.pendingRequestsCount || 0}
          icon="⏳"
          gradient="bg-gradient-to-r from-indigo-400 to-purple-500"
        />
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Classes</h2>
        {upcomingClasses.length === 0 ? (
          <p className="text-gray-500">No upcoming classes</p>
        ) : (
          <div className="space-y-4">
            {upcomingClasses.map((c) => (
              <div
                key={c._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-lg">{c.tutor?.subject || "Subject"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(c.date).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full capitalize">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Classes */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Classes</h2>
        {recentClasses.length === 0 ? (
          <p className="text-gray-500">No recent classes</p>
        ) : (
          <div className="space-y-4">
            {recentClasses.map((c) => (
              <div
                key={c._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-lg">{c.tutor?.subject || "Subject"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(c.date).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full capitalize">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tests */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Tests</h2>
        {upcomingTests.length === 0 ? (
          <p className="text-gray-500">No upcoming tests</p>
        ) : (
          <div className="space-y-4">
            {upcomingTests.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-lg">{t.subject || "Test"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.testDate).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tests */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Tests</h2>
        {recentTests.length === 0 ? (
          <p className="text-gray-500">No recent tests</p>
        ) : (
          <div className="space-y-4">
            {recentTests.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-lg">{t.subject || "Test"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.testDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Score: {t.score || "N/A"}</p>
                </div>
                <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((r) => (
              <div
                key={r._id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-medium text-lg">{r.type || "Request"}</p>
                  <p className="text-sm text-gray-500">
                    Class: {r.classId?.subject || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full capitalize">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;