import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerTutor, getAllTutors, updateTutor, deleteTutor } from "../../../services/allAPI";
import { ArrowLeft, GraduationCap, Plus, User, Mail, BookOpen, Pencil, Trash2, Search, BarChart2, Eye, EyeOff, ChevronLeft, ChevronRight, KeyRound } from "lucide-react";
import ResetPasswordModal from "../components/ResetPasswordModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Tutors = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", subjects: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tutors, setTutors] = useState([]);
  const [editingTutor, setEditingTutor] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", subjects: "" });
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetModalData, setResetModalData] = useState({ isOpen: false, userId: null, userName: "" });
  
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());

  const fetchTutors = async (m = month, y = year) => {
    try {
      const res = await getAllTutors({ month: m, year: y });
      setTutors(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleRegisterTutor = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      await registerTutor({
        ...form,
        subjects: form.subjects.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setForm({ name: "", email: "", password: "", subjects: "" });
      setMessage("Tutor registered successfully");
      fetchTutors(month, year);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to register tutor");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tutor) => {
    setEditingTutor(tutor._id || tutor.email);
    setEditForm({
      name: tutor.name || "",
      email: tutor.email || "",
      subjects: (tutor.subjects || []).join(", "),
    });
  };

  const handleUpdateTutor = async (e) => {
    e.preventDefault();
    if (!editingTutor) return;

    try {
      setLoading(true);
      await updateTutor(editingTutor, {
        ...editForm,
        subjects: editForm.subjects.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setEditingTutor(null);
      setEditForm({ name: "", email: "", subjects: "" });
      setMessage("Tutor updated successfully");
      fetchTutors(month, year);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to update tutor");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutor = async (tutorId) => {
    if (!window.confirm("Delete this tutor?")) return;

    try {
      setLoading(true);
      await deleteTutor(tutorId);
      setMessage("Tutor deleted successfully");
      fetchTutors(month, year);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to delete tutor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <button
          onClick={() => navigate("/admin/students")}
          className="flex items-center gap-2 font-medium text-red-600 transition-colors hover:text-red-700"
        >
          <ArrowLeft size={20} />
          Back to Students
        </button>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-red-500 via-purple-600 to-indigo-700 px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Ledu Tutors</h1>
                  <p className="text-sm text-white/80">Add, edit, and remove tutors from one place.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Month Navigator */}
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                  <button
                    onClick={() => {
                      let m = month - 1; let y = year;
                      if (m < 1) { m = 12; y -= 1; }
                      setMonth(m); setYear(y); fetchTutors(m, y);
                    }}
                    className="rounded-lg p-1 text-white hover:bg-white/20 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="min-w-[110px] text-center text-sm font-semibold text-white">
                    {MONTH_NAMES[month - 1]} {year}
                  </span>
                  <button
                    onClick={() => {
                      let m = month + 1; let y = year;
                      if (m > 12) { m = 1; y += 1; }
                      setMonth(m); setYear(y); fetchTutors(m, y);
                    }}
                    className="rounded-lg p-1 text-white hover:bg-white/20 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                  <p className="font-medium">Total tutors</p>
                  <p className="text-xl font-semibold">{tutors.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Plus size={20} className="text-purple-600" />
                <h2 className="text-xl font-semibold text-slate-900">Add Tutor</h2>
              </div>
              <p className="mb-6 text-sm text-slate-600">Tutor hourly rates are not set here because they vary by student and will be decided when assigning a class.</p>

              <form onSubmit={handleRegisterTutor} className="space-y-4">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tutor name" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Tutor email" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Subjects (comma separated)" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-red-500 to-purple-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-70">
                  {loading ? "Adding Tutor..." : "Add Tutor"}
                </button>
              </form>

              {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User size={20} className="text-red-500" />
                <h2 className="text-xl font-semibold text-slate-900">All Tutors</h2>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="tutor-list-search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {(() => {
                const filtered = tutors.filter(
                  (t) =>
                    t.name?.toLowerCase().includes(search.toLowerCase()) ||
                    t.email?.toLowerCase().includes(search.toLowerCase())
                );
                return filtered.length > 0 ? (
                  <div className="space-y-3">
                    {filtered.map((tutor) => {
                      const isEditing = editingTutor === (tutor._id || tutor.email);
                      return (
                        <div key={tutor._id || tutor.email} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                          {isEditing ? (
                            <form onSubmit={handleUpdateTutor} className="space-y-3">
                              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Tutor name" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Tutor email" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                              <input value={editForm.subjects} onChange={(e) => setEditForm({ ...editForm, subjects: e.target.value })} placeholder="Subjects (comma separated)" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              <div className="flex flex-wrap gap-2">
                                <button type="submit" className="rounded-lg bg-gradient-to-r from-red-500 to-purple-600 px-3 py-2 text-sm font-medium text-white">Save</button>
                                <button type="button" onClick={() => { setEditingTutor(null); setEditForm({ name: "", email: "", subjects: "" }); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-purple-600 font-bold text-white">
                                {tutor.name?.charAt(0) || "T"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900">{tutor.name}</h3>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                  <Mail size={14} />
                                  <span className="truncate">{tutor.email}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                  <BookOpen size={14} />
                                  <span>{(tutor.subjects || []).join(", ") || "No subjects listed"}</span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Classes (Total/Month)</p>
                                    <p className="text-sm font-semibold text-gray-900">{tutor.stats?.totalClasses || 0} / {tutor.stats?.classesThisMonth || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Hours (Total/Month)</p>
                                    <p className="text-sm font-semibold text-emerald-700">{tutor.stats?.totalHours || 0}h / {tutor.stats?.hoursThisMonth || 0}h</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => setResetModalData({ isOpen: true, userId: tutor._id, userName: tutor.name })}
                                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                                  title="Reset password"
                                >
                                  <KeyRound size={16} />
                                </button>
                                <button
                                  onClick={() => navigate("/admin/tutors/salary-report", { state: { tutor } })}
                                  className="rounded-lg border border-purple-200 bg-purple-50 p-2 text-purple-600 transition hover:bg-purple-100"
                                  title="View salary report"
                                >
                                  <BarChart2 size={16} />
                                </button>
                                <button onClick={() => startEdit(tutor)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-purple-600" title="Edit tutor">
                                  <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDeleteTutor(tutor._id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-red-600" title="Delete tutor">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    {search ? "No tutors match your search." : "No tutors added yet."}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      <ResetPasswordModal
        isOpen={resetModalData.isOpen}
        onClose={() => setResetModalData({ isOpen: false, userId: null, userName: "" })}
        userId={resetModalData.userId}
        userName={resetModalData.userName}
      />
    </div>
  );
};

export default Tutors;
