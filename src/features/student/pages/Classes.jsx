import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentClasses } from "../../../services/allAPI";
import { Calendar, BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getStudentClasses();
      setClasses(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (classItem) => {
    navigate("/student/classes/request", { state: { selectedClass: classItem } });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "pending":
        return "bg-amber-50 border-amber-200 hover:bg-amber-100";
      case "cancelled":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      default:
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }),
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
    };
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-6 md:px-6 md:py-8">
      {/* Header Section */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            My Classes
          </h1>
        </div>
        <p className="text-slate-600 text-sm md:text-base ml-11">
          {classes.length} class{classes.length !== 1 ? "es" : ""} scheduled
        </p>
      </div>

      {/* Empty State */}
      {classes.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-4">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
            </div>
            {error ? (
              <>
                <h3 className="text-xl md:text-2xl font-semibold text-red-800 mb-2">
                  Error Loading Classes
                </h3>
                <p className="text-red-600 text-sm md:text-base max-w-xs">
                  {error}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2">
                  No Classes Yet
                </h3>
                <p className="text-slate-600 text-sm md:text-base max-w-xs">
                  You don't have any classes scheduled. Check back soon for new classes!
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...classes].sort((a, b) => new Date(a.date) - new Date(b.date)).map((classItem) => {
          const { date, time, day } = formatDate(classItem.date);
          const status = classItem.status || "scheduled";

          return (
            <div
              key={classItem._id}
              onClick={() => handleCardClick(classItem)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${getStatusColor(
                status
              )}`}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent opacity-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />

              {/* Content */}
              <div className="relative p-5 md:p-6">
                {/* Top Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-xs md:text-sm font-medium text-slate-600">
                        {day}
                      </span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">
                      {date}
                    </p>
                  </div>
                  {getStatusIcon(status)}
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200 opacity-75">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-sm md:text-base font-medium text-slate-700">
                    {time}
                  </span>
                </div>

                {/* Subject & Status */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Subject
                    </p>
                    <p className="text-lg md:text-xl font-bold text-slate-900">
                      {classItem.tutor?.subject || "N/A"}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold ${getStatusBadgeColor(
                        status
                      )}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Tutor Name if available */}
                {classItem.tutor?.name && (
                  <div className="mt-4 pt-4 border-t border-slate-200 opacity-75">
                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">
                      Instructor
                    </p>
                    <p className="text-sm md:text-base font-semibold text-slate-800">
                      {classItem.tutor.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Classes;