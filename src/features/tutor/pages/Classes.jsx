import { useEffect, useState } from "react";
import { getTutorDashboard, updateClassStatus } from "../../../services/allAPI";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";

const TutorClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getTutorDashboard();
      setClasses(res.data?.upcomingClasses || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleStatusChange = async (classId, status) => {
    try {
      await updateClassStatus(classId, { status });
      fetchClasses();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update class status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="text-purple-600" size={20} />
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "ExpressaSerial-Bold" }}>My classes</h1>
        </div>
        <p className="text-sm text-slate-600">Your upcoming lessons are shown here in chronological order.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-200 border-t-purple-600" />
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">No classes available.</div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => (
            <div key={cls._id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{cls.tutor?.subject || "Class"}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(cls.date).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-500">Duration: {cls.duration || 1} hr</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleStatusChange(cls._id, "done")} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
                    <CheckCircle2 size={16} /> Mark done
                  </button>
                  <button onClick={() => handleStatusChange(cls._id, "cancelled")} className="flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white">
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorClasses;
