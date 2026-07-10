import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Key, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import api from "../../utils/api";

const PasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tempPassword, setTempPassword] = useState("");
  const [approvedPassword, setApprovedPassword] = useState("");

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/password-request");
      setRequests(data);
    } catch {
      toast.error("Failed to load password requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openApproveModal = (req) => {
    const generated = `ADV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTempPassword(generated);
    setSelectedRequest(req);
    setApprovedPassword("");
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!tempPassword || tempPassword.length < 6) {
      return toast.error("Temporary password must be at least 6 characters");
    }

    try {
      await api.put(`/password-request/${selectedRequest._id}/approve`, {
        tempPassword
      });
      toast.success("Password Reset Approved");
      setApprovedPassword(tempPassword);
      loadRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
      setSelectedRequest(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await api.put(`/password-request/${id}/reject`);
      toast.success("Request Rejected");
      loadRequests();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const pending = requests.filter((r) => r.status === "Pending");
  const resolved = requests.filter((r) => r.status !== "Pending");

  return (
    <Shell type="admin">
      <div>
        <p className="text-mint">Admin Console</p>
        <h1 className="text-4xl font-bold">Password Reset Requests</h1>
        <p className="mt-1 text-slate-400">View and resolve student password recovery and login requests.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-mint">Pending Requests</h2>
            <span className="badge border-mint bg-mint/10 text-mint font-semibold">
              {pending.length} Pending
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="text-sm text-slate-400">
                <tr>
                  <th className="py-3">Student details</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-5 text-slate-400">
                      No pending requests found.
                    </td>
                  </tr>
                ) : (
                  pending.map((req) => (
                    <tr key={req._id} className="border-t border-line">
                      <td className="py-4">
                        <p className="font-semibold text-white">{req.name}</p>
                        <p className="text-xs text-slate-400">
                          {req.email} | {req.phone}
                        </p>
                      </td>
                      <td>{new Date(req.requestedAt).toLocaleString()}</td>
                      <td>
                        <span className="badge border-amber-500 bg-amber-500/10 text-amber-500">
                          Pending
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApproveModal(req)}
                            className="btn-outline !py-2 !px-3 hover:!border-mint hover:!bg-mint/10 hover:!text-mint"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="btn-outline !py-2 !px-3 hover:!border-rose-500 hover:!bg-rose-500/10 hover:!text-rose-500"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="card h-fit">
          <h2 className="text-xl font-bold text-mint mb-5">History</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {resolved.map((req) => (
              <div key={req._id} className="border-t border-line py-3">
                <p className="font-semibold text-white">{req.name}</p>
                <p className="text-xs text-slate-400">{req.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge ${
                      req.status === "Approved"
                        ? "border-mint bg-mint/10 text-mint"
                        : "border-rose-500 bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {new Date(req.resolvedAt || req.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {!loading && resolved.length === 0 && (
              <p className="text-sm text-slate-500">No resolved requests yet.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Approve Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-5">
          <div className="card w-full max-w-lg">
            {!approvedPassword ? (
              <form onSubmit={handleApprove}>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="text-mint" /> Approve Password Reset
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Approving password reset request for <strong>{selectedRequest.name}</strong>.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Temporary Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input
                        className="input pl-10"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      You can use the automatically generated password above or enter a custom one.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="btn-primary flex-1">Approve Request</button>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="text-mint mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold text-white">Reset Approved Successfully!</h3>
                <p className="text-slate-400 text-sm mt-2">
                  The password for <strong>{selectedRequest.name}</strong> has been updated.
                </p>

                <div className="mt-6 bg-panelSoft border border-line rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Temporary Password</p>
                  <p className="text-2xl font-mono text-mint mt-2 tracking-wide select-all font-bold">{approvedPassword}</p>
                </div>
                <p className="text-xs text-amber-500 mt-3 font-semibold">
                  * Copy this temporary password and share it with the student. They will be forced to change it upon their next login.
                </p>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="btn-primary mt-6 w-full"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
};

export default PasswordRequests;
