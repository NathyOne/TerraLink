import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { machineTitle } from "../../utils/machines";
import { isEquipmentRequest, requestDisplayName } from "../../utils/requestOptions";

export default function Assignments() {
  const { t } = useI18n();
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ machine_request_id: "", machine_id: "", status: "proposed" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [assignmentsResponse, requestsResponse, machinesResponse] = await Promise.all([
        api.get("/assignments/?ordering=-created_at"),
        api.get("/machine-requests/?ordering=-created_at"),
        api.get("/machines/?ordering=-created_at"),
      ]);
      setAssignments(toList(assignmentsResponse.data));
      setRequests(toList(requestsResponse.data).filter(isEquipmentRequest));
      setMachines(toList(machinesResponse.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const createAssignment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/assignments/", form);
      setForm({ machine_request_id: "", machine_id: "", status: "proposed" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (assignment, status) => {
    try {
      await api.patch(`/assignments/${assignment.id}/`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Machine Assignments")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Admin-managed selected machines for client requests.")}</p>
      </div>
      <form onSubmit={createAssignment} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_auto]">
          <Field label="Request">
            <select className={inputClass} value={form.machine_request_id} onChange={(e) => setForm({ ...form, machine_request_id: e.target.value })} required>
              <option value="">{t("Select request")}</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>{requestDisplayName(request, t)}</option>
              ))}
            </select>
          </Field>
          <Field label="Machine">
            <select className={inputClass} value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })} required>
              <option value="">{t("Select machine")}</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>{machineTitle(machine)} - {machine.owner?.username}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="proposed">{t("Proposed")}</option>
              <option value="accepted">{t("Accepted")}</option>
              <option value="rejected">{t("Rejected")}</option>
              <option value="active">{t("Active")}</option>
              <option value="completed">{t("Completed")}</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Plus size={17} />
              {t("Create")}
            </button>
          </div>
        </div>
      </form>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading assignments" />
      ) : assignments.length === 0 ? (
        <EmptyBlock label="No assignments yet." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Request")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Machine")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Owner")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Status")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Created")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-4 font-semibold text-slate-950">{requestDisplayName(assignment.machine_request, t)}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machineTitle(assignment.machine)}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{assignment.machine_owner?.username}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={assignment.status} />
                        <select className={`${inputClass} max-w-44`} value={assignment.status} onChange={(e) => updateStatus(assignment, e.target.value)}>
                          <option value="proposed">{t("Proposed")}</option>
                          <option value="accepted">{t("Accepted")}</option>
                          <option value="rejected">{t("Rejected")}</option>
                          <option value="active">{t("Active")}</option>
                          <option value="completed">{t("Completed")}</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{shortDate(assignment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
