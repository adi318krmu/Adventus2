import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { KeyRound, Power, PowerOff, Search, Trash2 } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-mint">Admin Controls</p>
          <h1 className="mt-2 text-4xl font-bold">Student Account Management</h1>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
          <input className="input pl-10" placeholder="Search account" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn-outline" onClick={loadStudents}>Search</button>
      </div>

      <section className="card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="text-sm text-slate-400">
              <tr>
                <th className="py-3">Username</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Tuition ID</th>
                <th>Account Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t border-line">
                  <td className="py-4">@{student.username}</td>
                  <td className="font-semibold">{student.name}</td>
                  <td>Class {student.class}</td>
                  <td>{student.tuitionId}</td>
                  <td><StatusBadge status={accountLabel(student)} /></td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-outline !px-3" onClick={() => resetPassword(student)} title="Reset password"><KeyRound size={17} /></button>
                      {student.accountDisabled ? (
                        <button className="btn-outline !px-3" onClick={() => setDisabled(student, false)} title="Enable account"><Power size={17} /></button>
                      ) : (
                        <button className="btn-outline !px-3" onClick={() => setDisabled(student, true)} title="Disable account"><PowerOff size={17} /></button>
                      )}
                      <button className="btn-outline !px-3" onClick={() => deleteStudent(student)} title="Delete student"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td className="py-5 text-slate-400">Loading accounts...</td></tr>}
              {!loading && students.length === 0 && <tr><td className="py-5 text-slate-400">No student accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default StudentAccountManagement;
