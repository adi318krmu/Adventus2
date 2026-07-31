import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { KeyRound, Power, PowerOff, Search, Trash2, Users } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import JapaneseDivider from "../components/JapaneseDivider";
import api from "../utils/api";

const accountLabel = (student) => {
  if (student.accountDisabled) return "Disabled";
  return student.accountStatus || "Approved";
};

const StudentAccountManagement = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ all: "true", search }).toString();
      const { data } = await api.get(`/admin/students?${query}`);
      setStudents(data);
    } catch {
      toast.error("Unable to load student accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const resetPassword = async (student) => {
    const password = window.prompt(`Enter a new password for ${student.name}`);
    if (!password) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    await api.put(`/admin/reset-password/${student._id}`, { password });
    toast.success("Password reset successfully");
  };

  const setDisabled = async (student, disabled) => {
    await api.put(`/admin/${disabled ? "disable-account" : "enable-account"}/${student._id}`);
    toast.success(disabled ? "Account disabled" : "Account enabled");
    loadStudents();
  };

  const deleteStudent = async (student) => {
    if (!confirm(`Delete ${student.name} and all payment records?`)) return;
    await api.delete(`/student/${student._id}`);
    toast.success("Student deleted");
    loadStudents();
  };

  return (
    <Shell type="admin">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-amber-500/30 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
            <Users size={14} /> Apprentice Registry
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-white">Student Account Management</h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-stone-500" size={16} />
            <input className="input pl-9 !py-2 text-xs" placeholder="Search account by username or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary text-xs font-display uppercase tracking-wider !py-2 !px-4" onClick={loadStudents}>Search</button>
        </div>
      </div>

      <section className="card mt-6 border-amber-500/30 p-6 shadow-samuraiGold">
        <JapaneseDivider className="mb-6" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="px-4">Student Name</th>
                <th className="px-4">Class</th>
                <th className="px-4">Tuition ID</th>
                <th className="px-4">Account Status</th>
                <th className="px-4">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-mono text-stone-300">@{student.username}</td>
                  <td className="px-4 font-bold text-white">{student.name}</td>
                  <td className="px-4 font-bold font-display text-amber-400">Class {student.class}</td>
                  <td className="px-4 font-mono text-stone-400">{student.tuitionId}</td>
                  <td className="px-4"><StatusBadge status={accountLabel(student)} /></td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1" onClick={() => resetPassword(student)} title="Reset Password"><KeyRound size={14} /> Reset Pass</button>
                      {student.accountDisabled ? (
                        <button className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1" onClick={() => setDisabled(student, false)} title="Enable Account"><Power size={14} /> Enable</button>
                      ) : (
                        <button className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 flex items-center gap-1" onClick={() => setDisabled(student, true)} title="Disable Account"><PowerOff size={14} /> Disable</button>
                      )}
                      <button className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60" onClick={() => deleteStudent(student)} title="Delete Student"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={6} className="py-6 text-center text-stone-400">Loading student accounts...</td></tr>}
              {!loading && students.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-stone-400">No student accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default StudentAccountManagement;
