import { useEffect, useState } from "react";
import { getMyRequests } from "../../../services/allAPI";
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getMyRequests();
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          label: "Approved",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-rose-100 text-rose-800 border-rose-200",
          icon: <XCircle className="w-4 h-4" />,
        };
      case "pending":
      default:
        return {
          label: "Pending",
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <AlertTriangle className="w-4 h-4" />,
        };
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "cancel":
        return "Cancel Class";
      case "postpone":
        return "Postpone Class";
      default:
        return "Request";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const summary = requests.reduce(
    (acc, request) => {
      const status = request.status?.toLowerCase() || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                Student Requests
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                View all your class requests
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                This page shows every request you submitted for postponing or canceling classes, along with class details, request notes, and current status.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Total Requests</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{requests.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-amber-50 p-4 text-center">
                <p className="text-sm text-amber-700">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.pending}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm text-emerald-700">Approved</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">{summary.approved}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-xl font-semibold text-slate-900">No requests found</p>
            <p className="mt-2 text-sm text-slate-500">You haven't submitted any postpone or cancel requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => {
              const statusInfo = getStatusLabel(request.status);
              const classInfo = request.classId || {};
              const classDate = formatDate(classInfo.date);
              const createdDate = formatDate(request.createdAt);

              return (
                <div key={request._id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{getRequestTypeLabel(request.type)}</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">{classInfo.tutor?.subject || "Unknown subject"}</h2>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{classDate}</span>
                    </div>
                    {request.type === "postpone" && request.postponedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-600 font-medium">Requested: {formatDate(request.postponedDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{classInfo.tutor?.name || "Tutor not assigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Requested on {createdDate}</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold">Reason</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {request.reason || "No additional details provided."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;