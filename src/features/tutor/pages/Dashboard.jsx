import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  getTutorDashboard,
  updateClassStatus,
  createTutorRequest,
} from "../../../services/allAPI";
import { formatDate, formatDateTime } from "../../../utils/formatDate";

import {
  CalendarDays,
  Clock3,
  Sparkles,
  Users,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  X,
  AlertTriangle,
  CalendarClock,
  Send,
  Search,
  Play,
  Square,
  Timer,
} from "lucide-react";

/* ─── tiny modal backdrop wrapper ─── */
const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-[24px] bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

/* ─── status badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    done: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-700",
    cancelled: "bg-rose-100 text-rose-700",
    postponed: "bg-amber-100 text-amber-700",
    in_progress: "bg-purple-100 text-purple-700",
  };
  const label = status === "in_progress" ? "In Progress" : status;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {label}
    </span>
  );
};

/* ─── Live running timer ─── */
const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = startTime ? new Date(startTime).getTime() : Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const fmt = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-sm font-mono font-semibold text-purple-700 border border-purple-200">
      <Timer size={14} className="animate-pulse text-purple-500" />
      {hrs > 0 && <span>{fmt(hrs)}:</span>}
      <span>{fmt(mins)}:{fmt(secs)}</span>
    </div>
  );
};

/* ─── Format actual minutes for display ─── */
const formatMinutes = (mins) => {
  if (mins == null) return null;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

/* ─── class action buttons ─── */
const ClassActions = ({
  cls,
  updatingId,
  onStartClass,
  onEndClass,
  onCancelClick,
  onPostponeClick,
}) => {
  if (cls.status === "done" || cls.status === "cancelled") return null;

  const isUpdating = updatingId === cls._id;

  if (cls.status === "in_progress") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <LiveTimer startTime={cls.classStartTime} />
        <button
          onClick={() => onEndClass(cls._id)}
          disabled={isUpdating}
          className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          <Square size={12} />
          {isUpdating ? "Ending…" : "End Class"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => onStartClass(cls._id)}
        disabled={isUpdating}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        <Play size={12} />
        {isUpdating ? "Starting…" : "Start Class"}
      </button>
      <button
        onClick={() => onCancelClick(cls)}
        disabled={isUpdating}
        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
      >
        Cancel
      </button>
      {cls.status === "scheduled" && (
        <button
          onClick={() => onPostponeClick(cls)}
          disabled={isUpdating}
          className="flex items-center gap-1 rounded-lg border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
        >
          <CalendarClock size={12} />
          Request Postpone
        </button>
      )}
    </div>
  );
};

const TutorDashboard = () => {
  const [data, setData] = useState({
    upcomingClasses: [],
    recentClasses: [],
    assignedStudents: [],
    stats: {},
    monthlySummary: [],
    currentMonthStats: { totalClasses: 0, totalHours: 0, totalSalary: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");

  /* ── cancel confirmation state ── */
  const [cancelTarget, setCancelTarget] = useState(null);

  /* ── postpone request modal state ── */
  const [postponeTarget, setPostponeTarget] = useState(null);
  const [postponeForm, setPostponeForm] = useState({ date: "", reason: "" });
  const [postponeLoading, setPostponeLoading] = useState(false);
  const [postponeMsg, setPostponeMsg] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTutorDashboard();
      const dashboardData = res.data || {
        upcomingClasses: [],
        recentClasses: [],
        assignedStudents: [],
        stats: {},
        monthlySummary: [],
        currentMonthStats: { totalClasses: 0, totalHours: 0, totalSalary: 0 },
      };
      setData(dashboardData);
      if (dashboardData.assignedStudents?.length) {
        setSelectedStudentId(
          (currentId) => currentId || dashboardData.assignedStudents[0].id,
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Start Class ── */
  const handleStartClass = async (classId) => {
    try {
      setUpdatingId(classId);
      await updateClassStatus(classId, { status: "in_progress" });
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start class");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── End Class ── */
  const handleEndClass = async (classId) => {
    try {
      setUpdatingId(classId);
      await updateClassStatus(classId, { status: "done" });
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to end class");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── cancel flow ── */
  const handleCancelClick = (cls) => setCancelTarget(cls);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setUpdatingId(cancelTarget._id);
      await updateClassStatus(cancelTarget._id, { status: "cancelled" });
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel class");
    } finally {
      setUpdatingId(null);
      setCancelTarget(null);
    }
  };

  /* ── postpone request flow ── */
  const handlePostponeClick = (cls) => {
    setPostponeTarget(cls);
    setPostponeForm({ date: "", reason: "" });
    setPostponeMsg(null);
  };

  const handlePostponeSubmit = async () => {
    if (!postponeForm.date) {
      setPostponeMsg({ type: "error", text: "Please choose a requested date." });
      return;
    }
    setPostponeLoading(true);
    setPostponeMsg(null);
    try {
      await createTutorRequest({
        classId: postponeTarget._id,
        type: "postpone",
        reason: postponeForm.reason,
        // Convert local datetime-local string to UTC ISO for correct server storage
        postponedDate: new Date(postponeForm.date).toISOString(),
      });
      setPostponeMsg({ type: "success", text: "Request submitted! Admin will review it shortly." });
      setTimeout(() => {
        setPostponeTarget(null);
        setPostponeMsg(null);
      }, 2000);
    } catch (err) {
      setPostponeMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to submit request",
      });
    } finally {
      setPostponeLoading(false);
    }
  };

  const stats = data.stats || {};
  const currentMonthStats = data.currentMonthStats || {
    totalClasses: 0,
    totalHours: 0,
    totalSalary: 0,
  };
  const students = data.assignedStudents || [];

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.school?.toLowerCase().includes(q) ||
        s.tutorSubject?.toLowerCase().includes(q) ||
        (s.subjects || []).some((sub) => sub.toLowerCase().includes(q)),
    );
  }, [students, studentSearch]);

  const selectedStudent = useMemo(
    () =>
      students.find((student) => student.id === selectedStudentId) ||
      students[0] ||
      null,
    [selectedStudentId, students],
  );

  /* tomorrow's date in YYYY-MM-DD for min attribute */
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  /* helper: format hours (may be fractional) */
  const fmtHours = (h) => {
    const rounded = Math.round(h * 10) / 10;
    return rounded % 1 === 0 ? rounded : rounded.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* ─── Hero header ─── */}
      <div className="rounded-[28px] bg-gradient-to-br from-red-500 via-purple-600 to-indigo-700 p-6 text-white shadow-2xl shadow-purple-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-purple-50">
              <Sparkles size={16} />
              Tutor workspace
            </div>
            <h1
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: "ExpressaSerial-Bold" }}
            >
              Ledu Tutor Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-purple-100 sm:text-base">
              Start and end each class to record actual time. Your salary is
              calculated from real teaching hours.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-purple-100">Assigned students</p>
            <p className="text-2xl font-semibold">{students.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-200 border-t-purple-600" />
        </div>
      ) : (
        <>
          {/* ─── Stats row ─── */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Classes taken</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.totalClasses || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {stats.completedClasses || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Hours</p>
              <p className="mt-2 text-2xl font-semibold text-blue-600">
                {fmtHours(stats.totalHours || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600">
                ₹{Math.round(stats.totalRevenue || 0)}
              </p>
            </div>
          </div>

          {/* ─── This Month Highlight ─── */}
          <div className="rounded-[24px] bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-purple-200" />
              <h3 className="font-semibold text-white">
                This Month —{" "}
                {new Date().toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-purple-200">Classes This Month</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {currentMonthStats.totalClasses || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-purple-200">Hours This Month</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {fmtHours(currentMonthStats.totalHours || 0)}
                  <span className="ml-1 text-base font-normal text-purple-200">
                    hr
                  </span>
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur ring-1 ring-white/30">
                <p className="text-sm text-purple-200">Salary This Month</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  ₹{Math.round(currentMonthStats.totalSalary || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Students sidebar + detail panel ─── */}
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            {/* Students list */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Assigned students
                  </p>
                  <p className="text-sm text-slate-500">
                    Pick a student to view their details and classes.
                  </p>
                </div>
                <div className="rounded-full bg-purple-50 p-2 text-purple-600">
                  <Users size={18} />
                </div>
              </div>

              {/* Search bar */}
              {students.length > 0 && (
                <div className="relative mb-4">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, school or subject…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              )}

              {students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No students assigned yet.
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No students match &ldquo;{studentSearch}&rdquo;.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => {
                    const isActive = selectedStudent?.id === student.id;
                    const hasLive = student.assignedClasses?.some(
                      (c) => c.status === "in_progress"
                    );
                    return (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${isActive ? "border-purple-500 bg-purple-50 shadow-sm" : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {student.name}
                              {hasLive && (
                                <span className="inline-flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                              )}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {student.school || "School not added"}
                            </p>
                          </div>
                          <div className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-purple-600 shadow-sm">
                            {student.upcomingClasses?.length || 0} up
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {student.tutorSubject || "Subject"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {student.standard || "Class"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className="space-y-6">
              {selectedStudent ? (
                <>
                  {/* Student profile card */}
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">
                          Student profile
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                          {selectedStudent.name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          {selectedStudent.email}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">
                          {selectedStudent.school || "School pending"}
                        </p>
                        <p>{selectedStudent.standard || "Standard not set"}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(selectedStudent.subjects || []).length ? (
                        selectedStudent.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                          >
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                          No subjects listed
                        </span>
                      )}
                    </div>

                    {/* Per-Tutor Allocated Hours Progress */}
                    {selectedStudent.allocatedHours > 0 && (
                      <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-purple-800">📦 Your Allocated Hours</p>
                          <span className="text-xs font-medium text-purple-600">
                            {fmtHours(selectedStudent.completedHours || 0)}h done / {selectedStudent.allocatedHours}h allocated
                          </span>
                        </div>
                        <div className="w-full bg-purple-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(100, ((selectedStudent.completedHours || 0) / selectedStudent.allocatedHours) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-purple-600">
                            {Math.min(100, Math.round(((selectedStudent.completedHours || 0) / selectedStudent.allocatedHours) * 100))}% complete
                          </p>
                          {selectedStudent.packageEndDate && (
                            <p className="text-xs text-purple-500">
                              Ends {formatDate(selectedStudent.packageEndDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Classes panels */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* All assigned classes */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-purple-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          All classes
                        </h3>
                      </div>
                      {selectedStudent.assignedClasses?.length ? (
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                          {selectedStudent.assignedClasses.map((cls) => (
                            <div
                              key={cls._id}
                              className={`rounded-2xl border p-4 transition-all ${cls.status === "in_progress" ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-slate-50"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {selectedStudent.name}
                                  </p>
                                  <p className="text-sm font-medium text-slate-700">
                                    {cls.tutor?.subject || "Class"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatDateTime(cls.date)}
                                  </p>
                                </div>
                                <StatusBadge status={cls.status} />
                              </div>
                              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock3 size={13} />
                                  {cls.duration || 1} hr scheduled
                                </span>
                                {cls.status === "done" && cls.actualMinutes != null && (
                                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                                    <CheckCircle2 size={13} />
                                    {formatMinutes(cls.actualMinutes)} actual
                                  </span>
                                )}
                              </div>
                              <ClassActions
                                cls={cls}
                                updatingId={updatingId}
                                onStartClass={handleStartClass}
                                onEndClass={handleEndClass}
                                onCancelClick={handleCancelClick}
                                onPostponeClick={handlePostponeClick}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          No classes assigned yet.
                        </div>
                      )}
                    </div>

                    {/* Upcoming classes */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <CalendarDays size={18} className="text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Upcoming classes
                        </h3>
                      </div>
                      {selectedStudent.upcomingClasses?.length ? (
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                          {selectedStudent.upcomingClasses.map((cls) => (
                            <div
                              key={cls._id}
                              className={`rounded-2xl border p-4 transition-all ${cls.status === "in_progress" ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-slate-50"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {selectedStudent.name}
                                  </p>
                                  <p className="text-sm font-medium text-slate-700">
                                    {cls.tutor?.subject || "Class"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatDateTime(cls.date)}
                                  </p>
                                </div>
                                <StatusBadge status={cls.status} />
                              </div>
                              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                <Clock3 size={13} />
                                <span>{cls.duration || 1} hr scheduled</span>
                              </div>
                              <ClassActions
                                cls={cls}
                                updatingId={updatingId}
                                onStartClass={handleStartClass}
                                onEndClass={handleEndClass}
                                onCancelClick={handleCancelClick}
                                onPostponeClick={handlePostponeClick}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          No upcoming classes for this student.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                  <CircleAlert
                    className="mx-auto mb-3 text-purple-500"
                    size={24}
                  />
                  Select a student to view their details.
                </div>
              )}
            </div>
          </div>

          {/* ─── Recent completed classes ─── */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Recent completed classes
              </h3>
            </div>
            {data.recentClasses?.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {data.recentClasses.map((cls) => {
                  const hrs =
                    cls.actualMinutes != null
                      ? cls.actualMinutes / 60
                      : cls.duration || 1;
                  return (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {cls.tutor?.subject || "Class"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(cls.date)}
                        </p>
                        {cls.actualMinutes != null && (
                          <p className="text-xs font-medium text-purple-600 mt-0.5">
                            ⏱ {formatMinutes(cls.actualMinutes)} actual
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-slate-700">{fmtHours(hrs)} hrs</p>
                        <p className="font-medium text-amber-600">
                          ₹{Math.round((cls.tutorRate || 0) * hrs)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No completed classes yet.</p>
            )}
          </div>
        </>
      )}

      {/* ════════ CANCEL CONFIRMATION MODAL ════════ */}
      {cancelTarget && (
        <Modal onClose={() => setCancelTarget(null)}>
          <div className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Cancel this class?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              You are about to cancel the class for{" "}
              <span className="font-medium text-slate-700">
                {cancelTarget.tutor?.subject || "this subject"}
              </span>{" "}
              scheduled on{" "}
              <span className="font-medium text-slate-700">
                {new Date(cancelTarget.date).toLocaleString()}
              </span>
              . This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Go back
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={updatingId === cancelTarget._id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {updatingId === cancelTarget._id
                  ? "Cancelling…"
                  : "Yes, cancel class"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ════════ POSTPONE REQUEST MODAL ════════ */}
      {postponeTarget && (
        <Modal onClose={() => setPostponeTarget(null)}>
          <div className="p-6">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <CalendarClock size={22} />
              </div>
              <button
                onClick={() => setPostponeTarget(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              Request to Postpone
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Class:{" "}
              <span className="font-medium text-slate-700">
                {postponeTarget.tutor?.subject || "Class"}
              </span>{" "}
              · {new Date(postponeTarget.date).toLocaleString()}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Requested new date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  min={tomorrowStr}
                  value={postponeForm.date}
                  onChange={(e) =>
                    setPostponeForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly explain why you need to postpone…"
                  value={postponeForm.reason}
                  onChange={(e) =>
                    setPostponeForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {postponeMsg && (
                <p
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${postponeMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}
                >
                  {postponeMsg.text}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPostponeTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostponeSubmit}
                disabled={postponeLoading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Send size={14} />
                {postponeLoading ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TutorDashboard;
