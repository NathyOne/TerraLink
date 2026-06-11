import { ArrowLeft, MessageSquareText, Save, SearchCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { machineTitle } from "../../utils/machines";
import { isMaterialRequest, requestCategoryLabel, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [request, setRequest] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ status: "pending", admin_notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [requestResponse, assignmentsResponse] = await Promise.all([
        api.get(`/machine-requests/${id}/`),
        api.get(`/assignments/?machine_request=${id}`),
      ]);
      setRequest(requestResponse.data);
      setForm({ status: requestResponse.data.status, admin_notes: requestResponse.data.admin_notes || "" });
      setAssignments(toList(assignmentsResponse.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch(`/machine-requests/${id}/`, form);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading request" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/requests" className={secondaryButtonClass}>
          <ArrowLeft size={17} />
          {t("Requests")}
        </Link>
        {request && !isMaterialRequest(request) ? (
          <>
            <button className={secondaryButtonClass} onClick={() => navigate(`/admin/matching?request=${id}`)}>
              <SearchCheck size={17} />
              {t("Match machines")}
            </button>
            <button className={secondaryButtonClass} onClick={() => navigate(`/admin/send-message?request=${id}`)}>
              <MessageSquareText size={17} />
              {t("Send message")}
            </button>
          </>
        ) : null}
      </div>
      <ErrorBlock message={error} />
      {request ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{requestDisplayName(request, t)}</h2>
                <p className="mt-1 text-sm font-medium text-stone-500">{request.requested_by?.username} - {request.location}</p>
              </div>
              <StatusBadge value={request.status} />
            </div>
            <div className="mt-6 grid gap-4 border-y border-stone-200 py-5 text-sm font-medium text-stone-600 sm:grid-cols-4">
              <div><span className="block text-xs font-bold uppercase text-stone-400">{t("Request type")}</span>{t(requestCategoryLabel(request.request_category))}</div>
              <div><span className="block text-xs font-bold uppercase text-stone-400">{t("Item")}</span>{t(requestItem(request))}</div>
              <div><span className="block text-xs font-bold uppercase text-stone-400">{t("Quantity")}</span>{request.quantity || 1}</div>
              <div><span className="block text-xs font-bold uppercase text-stone-400">{t("Needed date")}</span>{shortDate(request.expected_start_date)}</div>
            </div>
            {request.description ? <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">{request.description}</p> : null}
          </article>

          <form onSubmit={save} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-slate-950">{t("Admin Tracking")}</h3>
            <div className="mt-4 grid gap-4">
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">{t("Pending")}</option>
                  <option value="reviewing">{t("Reviewing")}</option>
                  <option value="contacted">{t("Contacted")}</option>
                  <option value="assigned">{t("Assigned")}</option>
                  <option value="completed">{t("Completed")}</option>
                  <option value="cancelled">{t("Cancelled")}</option>
                </select>
              </Field>
              <Field label="Admin notes">
                <textarea className={`${inputClass} min-h-36`} value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} />
              </Field>
              <button disabled={saving} className={buttonClass} type="submit">
                <Save size={17} />
                {t("Save tracking")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <section>
        <h3 className="mb-3 text-lg font-bold text-slate-950">{t("Assignments")}</h3>
        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-sm font-medium text-stone-500">{t("No machines assigned.")}</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Machine")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Owner")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-4 py-4 font-semibold text-slate-950">{machineTitle(assignment.machine)}</td>
                      <td className="px-4 py-4 text-sm font-medium text-stone-600">{assignment.machine_owner?.username}</td>
                      <td className="px-4 py-4"><StatusBadge value={assignment.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
