import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents, deleteStudent } from "../../../services/allAPI";
import { Search, Eye, Trash2, User, Plus } from "lucide-react";
import AddStudentModal from "../components/AddStudentModal";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getAllStudents({ search });
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.log(err);
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

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium">
            {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""} found`}
          </p>
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
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">School</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{s.school || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Standard</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{s.standard || "N/A"}</p>
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
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-1">
                        Active
                      </span>
                    </div>
                  </div>

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