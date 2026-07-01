import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents, deleteStudent } from "../../../services/allAPI";
import { Search, Eye, Trash2, User, Plus, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import AddStudentModal from "../components/AddStudentModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());

  const fetchStudents = async (m = month, y = year) => {
    try {
      setLoading(true);
      const res = await getAllStudents({ search, month: m, year: y });
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStudents(month, year);
    }, 400);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete student");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 gradient-bg text-white rounded-xl">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage and view all enrolled students</p>
            </div>
          </div>
        </div>

        {/* Search Bar + Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-red-500 outline-none transition-all bg-white shadow-sm hover:shadow-md"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tutor Management</h2>
              <p className="text-sm text-gray-600">Add new tutors and review the full tutor list from the dedicated Tutors section.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/tutors")}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Manage Tutors
          </button>
        </div>

        {/* Results Count & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-700 font-medium">
            {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""} found`}
          </p>
          
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <button
              onClick={() => {
                let m = month - 1; let y = year;
                if (m < 1) { m = 12; y -= 1; }
                setMonth(m); setYear(y); fetchStudents(m, y);
              }}
              className="rounded-lg p-1 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[110px] text-center text-sm font-semibold text-slate-800">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={() => {
                let m = month + 1; let y = year;
                if (m > 12) { m = 1; y += 1; }
                setMonth(m); setYear(y); fetchStudents(m, y);
              }}
              className="rounded-lg p-1 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Students Grid - Mobile First */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 rounded-full gradient-bg opacity-50"></div>
            </div>
          </div>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
              >
                {/* Card Header */}
                <div className="h-2 gradient-bg"></div>

                <div className="p-6 space-y-4">
                  {/* Student Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {s.student?.name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {s.student?.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{s.student?.email}</p>
                    </div>
                  </div>

                  {/* Student Info Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Classes (Total/Month)</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{s.stats?.totalClasses || 0} / {s.stats?.classesThisMonth || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hours (Total/Month)</p>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">
                        {s.stats?.totalHours || s.totalHours || 0}h{s.packageHours > 0 ? ` (of ${s.packageHours}h)` : ""} / {s.stats?.hoursThisMonth || 0}h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">School</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{s.school || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mode</p>
                      <div className="mt-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          s.mode === "Online"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {s.mode || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Package progress bar */}
                  {s.packageHours > 0 && (
                    <div className="px-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Package Progress</span>
                        <span>{Math.min(100, Math.round(((s.totalHours || 0) / s.packageHours) * 100))}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
                          style={{ width: `${Math.min(100, ((s.totalHours || 0) / s.packageHours) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}


                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/admin/students/${s.student._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      <Eye size={18} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.student._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No students found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}

      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setSearch("");
          fetchStudents();
        }}
      />
    </div>
  );
};

export default Students;    