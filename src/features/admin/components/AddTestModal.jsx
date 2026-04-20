import { useState } from "react";
import { X } from "lucide-react";
import { createTest } from "../../../services/allAPI";

const AddTestModal = ({ isOpen, onClose, onSuccess, studentId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    testDate: "",
    totalMarks: "",
    marks: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.subject || !formData.testDate || !formData.totalMarks) {
      setError("Subject, test date, and total marks are required");
      return;
    }

    setLoading(true);
    try {
      const testData = {
        subject: formData.subject,
        testDate: formData.testDate,
        totalMarks: parseInt(formData.totalMarks),
        marks: formData.marks ? parseInt(formData.marks) : 0,
        remarks: formData.remarks,
      };

      await createTest(studentId, testData);

      // Reset form
      setFormData({
        subject: "",
        testDate: "",
        totalMarks: "",
        marks: "",
        remarks: "",
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Test</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter Topic Name"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Date *
            </label>
            <input
              type="date"
              name="testDate"
              value={formData.testDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                placeholder="100"
                min="1"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks Obtained
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                placeholder="85"
                min="0"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
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
              placeholder="Additional notes about the test..."
              rows="3"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestModal;