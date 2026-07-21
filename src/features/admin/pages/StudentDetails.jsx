import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleStudent, assignTutor, updateAssignedTutor, scheduleClass, updateClassStatus, setClassActualTime, updateStudent, deleteStudent, updateTestMarks, editClass, deleteClass, deleteAllClasses, bulkEditClasses, getAllTutors } from "../../../services/allAPI";
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
  const [editTutorModal, setEditTutorModal] = useState(false);
  const [addClassModal, setAddClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [updateClassStatusModal, setUpdateClassStatusModal] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState(false);
  const [deleteStudentModal, setDeleteStudentModal] = useState(false);
  const [addTestModal, setAddTestModal] = useState(false);
  const [updateMarksModal, setUpdateMarksModal] = useState(false);
  const [deleteAllClassesModal, setDeleteAllClassesModal] = useState(false);
  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [bulkEditForm, setBulkEditForm] = useState({ date: "", duration: "", tutorName: "", subject: "" });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  // Set Actual Time (admin manual)
  const [setActualTimeModal, setSetActualTimeModal] = useState(false);
  const [setActualTimeTarget, setSetActualTimeTarget] = useState(null);
  const [setActualTimeHours, setSetActualTimeHours] = useState("");
  const [setActualTimeMins, setSetActualTimeMins] = useState("");
  const [setActualTimeLoading, setSetActualTimeLoading] = useState(false);

  // Form states
  const [tutorForm, setTutorForm] = useState({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "", manualSubject: "" });
  const [editTutorForm, setEditTutorForm] = useState({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "", manualSubject: "" });
  const [assignTutorManualSubject, setAssignTutorManualSubject] = useState(false);
  const [editTutorManualSubject, setEditTutorManualSubject] = useState(false);
  const [addClassManualSubject, setAddClassManualSubject] = useState(false);
  const [editingTutor, setEditingTutor] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testMarks, setTestMarks] = useState("");
  const [classForm, setClassForm] = useState({ tutorName: "", subject: "", dates: [], duration: 1, manualSubject: "", packageHours: "" });
  const [generatedDates, setGeneratedDates] = useState([]);
  const [generatedPackageData, setGeneratedPackageData] = useState({});
  const [editClassForm, setEditClassForm] = useState({ date: "", duration: "", tutorName: "", subject: "" });
  const [updateClassStatusForm, setUpdateClassStatusForm] = useState({ status: "", newDate: "" });
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", parentName: "", parentPhone: "", school: "", syllabus: "", standard: "", mode: "", remarks: "", subjects: [],
    packageHours: "", hoursPerDay: "", packageStartDate: "", packageEndDate: "", packagePattern: "all-saturdays",
  });
  const [editStudentErrors, setEditStudentErrors] = useState({});
  const [editStudentError, setEditStudentError] = useState("");
  const [registeredTutors, setRegisteredTutors] = useState([]);

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

  const fetchTutors = useCallback(async () => {
    try {
      const res = await getAllTutors();
      setRegisteredTutors(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

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

      if (!tutorForm.name.trim() || (!tutorForm.subject.trim() && !tutorForm.manualSubject?.trim())) {
        alert("Please enter tutor name and subject");
        return;
      }

      const resolvedSubject = assignTutorManualSubject ? tutorForm.manualSubject.trim() : tutorForm.subject;

      await assignTutor(id, {
        name: tutorForm.name,
        subject: resolvedSubject,
        tutorHourlyRate: Number(tutorForm.tutorHourlyRate) || 0,
        studentHourlyRate: Number(tutorForm.studentHourlyRate) || 0,
      });
      setAssignTutorModal(false);
      setTutorForm({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "", manualSubject: "" });
      setAssignTutorManualSubject(false);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error assigning tutor");
    }
  };

  const handleEditAssignedTutor = async () => {
    try {
      if (!editingTutor?._id) {
        alert("No assigned tutor selected");
        return;
      }

      if (!editTutorForm.name.trim() || (!editTutorForm.subject.trim() && !editTutorForm.manualSubject?.trim())) {
        alert("Please enter tutor name and subject");
        return;
      }

      const resolvedSubject = editTutorManualSubject ? editTutorForm.manualSubject.trim() : editTutorForm.subject;

      const duplicateSubject = assignedTutors.some(
        (t) => String(t._id || t.id) !== String(editingTutor?._id) && t.subject?.toLowerCase() === resolvedSubject.toLowerCase()
      );

      if (duplicateSubject) {
        alert("This subject is already assigned to another tutor");
        return;
      }

      await updateAssignedTutor(id, editingTutor._id, {
        name: editTutorForm.name,
        subject: resolvedSubject,
        tutorHourlyRate: Number(editTutorForm.tutorHourlyRate) || 0,
        studentHourlyRate: Number(editTutorForm.studentHourlyRate) || 0,
      });

      setEditTutorModal(false);
      setEditingTutor(null);
      setEditTutorForm({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "", manualSubject: "" });
      setEditTutorManualSubject(false);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error updating assigned tutor");
    }
  };

  const handleScheduleClass = async () => {
    try {
      if (!classForm.tutorName || (!classForm.subject && !classForm.manualSubject)) {
        alert("Please select tutor and subject");
        return;
      }

      if (generatedDates.length === 0) {
        alert("Please generate a schedule first");
        return;
      }

      setSchedulingClasses(true);

      const resolvedSubject = addClassManualSubject ? classForm.manualSubject : classForm.subject;

      await scheduleClass(id, {
        tutorName: classForm.tutorName,
        subject: resolvedSubject,
        date: generatedDates.length === 1 ? generatedDates[0] : generatedDates,
        duration: classForm.duration,
        packageHours: classForm.packageHours ? Number(classForm.packageHours) : undefined,
        packageStartDate: generatedPackageData.packageStartDate,
        packageEndDate: generatedPackageData.packageEndDate,
        packagePattern: generatedPackageData.packagePattern,
      });

      setAddClassModal(false);
      setClassForm({ tutorName: "", subject: "", dates: [], duration: 1, manualSubject: "", packageHours: "" });
      setGeneratedDates([]);
      setGeneratedPackageData({});
      setAddClassManualSubject(false);
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
      await updateClassStatus(selectedClass._id, updateClassStatusForm);
      setUpdateClassStatusModal(false);
      setUpdateClassStatusForm({ status: "", newDate: "" });
      setSelectedClass(null);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error updating class status");
    }
  };

  const handleEditClass = async () => {
    try {
      if (!selectedClass) {
        alert("No class selected");
        return;
      }

      const updateData = {};

      // Add date if provided
      if (editClassForm.date) {
        updateData.date = new Date(editClassForm.date).toISOString();
      }

      // Add duration if provided
      if (editClassForm.duration) {
        updateData.duration = Number(editClassForm.duration);
      }

      // Add tutor info if both tutorName and subject are provided
      if (editClassForm.tutorName && editClassForm.subject) {
        updateData.tutorName = editClassForm.tutorName;
        updateData.subject = editClassForm.subject;
      } else if (editClassForm.tutorName || editClassForm.subject) {
        alert("Please select both tutor name and subject when changing tutor");
        return;
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes to save");
        return;
      }

      await editClass(selectedClass._id, updateData);
      setEditClassModal(false);
      setEditClassForm({ date: "", duration: "", tutorName: "", subject: "" });
      setSelectedClass(null);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error updating class");
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
        packageHours: studentForm.packageHours === "" ? undefined : Number(studentForm.packageHours),
        hoursPerDay: studentForm.hoursPerDay === "" ? undefined : Number(studentForm.hoursPerDay),
        packageStartDate: studentForm.packageStartDate || undefined,
        packageEndDate: studentForm.packageEndDate || undefined,
        packagePattern: studentForm.packagePattern || undefined,
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

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteClass(classId);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error deleting class");
    }
  };

  const handleDeleteAllClasses = async () => {
    try {
      setDeleteAllLoading(true);
      await deleteAllClasses(id);
      setDeleteAllClassesModal(false);
      setSelectedClassIds([]);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error deleting all classes");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleBulkEdit = async () => {
    if (selectedClassIds.length === 0) {
      alert("No classes selected");
      return;
    }
    const updateData = {};
    if (bulkEditForm.date) updateData.date = new Date(bulkEditForm.date).toISOString();
    if (bulkEditForm.duration) updateData.duration = Number(bulkEditForm.duration);
    if (bulkEditForm.tutorName && bulkEditForm.subject) {
      updateData.tutorName = bulkEditForm.tutorName;
      updateData.subject = bulkEditForm.subject;
    } else if (bulkEditForm.tutorName || bulkEditForm.subject) {
      alert("Please provide both tutor name and subject when changing trainer");
      return;
    }
    if (Object.keys(updateData).length === 0) {
      alert("No changes to apply");
      return;
    }
    try {
      setBulkEditLoading(true);
      await bulkEditClasses({ classIds: selectedClassIds, updateData });
      setBulkEditModal(false);
      setSelectedClassIds([]);
      setBulkEditForm({ date: "", duration: "", tutorName: "", subject: "" });
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error applying bulk edit");
    } finally {
      setBulkEditLoading(false);
    }
  };

  const handleSetActualTime = async () => {
    const hours = Number(setActualTimeHours) || 0;
    const mins = Number(setActualTimeMins) || 0;
    const totalMinutes = hours * 60 + mins;
    if (totalMinutes <= 0) {
      alert("Please enter a valid duration (hours and/or minutes)");
      return;
    }
    try {
      setSetActualTimeLoading(true);
      await setClassActualTime(setActualTimeTarget._id, { actualMinutes: totalMinutes });
      setSetActualTimeModal(false);
      setSetActualTimeTarget(null);
      setSetActualTimeHours("");
      setSetActualTimeMins("");
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error setting actual time");
    } finally {
      setSetActualTimeLoading(false);
    }
  };

  const toggleSelectClass = (classId) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((cid) => cid !== classId) : [...prev, classId]
    );
  };

  const toggleSelectAllClasses = (allIds) => {
    setSelectedClassIds((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  };

  const openEditClassModal = (classItem) => {
    setSelectedClass(classItem);
    // Format date for datetime-local input using LOCAL time (not UTC)
    const dateObj = new Date(classItem.date);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    const localDate = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    setEditClassForm({
      date: localDate,
      duration: classItem.duration,
      tutorName: "",
      subject: ""
    });
    setEditClassModal(true);
  };

  const openUpdateClassStatusModal = (classItem) => {
    setSelectedClass(classItem);
    setUpdateClassStatusForm({ status: classItem.status, newDate: "" });
    setUpdateClassStatusModal(true);
  };

  const openEditAssignedTutorModal = (tutor) => {
    setEditingTutor(tutor);
    setEditTutorManualSubject(false);
    setEditTutorForm({
      name: tutor.name || "",
      subject: tutor.subject || "",
      tutorHourlyRate: tutor.tutorHourlyRate ?? tutor.hourlyRate ?? "",
      studentHourlyRate: tutor.studentHourlyRate ?? "",
      manualSubject: "",
    });
    setEditTutorModal(true);
  };

  useEffect(() => {
    fetchStudent();
    fetchTutors();
  }, [fetchStudent, fetchTutors]);

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
  const tutorNameOptions = [
    ...new Set(assignedTutors.map((tutor) => tutor.name).filter(Boolean)),
  ];
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
              <p className="text-slate-400 text-sm font-medium mb-1">Package</p>
              <p className="text-xl font-bold">{profile.packageHours > 0 ? `${profile.packageHours}h` : "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Completed</p>
              <p className="text-xl font-bold text-emerald-400">{profile.totalHours || 0}h</p>
            </div>
          </div>
          {/* Package progress bar */}
          {profile.packageHours > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Package Progress</span>
                <span>{Math.min(100, Math.round(((profile.totalHours || 0) / profile.packageHours) * 100))}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all"
                  style={{ width: `${Math.min(100, ((profile.totalHours || 0) / profile.packageHours) * 100)}%` }}
                />
              </div>
            </div>
          )}

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

                setClassForm({ tutorName: defaultTutorName, subject: defaultSubject, dates: [], duration: 1, manualSubject: "", packageHours: "" });
                setGeneratedDates([]);
                setGeneratedPackageData({});
                setAddClassManualSubject(false);
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
                  subjects: profile.subjects || [],
                  packageHours: profile.packageHours || "",
                  hoursPerDay: profile.hoursPerDay || "",
                  packageStartDate: profile.packageStartDate ? new Date(profile.packageStartDate).toISOString().split("T")[0] : "",
                  packageEndDate: profile.packageEndDate ? new Date(profile.packageEndDate).toISOString().split("T")[0] : "",
                  packagePattern: profile.packagePattern || "all-saturdays",
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
            <button
              onClick={() => setDeleteAllClassesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              disabled={!classes || classes.length === 0}
            >
              <Trash2 size={16} />
              Delete All Classes
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
                          <p className="text-xs text-gray-500 mt-1">
                            Tutor ₹{Number(t.tutorHourlyRate ?? t.hourlyRate ?? 0)} / hr • Student ₹{Number(t.studentHourlyRate ?? 0)} / hr
                          </p>
                        </div>
                        <button
                          onClick={() => openEditAssignedTutorModal(t)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit assigned tutor"
                        >
                          <Edit size={16} />
                        </button>
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
                {/* Package Hours Progress */}
                {profile.packageHours > 0 ? (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-600 text-sm font-medium">Package Hours</p>
                      <span className="text-sm font-bold text-purple-600">{profile.packageHours}h total</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-500 text-xs">Completed</p>
                      <span className="text-sm font-semibold text-emerald-600">{profile.totalHours || 0}h / {profile.packageHours}h</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
                        style={{ width: `${Math.min(100, ((profile.totalHours || 0) / profile.packageHours) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.min(100, Math.round(((profile.totalHours || 0) / profile.packageHours) * 100))}% complete
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Hours Completed</p>
                    <span className="text-2xl font-bold text-emerald-600">{profile.totalHours || 0} hrs</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Tutor Fees</p>
                  <span className="text-2xl font-bold text-amber-600">₹{profile.totalTutorFees || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Student Fees</p>
                  <span className="text-2xl font-bold text-amber-600">₹{profile.totalStudentFees || profile.totalFees || 0}</span>
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
                            <p className="text-sm text-gray-600 mt-1">{new Date(t.testDate).toLocaleDateString("en-US")}</p>
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
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-blue-500" />
              Classes ({classes?.length || 0})
            </h2>
            {classes && classes.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedClassIds.length > 0 && (
                  <button
                    onClick={() => {
                      setBulkEditForm({ date: "", duration: "", tutorName: "", subject: "" });
                      setBulkEditModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={14} />
                    Bulk Edit ({selectedClassIds.length})
                  </button>
                )}
                <button
                  onClick={() => toggleSelectAllClasses(classes.map(c => c._id))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                >
                  {selectedClassIds.length === classes.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {classes && classes.length > 0 ? (
              <div className="space-y-3">
                {[...classes].sort((a, b) => new Date(a.date) - new Date(b.date)).map((c) => (
                  <div
                    key={c._id}
                    className={`flex items-start gap-4 p-4 rounded-xl border hover:shadow-md transition-all ${
                      selectedClassIds.includes(c._id)
                        ? "bg-blue-50 border-blue-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(c._id)}
                      onChange={() => toggleSelectClass(c._id)}
                      className="mt-1 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{c.tutor?.subject || "Subject"}</p>
                      <p className="text-xs text-gray-500">{c.tutor?.name || "—"}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(c.date).toLocaleDateString("en-GB")} {new Date(c.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {c.status === "done" && c.actualMinutes != null && (
                        <p className="text-xs font-medium text-emerald-600 mt-0.5">
                          ⏱ {Math.floor(c.actualMinutes / 60) > 0 ? `${Math.floor(c.actualMinutes / 60)}h ` : ""}{Math.round(c.actualMinutes % 60)}m actual
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-wrap items-center gap-1.5 justify-end">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === "done" || c.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : c.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : c.status === "in_progress"
                              ? "bg-purple-100 text-purple-700"
                              : c.status === "postponed"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                      }`}>
                        {c.status === "in_progress" ? "In Progress" : c.status}
                      </span>
                      {c.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            setSetActualTimeTarget(c);
                            const existing = c.actualMinutes != null ? c.actualMinutes
                              : (c.classStartTime && c.classEndTime)
                                ? Math.round((new Date(c.classEndTime) - new Date(c.classStartTime)) / 60000)
                                : null;
                            if (existing != null) {
                              setSetActualTimeHours(String(Math.floor(existing / 60)));
                              setSetActualTimeMins(String(Math.round(existing % 60)));
                            } else {
                              setSetActualTimeHours("");
                              setSetActualTimeMins("");
                            }
                            setSetActualTimeModal(true);
                          }}
                          className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="Set actual class duration"
                        >
                          Set Time
                        </button>
                      )}
                      <button
                        onClick={() => openEditClassModal(c)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit class details"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openUpdateClassStatusModal(c)}
                        className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                        title="Update status"
                      >
                        <Calendar size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(c._id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete class"
                      >
                        <Trash2 size={16} />
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tutor Name</label>
            <select
              value={tutorForm.name}
              onChange={(e) => {
                const selectedTutorName = e.target.value;
                const selectedTutor = registeredTutors.find((tutor) => tutor.name === selectedTutorName);
                const fallbackSubject =
                  (selectedTutor?.subjects || []).find((subject) => (profile?.subjects || []).includes(subject)) ||
                  selectedTutor?.subjects?.[0] ||
                  "";

                setTutorForm({
                  ...tutorForm,
                  name: selectedTutorName,
                  subject: fallbackSubject,
                });
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a tutor</option>
              {registeredTutors.map((tutor) => (
                <option key={tutor._id || tutor.email} value={tutor.name}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <div className="space-y-2">
              {!assignTutorManualSubject ? (
                <>
                  <select
                    value={tutorForm.subject}
                    onChange={(e) => setTutorForm({ ...tutorForm, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!tutorForm.name}
                  >
                    <option value="">Select a subject</option>
                    {Array.from(new Set([...(registeredTutors.find((tutor) => tutor.name === tutorForm.name)?.subjects || []), ...(profile?.subjects || [])])).map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setAssignTutorManualSubject(true)} className="text-xs text-blue-600 hover:underline">
                    + Type subject manually
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={tutorForm.manualSubject || ""}
                    onChange={(e) => setTutorForm({ ...tutorForm, manualSubject: e.target.value })}
                    placeholder="Enter subject name"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => { setAssignTutorManualSubject(false); setTutorForm({ ...tutorForm, manualSubject: "" }); }} className="text-xs text-gray-500 hover:underline">
                    ← Back to dropdown
                  </button>
                </>
              )}
            </div>
          </div>
          <Input
            label="Tutor Rate / Hour"
            type="number"
            value={tutorForm.tutorHourlyRate}
            onChange={(e) => setTutorForm({ ...tutorForm, tutorHourlyRate: e.target.value })}
            placeholder="Enter tutor hourly rate"
          />
          <Input
            label="Student Rate / Hour"
            type="number"
            value={tutorForm.studentHourlyRate}
            onChange={(e) => setTutorForm({ ...tutorForm, studentHourlyRate: e.target.value })}
            placeholder="Enter student hourly rate"
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAssignTutor}>Assign Tutor</Button>
            <Button variant="secondary" onClick={() => setAssignTutorModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Assigned Tutor Modal */}
      <Modal
        open={editTutorModal}
        title="Edit Assigned Tutor"
        onClose={() => {
          setEditTutorModal(false);
          setEditingTutor(null);
          setEditTutorForm({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "" });
        }}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tutor Name</label>
            <select
              value={editTutorForm.name}
              onChange={(e) => {
                const selectedTutorName = e.target.value;
                const selectedTutor = registeredTutors.find((tutor) => tutor.name === selectedTutorName);
                const fallbackSubject =
                  (selectedTutor?.subjects || []).find((subject) => (profile?.subjects || []).includes(subject)) ||
                  selectedTutor?.subjects?.[0] ||
                  "";

                setEditTutorForm({
                  ...editTutorForm,
                  name: selectedTutorName,
                  subject: fallbackSubject,
                });
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a tutor</option>
              {registeredTutors.map((tutor) => (
                <option key={tutor._id || tutor.email} value={tutor.name}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <div className="space-y-2">
              {!editTutorManualSubject ? (
                <>
                  <select
                    value={editTutorForm.subject}
                    onChange={(e) => setEditTutorForm({ ...editTutorForm, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!editTutorForm.name}
                  >
                    <option value="">Select a subject</option>
                    {Array.from(new Set([...(registeredTutors.find((tutor) => tutor.name === editTutorForm.name)?.subjects || []), ...(profile?.subjects || [])])).map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setEditTutorManualSubject(true)} className="text-xs text-blue-600 hover:underline">
                    + Type subject manually
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={editTutorForm.manualSubject || ""}
                    onChange={(e) => setEditTutorForm({ ...editTutorForm, manualSubject: e.target.value })}
                    placeholder="Enter subject name"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => { setEditTutorManualSubject(false); setEditTutorForm({ ...editTutorForm, manualSubject: "" }); }} className="text-xs text-gray-500 hover:underline">
                    ← Back to dropdown
                  </button>
                </>
              )}
            </div>
          </div>
          <Input
            label="Tutor Rate / Hour"
            type="number"
            value={editTutorForm.tutorHourlyRate}
            onChange={(e) => setEditTutorForm({ ...editTutorForm, tutorHourlyRate: e.target.value })}
            placeholder="Enter tutor hourly rate"
          />
          <Input
            label="Student Rate / Hour"
            type="number"
            value={editTutorForm.studentHourlyRate}
            onChange={(e) => setEditTutorForm({ ...editTutorForm, studentHourlyRate: e.target.value })}
            placeholder="Enter student hourly rate"
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditAssignedTutor}>Save Changes</Button>
            <Button variant="secondary" onClick={() => {
              setEditTutorModal(false);
              setEditingTutor(null);
              setEditTutorForm({ name: "", subject: "", tutorHourlyRate: "", studentHourlyRate: "" });
            }}>Cancel</Button>
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
            <div className="space-y-2 mt-1">
              {!addClassManualSubject ? (
                <>
                  <select
                    value={classForm.subject}
                    onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                  <button type="button" onClick={() => setAddClassManualSubject(true)} className="text-xs text-blue-600 hover:underline">
                    + Type subject manually
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={classForm.manualSubject || ""}
                    onChange={(e) => setClassForm({ ...classForm, manualSubject: e.target.value })}
                    placeholder="Enter subject name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    disabled={schedulingClasses}
                  />
                  <button type="button" onClick={() => { setAddClassManualSubject(false); setClassForm({ ...classForm, manualSubject: "" }); }} className="text-xs text-gray-500 hover:underline">
                    ← Back to dropdown
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Package Total Hours (optional)"
              type="number"
              value={classForm.packageHours}
              onChange={(e) => setClassForm({ ...classForm, packageHours: e.target.value })}
              placeholder="e.g. 40"
              min="0"
              disabled={schedulingClasses}
            />
            <Input
              label="Hours Per Session"
              type="number"
              value={classForm.duration}
              onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })}
              min="0.5"
              step="0.5"
              disabled={schedulingClasses}
            />
          </div>

          {/* Calendar Component */}
          <ScheduleClassCalendar
            onDatesSelected={(dates, pkgData) => {
              setGeneratedDates(dates);
              if (pkgData) setGeneratedPackageData(pkgData);
            }}
            selectedDates={generatedDates}
            packageHours={classForm.packageHours ? Number(classForm.packageHours) : 0}
            hoursPerDay={classForm.duration ? Number(classForm.duration) : 1}
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

      {/* Edit Class Modal */}
      <Modal open={editClassModal} title="Edit Class Details" onClose={() => {
        setEditClassModal(false);
        setSelectedClass(null);
      }}>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {selectedClass && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Subject:</strong> {selectedClass.tutor?.subject}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Tutor:</strong> {selectedClass.tutor?.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> {selectedClass.status}
                </p>
              </div>

              {/* Date & Time Field */}
              <Input
                label="Date & Time"
                type="datetime-local"
                value={editClassForm.date}
                onChange={(e) => setEditClassForm({ ...editClassForm, date: e.target.value })}
                min={minDateTime}
              />

              {/* Duration Field */}
              <Input
                label="Duration (hours)"
                type="number"
                value={editClassForm.duration}
                onChange={(e) => setEditClassForm({ ...editClassForm, duration: e.target.value })}
                placeholder="e.g., 1, 1.5, 2"
                step="0.5"
                min="0.5"
              />

              {/* Tutor Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tutor Name (optional)</label>
                <select
                  value={editClassForm.tutorName}
                  onChange={(e) => {
                    const selectedTutorName = e.target.value;
                    setEditClassForm({ ...editClassForm, tutorName: selectedTutorName });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current tutor</option>
                  {tutorNameOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Field */}
              {editClassForm.tutorName && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <select
                    value={editClassForm.subject}
                    onChange={(e) => setEditClassForm({ ...editClassForm, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subject</option>
                    {assignedTutors
                      .filter((tutor) => tutor.name === editClassForm.tutorName)
                      .map((tutor) => (
                        <option key={tutor.subject} value={tutor.subject}>
                          {tutor.subject}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditClass}>Update Class</Button>
            <Button variant="secondary" onClick={() => {
              setEditClassModal(false);
              setSelectedClass(null);
            }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Update Class Status Modal */}
      <Modal open={updateClassStatusModal} title="Update Class Status" onClose={() => {
        setUpdateClassStatusModal(false);
        setSelectedClass(null);
      }}>
        <div className="p-6 space-y-4">
          {selectedClass && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-800">
                  <strong>Subject:</strong> {selectedClass.tutor?.subject}
                </p>
                <p className="text-sm text-purple-800">
                  <strong>Date:</strong> {new Date(selectedClass.date).toLocaleDateString("en-GB")} {new Date(selectedClass.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={updateClassStatusForm.status}
                  onChange={(e) => setUpdateClassStatusForm({ ...updateClassStatusForm, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={selectedClass.status}>{selectedClass.status}</option>
                  <option value="done">Done</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* New Date for Postponed Classes */}
              {updateClassStatusForm.status === "postponed" && (
                <Input
                  label="New Date & Time"
                  type="datetime-local"
                  value={updateClassStatusForm.newDate}
                  onChange={(e) => setUpdateClassStatusForm({ ...updateClassStatusForm, newDate: e.target.value })}
                  min={minDateTime}
                />
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateClassStatus}>Update Status</Button>
            <Button variant="secondary" onClick={() => {
              setUpdateClassStatusModal(false);
              setSelectedClass(null);
            }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Set Actual Time Modal */}
      <Modal
        open={setActualTimeModal}
        title="Set Actual Class Duration"
        onClose={() => {
          setSetActualTimeModal(false);
          setSetActualTimeTarget(null);
        }}
      >
        <div className="p-6 space-y-5">
          {setActualTimeTarget && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-indigo-800">{setActualTimeTarget.tutor?.subject}</p>
              <p className="text-xs text-indigo-600 mt-1">
                {new Date(setActualTimeTarget.date).toLocaleDateString("en-GB")}{" "}
                {new Date(setActualTimeTarget.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
              {setActualTimeTarget.classStartTime && (
                <p className="text-xs text-indigo-500 mt-1">
                  Started: {new Date(setActualTimeTarget.classStartTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  {setActualTimeTarget.classEndTime && (
                    <> · Ended: {new Date(setActualTimeTarget.classEndTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-slate-600">
            Enter the actual time spent in this class. This will mark the class as <strong>Done</strong> and update salary and package progress calculations.
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                value={setActualTimeHours}
                onChange={(e) => setSetActualTimeHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={setActualTimeMins}
                onChange={(e) => setSetActualTimeMins(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
              />
            </div>
          </div>

          {((Number(setActualTimeHours) || 0) * 60 + (Number(setActualTimeMins) || 0)) > 0 && (
            <p className="text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
              Total: {(Number(setActualTimeHours) || 0) > 0 ? `${setActualTimeHours}h ` : ""}{(Number(setActualTimeMins) || 0) > 0 ? `${setActualTimeMins}m` : ""}
              {" = "}{(Number(setActualTimeHours) || 0) * 60 + (Number(setActualTimeMins) || 0)} minutes
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSetActualTime} disabled={setActualTimeLoading}>
              {setActualTimeLoading ? "Saving..." : "Save & Mark Done"}
            </Button>
            <Button variant="secondary" onClick={() => {
              setSetActualTimeModal(false);
              setSetActualTimeTarget(null);
            }}>Cancel</Button>
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

          {/* Package Details in Edit Modal */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <span>📦</span> Package Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Package Hours (total)"
                type="number"
                min="0"
                step="0.5"
                value={studentForm.packageHours}
                onChange={(e) => setStudentForm({ ...studentForm, packageHours: e.target.value })}
                placeholder="e.g. 40"
              />
              <Input
                label="Hours Per Session"
                type="number"
                min="0.5"
                step="0.5"
                value={studentForm.hoursPerDay}
                onChange={(e) => setStudentForm({ ...studentForm, hoursPerDay: e.target.value })}
                placeholder="e.g. 1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium">Package Start Date</label>
                <input
                  type="date"
                  value={studentForm.packageStartDate}
                  onChange={(e) => setStudentForm({ ...studentForm, packageStartDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Package End Date</label>
                <input
                  type="date"
                  value={studentForm.packageEndDate}
                  onChange={(e) => setStudentForm({ ...studentForm, packageEndDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-sm font-medium">Schedule Pattern</label>
              <select
                value={studentForm.packagePattern}
                onChange={(e) => setStudentForm({ ...studentForm, packagePattern: e.target.value })}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all-days">All Days</option>
                <option value="all-mondays">All Mondays</option>
                <option value="all-tuesdays">All Tuesdays</option>
                <option value="all-wednesdays">All Wednesdays</option>
                <option value="all-thursdays">All Thursdays</option>
                <option value="all-fridays">All Fridays</option>
                <option value="all-saturdays">All Saturdays</option>
                <option value="all-sundays">All Sundays</option>
                <option value="weekdays">All Weekdays (Mon-Fri)</option>
                <option value="weekends">All Weekends (Sat-Sun)</option>
              </select>
            </div>
          </div>
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

      {/* Delete All Classes Modal */}
      <Modal open={deleteAllClassesModal} title="Delete All Classes" onClose={() => setDeleteAllClassesModal(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Trash2 className="text-orange-600 flex-shrink-0" size={20} />
            <p className="text-orange-800 text-sm font-medium">
              This will permanently delete all <strong>{classes?.length || 0} classes</strong> for this student.
            </p>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            This action cannot be undone. All scheduled, done, postponed and cancelled classes will be removed.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDeleteAllClasses}
              disabled={deleteAllLoading}
            >
              {deleteAllLoading ? "Deleting..." : "Delete All Classes"}
            </Button>
            <Button variant="secondary" onClick={() => setDeleteAllClassesModal(false)} disabled={deleteAllLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Edit Classes Modal */}
      <Modal
        open={bulkEditModal}
        title={`Bulk Edit ${selectedClassIds.length} Class${selectedClassIds.length !== 1 ? "es" : ""}`}
        onClose={() => {
          setBulkEditModal(false);
          setBulkEditForm({ date: "", duration: "", tutorName: "", subject: "" });
        }}
      >
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Only fill the fields you want to change. Empty fields will be left as-is for each selected class.
            </p>
          </div>

          {/* Date & Time */}
          <Input
            label="New Date & Time (optional)"
            type="datetime-local"
            value={bulkEditForm.date}
            onChange={(e) => setBulkEditForm({ ...bulkEditForm, date: e.target.value })}
            min={minDateTime}
          />

          {/* Duration */}
          <Input
            label="Duration in hours (optional)"
            type="number"
            value={bulkEditForm.duration}
            onChange={(e) => setBulkEditForm({ ...bulkEditForm, duration: e.target.value })}
            placeholder="e.g. 1, 1.5, 2"
            step="0.5"
            min="0.5"
          />

          {/* Tutor Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trainer Name (optional)</label>
            <select
              value={bulkEditForm.tutorName}
              onChange={(e) => {
                const name = e.target.value;
                const subjects = [
                  ...new Set(
                    assignedTutors
                      .filter((t) => t.name === name)
                      .map((t) => t.subject)
                      .filter(Boolean)
                  ),
                ];
                setBulkEditForm({
                  ...bulkEditForm,
                  tutorName: name,
                  subject: subjects[0] || "",
                });
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Keep existing trainer</option>
              {tutorNameOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Subject (shown only when trainer is selected) */}
          {bulkEditForm.tutorName && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <select
                value={bulkEditForm.subject}
                onChange={(e) => setBulkEditForm({ ...bulkEditForm, subject: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select subject</option>
                {assignedTutors
                  .filter((t) => t.name === bulkEditForm.tutorName)
                  .map((t) => (
                    <option key={t.subject} value={t.subject}>{t.subject}</option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleBulkEdit} disabled={bulkEditLoading}>
              {bulkEditLoading ? "Applying..." : `Apply to ${selectedClassIds.length} Class${selectedClassIds.length !== 1 ? "es" : ""}`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setBulkEditModal(false);
                setBulkEditForm({ date: "", duration: "", tutorName: "", subject: "" });
              }}
              disabled={bulkEditLoading}
            >
              Cancel
            </Button>
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
            {selectedTest ? ` on ${new Date(selectedTest.testDate).toLocaleDateString("en-US")}` : ""}
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