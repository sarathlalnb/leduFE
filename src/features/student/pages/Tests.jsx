import { useEffect, useState } from "react";
import { getStudentTests } from "../../../services/allAPI";
import { Calendar, Award, ClipboardCheck, Star, XCircle } from "lucide-react";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getStudentTests();
      setTests(res.data || []);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const stats = tests.reduce(
    (acc, test) => {
      if (test.marks != null && test.totalMarks != null) {
        acc.completed += 1;
        const ratio = Number(test.marks) / Number(test.totalMarks);
        if (ratio >= 0.85) acc.excellent += 1;
        else if (ratio >= 0.6) acc.good += 1;
        else acc.needsReview += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    },
    { completed: 0, pending: 0, excellent: 0, good: 0, needsReview: 0 }
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Test Overview</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Your test history</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 max-w-2xl">
                Review all your past and upcoming tests with detailed results, grades, and test dates. This page is built for easy scanning on mobile and desktop.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{tests.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-emerald-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Excellent</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-900">{stats.excellent}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-sky-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Good</p>
                <p className="mt-2 text-3xl font-semibold text-sky-900">{stats.good}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-amber-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-amber-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Loading tests...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-dashed border-red-300 bg-red-50 p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-red-900">Error Loading Tests</p>
            <p className="mt-3 text-sm text-red-700">{error}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm">
            <p className="text-xl font-semibold text-slate-900">No tests available</p>
            <p className="mt-3 text-sm">Your upcoming tests will appear here once they are scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {tests.map((test) => {
             
              const percent = test.marks != null && test.totalMarks != null ? Math.round((Number(test.marks) / Number(test.totalMarks)) * 100) : null;

              return (
                <div key={test._id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{test.subject || "General Test"}</h2>
                    </div>
                    
                  </div>

                  <div className="mt-6 space-y-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(test.testDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>{test.totalMarks ? `${test.marks ?? "-"}/${test.totalMarks} Marks` : "Marks not recorded"}</span>
                    </div>
                    {percent != null && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-slate-400" />
                        <span>{percent}% score</span>
                      </div>
                    )}
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Remarks</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{test.remarks || "No notes available for this test."}</p>
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

export default Tests;