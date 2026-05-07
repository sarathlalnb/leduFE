import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createRequest } from "../../../services/allAPI";
import { Calendar, BookOpen, Clock, CheckCircle, ArrowLeft } from "lucide-react";

const RequestClass = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClass = location.state?.selectedClass;

  const [requestType, setRequestType] = useState(null);
  const [reason, setReason] = useState("");
  const [postponedDate, setPostponedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!selectedClass) {
      navigate("/student/classes");
    }
  }, [selectedClass, navigate]);

  const handleSubmitRequest = async () => {
    if (!requestType) {
      alert("Please select an option");
      return;
    }

    if (requestType === "postpone" && !postponedDate) {
      alert("Please select your desired postponed date");
      return;
    }

    try {
      setSubmitting(true);
      const requestData = {
        classId: selectedClass._id,
        type: requestType,
        reason: reason || `Requesting to ${requestType === "postpone" ? "postpone" : "cancel"} class`,
        ...(requestType === "postpone" ? { postponedDate } : {}),
      };

      await createRequest(requestData);
      setSuccessMessage(`Your request to ${requestType === "postpone" ? "postpone" : "cancel"} the class has been submitted successfully!`);

      setTimeout(() => {
        navigate("/student/classes");
      }, 1500);
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
      day: date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
    };
  };

  if (!selectedClass) {
    return null;
  }

  const { date, time, day } = formatDate(selectedClass.date);
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/student/classes")}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Request Class Change
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Submit a request to postpone or cancel your class
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Class Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Selected Class</h2>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedClass.tutor?.subject || "N/A"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{day}, {date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{time}</span>
                    </div>
                    {selectedClass.tutor?.name && (
                      <p className="text-sm text-slate-500 mt-2">
                        Instructor: {selectedClass.tutor.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What would you like to do?
              </h2>

              <div className="space-y-3">
                {/* Postpone Option */}
                <button
                  onClick={() => setRequestType("postpone")}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    requestType === "postpone"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        requestType === "postpone"
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }`}
                    >
                      {requestType === "postpone" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Postpone Class
                      </p>
                      <p className="text-sm text-slate-600">
                        Request to schedule the class for a later date
                      </p>
                    </div>
                  </div>
                </button>

                {/* Cancel Option */}
                <button
                  onClick={() => setRequestType("cancel")}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    requestType === "cancel"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        requestType === "cancel"
                          ? "border-red-500 bg-red-500"
                          : "border-slate-300"
                      }`}
                    >
                      {requestType === "cancel" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Cancel Class
                      </p>
                      <p className="text-sm text-slate-600">
                        Request to cancel this class
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Additional Fields */}
            {requestType && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
                {requestType === "postpone" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Desired Postponed Date
                    </label>
                    <input
                      type="datetime-local"
                      value={postponedDate}
                      onChange={(e) => setPostponedDate(e.target.value)}
                      min={minDateTime}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide any additional details or reason for this request..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {requestType && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/student/classes")}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!requestType || submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestClass;