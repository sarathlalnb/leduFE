import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllTutors,
  getTutorSalaryReport,
} from "../../../services/allAPI";
import {
  ArrowLeft,
  Search,
  GraduationCap,
  Mail,
  BookOpen,
  TrendingUp,
  CalendarDays,
  IndianRupee,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TutorSalaryReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const now = new Date();

  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  // Fetch tutor list once
  useEffect(() => {
    getAllTutors()
      .then((res) => setTutors(res.data || []))
      .catch(() => {});
  }, []);

  // Pre-select tutor from navigation state (coming from Tutors page)
  useEffect(() => {
    if (location.state?.tutor) {
      const t = location.state.tutor;
      setSelectedTutor(t);
      setSearch(t.name || "");
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      fetchReport(t.name, m, y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTutors = tutors.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const fetchReport = useCallback(async (tutorName, m, y) => {
    try {
      setLoadingReport(true);
      setReportError("");
      const res = await getTutorSalaryReport(tutorName, { month: m, year: y });
      setReport(res.data || null);
    } catch (err) {
      setReportError(err?.response?.data?.message || "Failed to load report");
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    fetchReport(tutor.name, month, year);
  };

  const handleMonthChange = (delta) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    setMonth(newMonth);
    setYear(newYear);
    if (selectedTutor) fetchReport(selectedTutor.name, newMonth, newYear);
  };

  const dailyRows = report?.dailyBreakdown || [];
  const monthlyTotals = report?.monthlyTotals || {};
  const allTimeTotals = report?.allTimeTotals || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/admin/tutors")}
            className="mb-4 flex items-center gap-2 font-medium text-red-600 transition-colors hover:text-red-700"
          >
            <ArrowLeft size={18} />
            Back to Tutors
          </button>
          <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-red-500 via-purple-600 to-indigo-700 px-6 py-6 text-white shadow-xl sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Tutor Salary Reports</h1>
                  <p className="mt-1 text-sm text-white/80">
                    Search a tutor to view their monthly salary and class breakdown.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left: Search + Tutor List */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="tutor-search"
                type="text"
                placeholder="Search tutors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-3">
              {filteredTutors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  {search ? "No tutors found." : "No tutors added yet."}
                </div>
              ) : (
                filteredTutors.map((tutor) => {
                  const isActive = selectedTutor?._id === tutor._id;
                  return (
                    <button
                      key={tutor._id}
                      onClick={() => handleSelectTutor(tutor)}
                      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
                        isActive
                          ? "border-purple-400 bg-purple-50 shadow-sm ring-1 ring-purple-300"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-purple-600 font-bold text-white text-sm">
                          {tutor.name?.charAt(0) || "T"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{tutor.name}</p>
                          <p className="truncate text-xs text-slate-500">{tutor.email}</p>
                        </div>
                      </div>
                      {(tutor.subjects || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tutor.subjects.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Report Panel */}
          <div>
            {!selectedTutor ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white text-slate-400">
                <div className="text-center">
                  <GraduationCap className="mx-auto mb-3 text-purple-300" size={40} />
                  <p className="text-sm">Select a tutor to view their salary report.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tutor Info + Month Picker */}
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-purple-600 text-xl font-bold text-white">
                        {selectedTutor.name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{selectedTutor.name}</h2>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <Mail size={13} />
                          <span>{selectedTutor.email}</span>
                        </div>
                        {(selectedTutor.subjects || []).length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                            <BookOpen size={13} />
                            <span>{selectedTutor.subjects.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Month Navigator */}
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <button
                        onClick={() => handleMonthChange(-1)}
                        className="rounded-lg p-1 text-slate-600 hover:bg-white hover:shadow-sm transition"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="min-w-[130px] text-center text-sm font-semibold text-slate-800">
                        {MONTH_NAMES[month - 1]} {year}
                      </span>
                      <button
                        onClick={() => handleMonthChange(1)}
                        className="rounded-lg p-1 text-slate-600 hover:bg-white hover:shadow-sm transition"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {loadingReport ? (
                  <div className="flex justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                  </div>
                ) : reportError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {reportError}
                  </div>
                ) : report ? (
                  <>
                    {/* Summary Cards Row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <SummaryCard
                        label={`${MONTH_NAMES[month - 1]} Classes`}
                        value={monthlyTotals.totalClasses || 0}
                        icon={<CalendarDays size={18} className="text-purple-600" />}
                        color="purple"
                      />
                      <SummaryCard
                        label={`${MONTH_NAMES[month - 1]} Hours`}
                        value={`${monthlyTotals.totalHours || 0} hr`}
                        icon={<Clock size={18} className="text-blue-600" />}
                        color="blue"
                      />
                      <SummaryCard
                        label={`${MONTH_NAMES[month - 1]} Salary`}
                        value={`₹${monthlyTotals.totalAmount || 0}`}
                        icon={<IndianRupee size={18} className="text-emerald-600" />}
                        color="emerald"
                        highlight
                      />
                      <SummaryCard
                        label="All-Time Salary"
                        value={`₹${allTimeTotals.totalAmount || 0}`}
                        icon={<TrendingUp size={18} className="text-amber-600" />}
                        color="amber"
                      />
                    </div>

                    {/* All-Time totals secondary row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <BarChart3 size={15} className="text-indigo-500" />
                          All-Time Classes
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{allTimeTotals.totalClasses || 0}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Total completed across all months</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock size={15} className="text-indigo-500" />
                          All-Time Hours
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{allTimeTotals.totalHours || 0} <span className="text-base font-normal text-slate-500">hrs</span></p>
                        <p className="mt-0.5 text-xs text-slate-400">Total teaching hours earned</p>
                      </div>
                    </div>

                    {/* Daily Breakdown Table */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={18} className="text-purple-600" />
                          <h3 className="text-lg font-semibold text-slate-900">
                            Day-by-Day Breakdown — {MONTH_NAMES[month - 1]} {year}
                          </h3>
                        </div>
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                          {report.daysInMonth} days
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="pb-3 text-left font-medium text-slate-500">Day</th>
                              <th className="pb-3 text-center font-medium text-slate-500">Classes</th>
                              <th className="pb-3 text-center font-medium text-slate-500">Hours</th>
                              <th className="pb-3 text-right font-medium text-slate-500">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dailyRows.map((row) => {
                              const hasClass = row.classCount > 0;
                              return (
                                <tr
                                  key={row.day}
                                  className={`border-b border-slate-50 transition-colors ${
                                    hasClass ? "bg-purple-50/40 hover:bg-purple-50" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <td className="py-2.5 pr-4 font-medium text-slate-700">
                                    <span
                                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                        hasClass
                                          ? "bg-purple-600 font-semibold text-white"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {row.day}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-center text-slate-700">
                                    {hasClass ? (
                                      <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                        {row.classCount}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">—</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-center text-slate-600">
                                    {hasClass ? `${row.hours} hr` : <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="py-2.5 text-right font-medium">
                                    {hasClass ? (
                                      <span className="text-indigo-700">₹{row.amount}</span>
                                    ) : (
                                      <span className="text-slate-300">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {/* Totals footer */}
                          <tfoot>
                            <tr className="border-t-2 border-slate-200 bg-slate-50">
                              <td className="py-3 pr-4 text-sm font-semibold text-slate-700">Total</td>
                              <td className="py-3 text-center text-sm font-semibold text-slate-700">
                                {monthlyTotals.totalClasses || 0}
                              </td>
                              <td className="py-3 text-center text-sm font-semibold text-slate-700">
                                {monthlyTotals.totalHours || 0} hr
                              </td>
                              <td className="py-3 text-right text-sm font-bold text-emerald-700">
                                ₹{monthlyTotals.totalAmount || 0}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color, highlight }) => {
  const colorMap = {
    purple: "bg-purple-50 border-purple-100",
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
  };
  return (
    <div
      className={`rounded-[22px] border p-4 shadow-sm ${
        highlight ? colorMap[color] : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold ${highlight ? "" : "text-slate-900"}`}>{value}</p>
    </div>
  );
};

export default TutorSalaryReport;
