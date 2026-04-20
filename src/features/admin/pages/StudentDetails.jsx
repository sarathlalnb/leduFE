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

  // Handler functions
  const handleAssignTutor = async () => {
    try {
      await assignTutor(id, tutorForm);
      setAssignTutorModal(false);
      setTutorForm({ name: "", subject: "", hourlyRate: "" });
      fetchStudent();
    } catch (err) {
      console.log(err);
    }
  };

  const handleScheduleClass = async () => {
    try {
      if (generatedDates.length === 0) {
        alert("Please generate a schedule first");
        return;
      }

      setSchedulingClasses(true);
      
      // Create a class for each generated date (dates already include time)
      for (const dateTimeStr of generatedDates) {
        await scheduleClass(id, {
          tutorName: classForm.tutorName,
          subject: classForm.subject,
          date: dateTimeStr,
          duration: classForm.duration
        });
      }
      
      setAddClassModal(false);
      setClassForm({ tutorName: "", subject: "", dates: [], duration: 1 });
      setGeneratedDates([]);
      fetchStudent();
    } catch (err) {
      console.log(err);
      alert("Error scheduling classes");
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
    try {
      await updateStudent(id, studentForm);
      setEditStudentModal(false);
      fetchStudent();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(id);
      navigate("/admin/students");
    } catch (err) {
      console.log(err);
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
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                profile.mode === "Online"
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
              onClick={() => setAddClassModal(true)}
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
                    {profile.subjects?.map((sub, i) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-purple-500/20 text-gray-900 font-semibold rounded-full border border-red-300/30 text-sm">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tutors */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-3">Assigned Tutors</p>
                  <div className="space-y-3">
                    {profile.tutors?.map((t, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
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

            {/* Classes */}
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
                    {classes.map((c) => (
                      <div key={c._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{c.tutor?.subject || "Subject"}</p>
                          <p className="text-sm text-gray-600 mt-1">{new Date(c.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            c.status === "completed"
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
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isPass ? "bg-green-500/10" : "bg-red-500/10"
                          }`}>
                            <Award className={isPass ? "text-green-600" : "text-red-600"} size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{t.subject}</p>
                            <p className="text-sm text-gray-600 mt-1">{new Date(t.testDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900">{t.marks}/{t.totalMarks}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                              isPass
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
                      ? Math.round((tests.reduce((sum, t) => sum + (t.marks / t.totalMarks), 0) / tests.length) * 100)
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
          <Input
            label="Subject"
            value={tutorForm.subject}
            onChange={(e) => setTutorForm({ ...tutorForm, subject: e.target.value })}
            placeholder="Enter subject"
          />
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
          <Input
            label="Tutor Name"
            value={classForm.tutorName}
            onChange={(e) => setClassForm({ ...classForm, tutorName: e.target.value })}
            placeholder="Enter tutor name"
            disabled={schedulingClasses}
          />
          <Input
            label="Subject"
            value={classForm.subject}
            onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
            placeholder="Enter subject"
            disabled={schedulingClasses}
          />
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
          <Input
            label="Name"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
          />
          <Input
            label="Parent Name"
            value={studentForm.parentName}
            onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
          />
          <Input
            label="Parent Phone"
            value={studentForm.parentPhone}
            onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
          />
          <Input
            label="School"
            value={studentForm.school}
            onChange={(e) => setStudentForm({ ...studentForm, school: e.target.value })}
          />
          <Input
            label="Syllabus"
            value={studentForm.syllabus}
            onChange={(e) => setStudentForm({ ...studentForm, syllabus: e.target.value })}
          />
          <Input
            label="Standard"
            value={studentForm.standard}
            onChange={(e) => setStudentForm({ ...studentForm, standard: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium">Mode</label>
            <select
              value={studentForm.mode}
              onChange={(e) => setStudentForm({ ...studentForm, mode: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
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
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateStudent}>Update Student</Button>
            <Button variant="secondary" onClick={() => setEditStudentModal(false)}>Cancel</Button>
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
            {selectedTest ? ` on ${new Date(selectedTest.testDate).toLocaleDateString()}` : ""}
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