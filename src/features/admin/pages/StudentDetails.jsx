import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleStudent, assignTutor, scheduleClass, updateClassStatus, updateStudent, deleteStudent, updateTestMarks } from "../../../services/allAPI";
import { ArrowLeft, Phone, Mail, School, BookOpen, User, Calendar, Award, Plus, Edit, Trash2, UserPlus, BookOpen as BookIcon } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ScheduleClassCalendar from "../components/ScheduleClassCalendar";
import AddTestModal from "../components/AddTestModal";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulingClasses, setSchedulingClasses] = useState(false);

  // Modal states
  const [assignTutorModal, setAssignTutorModal] = useState(false);
  const [addClassModal, setAddClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState(false);
  const [deleteStudentModal, setDeleteStudentModal] = useState(false);
  const [addTestModal, setAddTestModal] = useState(false);
  const [updateMarksModal, setUpdateMarksModal] = useState(false);

  // Form states
  const [tutorForm, setTutorForm] = useState({ name: "", subject: "", hourlyRate: "" });
  const [selectedTest, setSelectedTest] = useState(null);
  const [testMarks, setTestMarks] = useState("");
  const [classForm, setClassForm] = useState({ tutorName: "", subject: "", dates: [], duration: 1 });
  const [generatedDates, setGeneratedDates] = useState([]);
  const [editClassForm, setEditClassForm] = useState({ status: "", newDate: "" });
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", parentName: "", parentPhone: "", school: "", syllabus: "", standard: "", mode: "", remarks: "", subjects: []
  });
  const [editStudentErrors, setEditStudentErrors] = useState({});
  const [editStudentError, setEditStudentError] = useState("");

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSingleStudent(id);
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const validateEditStudentField = (name, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    if (["name", "email", "parentName", "parentPhone", "school", "standard", "mode"].includes(name) && !trimmedValue) {
      return "This field is required";
    }

    if (name === "email" && trimmedValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return "Enter a valid email address";
      }
    }

    if (name === "parentPhone" && trimmedValue) {
      const normalizedPhone = trimmedValue.replace(/\D/g, "");
      if (!/^\d{10}$/.test(normalizedPhone)) {
        return "Enter a valid 10-digit phone number";
      }
    }

    if (name === "mode" && trimmedValue && !["Online", "Offline", "online", "offline"].includes(trimmedValue)) {
      return "Select a valid mode";
    }

    return "";
  };

  const validateEditStudentForm = () => {
    const nextErrors = {};

    Object.entries(studentForm).forEach(([name, value]) => {
      const message = validateEditStudentField(name, value);
      if (message) {
        nextErrors[name] = message;
      }
    });

    return nextErrors;
  };

  const getApiErrorMessage = (errorLike) => {
    return (
      errorLike?.response?.data?.message ||
      errorLike?.data?.message ||
      errorLike?.message ||
      "Failed to update student"
    );
  };

  // Handler functions
  const handleAssignTutor = async () => {
    try {
      // Check if subject already assigned
      const subjectExists = assignedTutors.some(
        (t) => t.subject.toLowerCase() === tutorForm.subject.toLowerCase()
      );

      if (subjectExists) {
        alert("This subject is already assigned to a tutor");
        return;
      }

      if (!tutorForm.name.trim() || !tutorForm.subject.trim()) {
        alert("Please enter tutor name and subject");
        return;
      }

      await assignTutor(id, tutorForm);
      setAssignTutorModal(false);
      setTutorForm({ name: "", subject: "", hourlyRate: "" });
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error assigning tutor");
    }
  };

  const handleScheduleClass = async () => {
    try {
      if (!classForm.tutorName || !classForm.subject) {
        alert("Please select tutor and subject");
        return;
      }

      if (generatedDates.length === 0) {
        alert("Please generate a schedule first");
        return;
      }

      setSchedulingClasses(true);

      await scheduleClass(id, {
        tutorName: classForm.tutorName,
        subject: classForm.subject,
        date: generatedDates.length === 1 ? generatedDates[0] : generatedDates,
        duration: classForm.duration,
      });

      setAddClassModal(false);
      setClassForm({ tutorName: "", subject: "", dates: [], duration: 1 });
      setGeneratedDates([]);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error scheduling classes");
    } finally {
      setSchedulingClasses(false);
    }
  };

  const handleUpdateClassStatus = async () => {
    try {
      await updateClassStatus(selectedClass._id, editClassForm);
      setEditClassModal(false);
      setEditClassForm({ status: "", newDate: "" });
      setSelectedClass(null);
      fetchStudent();
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateStudent = async () => {
    setEditStudentError("");
    const validationErrors = validateEditStudentForm();
    setEditStudentErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setEditStudentError("Please fix the highlighted fields");
      return;
    }

    // Check for duplicate subjects (case-insensitive)
    // const uniqueSubjects = new Set(studentForm.subjects.map(s => s.trim().toLowerCase()));
    // if (uniqueSubjects.size !== studentForm.subjects.filter(s => s.trim()).length) {
    //   setEditStudentError("Duplicate subjects found. Each subject must be unique");
    //   return;
    // }

    try {
      await updateStudent(id, {
        ...studentForm,
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        parentName: studentForm.parentName.trim(),
        parentPhone: studentForm.parentPhone.replace(/\D/g, ""),
        school: studentForm.school.trim(),
        syllabus: studentForm.syllabus.trim(),
        standard: studentForm.standard.trim(),
        remarks: studentForm.remarks.trim(),
        subjects: studentForm.subjects.map((subject) => subject.trim()).filter(Boolean),
      });
      setEditStudentModal(false);
      setEditStudentErrors({});
      setEditStudentError("");
      fetchStudent();
    } catch (err) {
      console.log(err);
      setEditStudentError(getApiErrorMessage(err));
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(id);
      navigate("/admin/students");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete student");
    }
  };

  const openEditClassModal = (classItem) => {
    setSelectedClass(classItem);
    setEditClassForm({ status: classItem.status, newDate: "" });
    setEditClassModal(true);
  };

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

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
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

  const { profile, classes, tests } = data;
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const assignedTutors = profile.tutors || [];
  const tutorNameOptions = [...new Set(assignedTutors.map((tutor) => tutor.name).filter(Boolean))];
  const subjectOptions = [
    ...new Set(
      assignedTutors
        .filter((tutor) => !classForm.tutorName || tutor.name === classForm.tutorName)
        .map((tutor) => tutor.subject)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/students")}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Students
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-purple-500 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {profile.student?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.student?.name}</h1>
              <p className="text-slate-300">Student ID: {id}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-700">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Standard</p>
              <p className="text-xl font-bold">{profile.standard}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Mode</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${profile.mode === "Online"
                  ? "bg-blue-100/20 text-blue-300 border border-blue-400/30"
                  : "bg-emerald-100/20 text-emerald-300 border border-emerald-400/30"
                }`}>
                {profile.mode}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Subjects</p>
              <p className="text-xl font-bold">{profile.subjects?.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Classes</p>
              <p className="text-xl font-bold">{classes?.length || 0}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={() => setAssignTutorModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={16} />
              Assign Tutor
            </button>
            <button
              onClick={() => {
                const defaultTutorName = tutorNameOptions[0] || "";
                const defaultSubject =
                  assignedTutors.find((tutor) => tutor.name === defaultTutorName)?.subject ||
                  subjectOptions[0] ||
                  "";

                setClassForm({ tutorName: defaultTutorName, subject: defaultSubject, dates: [], duration: 1 });
                setGeneratedDates([]);
                setAddClassModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add Class
            </button>
            <button
              onClick={() => setAddTestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Award size={16} />
              Add Test
            </button>
            <button
              onClick={() => {
                setStudentForm({
                  name: profile.student?.name || "",
                  email: profile.student?.email || "",
                  parentName: profile.parentName || "",
                  parentPhone: profile.parentPhone || "",
                  school: profile.school || "",
                  syllabus: profile.syllabus || "",
                  standard: profile.standard || "",
                  mode: profile.mode || "",
                  remarks: profile.remarks || "",
                  subjects: profile.subjects || []
                });
                setEditStudentErrors({});
                setEditStudentError("");
                setEditStudentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Edit size={16} />
              Edit Student
            </button>
            <button
              onClick={() => setDeleteStudentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              Delete Student
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Student Information */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User size={24} className="text-red-500" />
                  Student Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Mail className="text-red-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="text-gray-900 font-semibold break-all">{profile.student?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Phone className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Parent Phone</p>
                      <p className="text-gray-900 font-semibold">{profile.parentPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <User className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Parent Name</p>
                      <p className="text-gray-900 font-semibold">{profile.parentName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <School className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">School</p>
                      <p className="text-gray-900 font-semibold">{profile.school}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <BookOpen className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Syllabus</p>
                      <p className="text-gray-900 font-semibold">{profile.syllabus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects & Tutors */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen size={24} className="text-amber-500" />
                  Subjects & Tutors
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Subjects */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-3">Enrolled Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set((profile.subjects || []).map(s => s.trim().toLowerCase()))).map((subLower, idx) => {
                      const original = profile.subjects.find(s => s.trim().toLowerCase() === subLower);
                      return (
                        <span key={`${original}-${idx}`} className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-purple-500/20 text-gray-900 font-semibold rounded-full border border-red-300/30 text-sm">
                          {original}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Tutors */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-3">Assigned Tutors</p>
                  <div className="space-y-3">
                    {profile.tutors?.map((t) => (
                      <div key={t._id || `${t.name}-${t.subject}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                        <div className="w-10 h-10 rounded-full gradient-bg text-white flex items-center justify-center font-bold flex-shrink-0">
                          {t.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{t.name}</p>
                          <p className="text-sm text-gray-600">{t.subject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>






          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Classes</p>
                  <span className="text-2xl font-bold text-red-500">{classes?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Tests Given</p>
                  <span className="text-2xl font-bold text-purple-500">{tests?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Average Score</p>
                  <span className="text-2xl font-bold text-blue-500">
                    {tests && tests.length > 0
                      ? Math.round((tests.reduce((sum, t) => sum + ((t.marks != null && t.totalMarks != null) ? t.marks / t.totalMarks : 0), 0) / tests.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">Student Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-gray-700">Active Student</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-gray-700">Enrolled</p>
                </div>
              </div>
            </div>


            {/* Tests */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award size={24} className="text-amber-500" />
                  Tests ({tests?.length || 0})
                </h2>
              </div>

              <div className="p-6">
                {tests && tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((t) => {
                      const percentage = Math.round((t.marks / t.totalMarks) * 100);
                      const isPass = percentage >= 40;

                      return (
                        <div key={t._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isPass ? "bg-green-500/10" : "bg-red-500/10"
                            }`}>
                            <Award className={isPass ? "text-green-600" : "text-red-600"} size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{t.subject}</p>
                            <p className="text-sm text-gray-600 mt-1">{new Date(t.testDate).toLocaleDateString("en-US", { timeZone: "UTC" })}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900">{t.marks}/{t.totalMarks}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${isPass
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}>
                              {percentage}%
                            </span>
                            <button
                              onClick={() => {
                                setSelectedTest(t);
                                setTestMarks(t.marks?.toString() || "");
                                setUpdateMarksModal(true);
                              }}
                              className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit size={14} />
                              Update Marks
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No tests conducted</p>
                )}
              </div>
            </div>

          </div>

        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-blue-500" />
              Classes ({classes?.length || 0})
            </h2>
          </div>

          <div className="p-6">
            {classes && classes.length > 0 ? (
              <div className="space-y-3">
                {[...classes].sort((a, b) => new Date(a.date) - new Date(b.date)).map((c) => (
                  <div key={c._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{c.tutor?.subject || "Subject"}</p>
                      <p className="text-sm text-gray-600 mt-1">{new Date(c.date).toLocaleDateString("en-GB", { timeZone: "UTC" })} {new Date(c.date).toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${c.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : c.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                        {c.status}
                      </span>
                      <button
                        onClick={() => openEditClassModal(c)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No classes scheduled</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Assign Tutor Modal */}
      <Modal open={assignTutorModal} title="Assign Tutor" onClose={() => setAssignTutorModal(false)}>
        <div className="p-6 space-y-4">
          <Input
            label="Tutor Name"
            value={tutorForm.name}
            onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
            placeholder="Enter tutor name"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <select
              value={tutorForm.subject}
              onChange={(e) => setTutorForm({ ...tutorForm, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {profile?.subjects && profile.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Hourly Rate (optional)"
            type="number"
            value={tutorForm.hourlyRate}
            onChange={(e) => setTutorForm({ ...tutorForm, hourlyRate: e.target.value })}
            placeholder="Enter hourly rate"
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAssignTutor}>Assign Tutor</Button>
            <Button variant="secondary" onClick={() => setAssignTutorModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Class Modal */}
      <Modal open={addClassModal} title="Schedule New Class" onClose={() => setAddClassModal(false)}>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="text-sm font-medium">Tutor Name</label>
            <select
              value={classForm.tutorName}
              onChange={(e) => {
                const selectedTutorName = e.target.value;
                const tutorSubjects = [
                  ...new Set(
                    assignedTutors
                      .filter((tutor) => tutor.name === selectedTutorName)
                      .map((tutor) => tutor.subject)
                      .filter(Boolean)
                  ),
                ];

                setClassForm({
                  ...classForm,
                  tutorName: selectedTutorName,
                  subject: tutorSubjects.includes(classForm.subject) ? classForm.subject : (tutorSubjects[0] || ""),
                });
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              disabled={schedulingClasses || tutorNameOptions.length === 0}
            >
              {tutorNameOptions.length === 0 ? (
                <option value="">No assigned tutors available</option>
              ) : (
                <>
                  <option value="">Select tutor</option>
                  {tutorNameOptions.map((tutorName) => (
                    <option key={tutorName} value={tutorName}>{tutorName}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Subject</label>
            <select
              value={classForm.subject}
              onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              disabled={schedulingClasses || subjectOptions.length === 0}
            >
              {subjectOptions.length === 0 ? (
                <option value="">No subjects available</option>
              ) : (
                <>
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <Input
            label="Duration (hours)"
            type="number"
            value={classForm.duration}
            onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })}
            min="1"
            disabled={schedulingClasses}
          />

          {/* Calendar Component */}
          <ScheduleClassCalendar
            onDatesSelected={setGeneratedDates}
            selectedDates={generatedDates}
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleScheduleClass}
              disabled={schedulingClasses}
            >
              {schedulingClasses ? "Scheduling..." : "Schedule Classes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAddClassModal(false);
                setGeneratedDates([]);
              }}
              disabled={schedulingClasses}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Class Status Modal */}
      <Modal open={editClassModal} title="Update Class Status" onClose={() => setEditClassModal(false)}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={editClassForm.status}
              onChange={(e) => setEditClassForm({ ...editClassForm, status: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Select status</option>
              <option value="done">Done</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {editClassForm.status === "postponed" && (
            <Input
              label="New Date & Time"
              type="datetime-local"
              value={editClassForm.newDate}
              onChange={(e) => setEditClassForm({ ...editClassForm, newDate: e.target.value })}
              min={minDateTime}
            />
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateClassStatus}>Update Status</Button>
            <Button variant="secondary" onClick={() => setEditClassModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal open={editStudentModal} title="Edit Student" onClose={() => setEditStudentModal(false)}>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {editStudentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {editStudentError}
            </div>
          )}
          <Input
            label="Name"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          {editStudentErrors.name && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.name}</p>}
          <Input
            label="Email"
            type="email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
          />
          {editStudentErrors.email && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.email}</p>}
          <Input
            label="Parent Name"
            value={studentForm.parentName}
            onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
          />
          {editStudentErrors.parentName && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.parentName}</p>}
          <Input
            label="Parent Phone"
            value={studentForm.parentPhone}
            onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
          />
          {editStudentErrors.parentPhone && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.parentPhone}</p>}
          <Input
            label="School"
            value={studentForm.school}
            onChange={(e) => setStudentForm({ ...studentForm, school: e.target.value })}
          />
          {editStudentErrors.school && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.school}</p>}
          <div>
            <label className="text-sm font-medium">Syllabus</label>
            <select
              value={studentForm.syllabus}
              onChange={(e) => setStudentForm({ ...studentForm, syllabus: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Select Syllabus</option>
              <option value="State">State</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSC">ICSC</option>
              <option value="IGCSE">IGCSE</option>
              <option value="IB">IB</option>
            </select>
          </div>
          <Input
            label="Standard"
            value={studentForm.standard}
            onChange={(e) => setStudentForm({ ...studentForm, standard: e.target.value })}
          />
          {editStudentErrors.standard && <p className="-mt-2 text-xs text-red-600">{editStudentErrors.standard}</p>}
          <div>
            <label className="text-sm font-medium">Mode</label>
            <select
              value={studentForm.mode}
              onChange={(e) => setStudentForm({ ...studentForm, mode: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {editStudentErrors.mode && <p className="mt-1 text-xs text-red-600">{editStudentErrors.mode}</p>}
          </div>
          <Input
            label="Remarks"
            value={studentForm.remarks}
            onChange={(e) => setStudentForm({ ...studentForm, remarks: e.target.value })}
          />
          <Input
            label="Subjects (comma separated)"
            value={studentForm.subjects.join(", ")}
            onChange={(e) => setStudentForm({ ...studentForm, subjects: e.target.value.split(",").map(s => s.trim()) })}
          />
          {editStudentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {editStudentError}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateStudent}>Update Student</Button>
            <Button variant="secondary" onClick={() => {
              setEditStudentModal(false);
              setEditStudentErrors({});
              setEditStudentError("");
            }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Student Modal */}
      <Modal open={deleteStudentModal} title="Delete Student" onClose={() => setDeleteStudentModal(false)}>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this student? This action cannot be undone and will remove all associated data including classes and tests.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDeleteStudent}>Delete Student</Button>
            <Button variant="secondary" onClick={() => setDeleteStudentModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Test Modal */}
      <AddTestModal
        isOpen={addTestModal}
        onClose={() => setAddTestModal(false)}
        onSuccess={fetchStudent}
        studentId={id}
      />

      <Modal open={updateMarksModal} title="Update Test Marks" onClose={() => setUpdateMarksModal(false)}>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Updating marks for <span className="font-semibold">{selectedTest?.subject}</span>
            {selectedTest ? ` on ${new Date(selectedTest.testDate).toLocaleDateString("en-US", { timeZone: "UTC" })}` : ""}
          </p>

          <Input
            label="Marks Obtained"
            type="number"
            min="0"
            value={testMarks}
            onChange={(e) => setTestMarks(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={async () => {
                if (!selectedTest) return;
                if (testMarks === "") {
                  alert("Please enter marks to update");
                  return;
                }
                try {
                  await updateTestMarks(selectedTest._id, { marks: parseInt(testMarks, 10) });
                  setUpdateMarksModal(false);
                  setSelectedTest(null);
                  setTestMarks("");
                  fetchStudent();
                } catch (error) {
                  console.log(error);
                  alert(error.response?.data?.message || "Failed to update test marks");
                }
              }}
            >
              Save Marks
            </Button>
            <Button variant="secondary" onClick={() => setUpdateMarksModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Screen Loader for Class Scheduling */}
      {schedulingClasses && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              {/* Floating dots animation */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-1/2 -right-3 w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Loading Text */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Scheduling Classes
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we create your class schedule...
            </p>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDetails;