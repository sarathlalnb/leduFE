import { useState } from "react";
import { X, Plus } from "lucide-react";
import { registerStudent } from "../../../services/allAPI";

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    parentName: "",
    parentPhone: "",
    school: "",
    syllabus: "",
    standard: "",
    mode: "offline",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (subject) => {
    setSubjects(subjects.filter((s) => s !== subject));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.parentName ||
      !formData.parentPhone ||
      !formData.school ||
      !formData.standard
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await registerStudent({
        ...formData,
        subjects,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        parentName: "",
        parentPhone: "",
        school: "",
        syllabus: "",
        standard: "",
        mode: "offline",
        remarks: "",
      });
      setSubjects([]);
      setNewSubject("");

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register student");
      alert("Failed to add student")
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Student Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set secure password"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School *
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="School name"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard *
                </label>
                <input
                  type="text"
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  placeholder="e.g., 10th, 12th"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus
                </label>
                <input
                  type="text"
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleChange}
                  placeholder="e.g., CBSE"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode *
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                >
                  <option selected value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Any additional remarks"
                rows="3"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Parent Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Parent Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="Parent/Guardian name"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone *
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Subjects</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
                placeholder="Add subject and press Enter"
                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-purple-500/20 text-gray-900 font-semibold rounded-full border border-red-300/30 flex items-center gap-2"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-slate-200 text-gray-900 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
