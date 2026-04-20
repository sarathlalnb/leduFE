import { useEffect, useState } from "react";
import {
  getAllRequests,
  handleRequest,
} from "../../../services/allAPI";
import { Clock, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllRequests(filters);
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const handleAction = async (id, status, type) => {
    try {
      let payload = { status };

      if (status === "approved" && type === "postpone") {
        const newDate = prompt("Enter new date (YYYY-MM-DD HH:mm)");
        if (!newDate) return;

        payload.newDate = newDate;
      }

      await handleRequest(id, payload);
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "pending":
        return <Clock className="text-amber-500" size={20} />;
      case "approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-300";
      case "approved":
        return "bg-green-100 text-green-700 border border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getTypeColor = (type) => {
    return type === "postpone" 
      ? "bg-blue-100 text-blue-700 border border-blue-300"
      : "bg-red-100 text-red-700 border border-red-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 gradient-bg text-white rounded-xl">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Requests</h1>
              <p className="text-gray-600 mt-1">Manage postpone and cancellation requests</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Filter Requests</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-red-500 outline-none transition-all"
              >
                <option value="">All Types</option>
                <option value="postpone">Postpone Class</option>
                <option value="cancel">Cancel Class</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium">
            {loading ? "Loading..." : `${requests.length} request${requests.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 rounded-full gradient-bg opacity-50"></div>
            </div>
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
              >
                {/* Card Header */}
                <div className="h-1 gradient-bg"></div>

                <div className="p-6 space-y-4">
                  {/* Student & Status Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full gradient-bg text-white flex items-center justify-center font-bold flex-shrink-0">
                        {r.student?.name?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                          {r.student?.name}
                        </h3>
                        <p className="text-sm text-gray-600">{r.student?.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(r.status)}
                    </div>
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Type</p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(r.type)}`}>
                          {r.type}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class Information */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Class Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(r.classId?.date).toLocaleString()}
                    </p>
                    {r.type === "postpone" && r.postponedDate && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Requested Postponed Date</p>
                        <p className="text-sm font-semibold text-blue-700">
                          {new Date(r.postponedDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  {r.reason && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Reason</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                        "{r.reason}"
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {r.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() =>
                          handleAction(r._id, "approved", r.type)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleAction(r._id, "rejected", r.type)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  )}

                  {r.status !== "pending" && (
                    <div className={`p-3 rounded-lg text-center text-sm font-medium ${
                      r.status === "approved"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {r.status === "approved" ? "✓ Request Approved" : "✗ Request Rejected"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No requests found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Requests;