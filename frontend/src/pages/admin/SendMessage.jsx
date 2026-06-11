import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api, getErrorMessage, toList } from "../../api/client";
import { ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { useI18n } from "../../i18n/I18nContext";
import { isEquipmentRequest, requestDisplayName } from "../../utils/requestOptions";

export default function SendMessage() {
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const [requests, setRequests] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    machine_request_id: searchParams.get("request") || "",
    recipient_machine_owner_id: searchParams.get("owner") || "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [requestsResponse, ownersResponse] = await Promise.all([
          api.get("/machine-requests/?ordering=-created_at"),
          api.get("/users/?role=machine_owner&ordering=username"),
        ]);
        if (!alive) return;
        const requestList = toList(requestsResponse.data).filter(isEquipmentRequest);
        setRequests(requestList);
        if (form.machine_request_id && !requestList.some((request) => String(request.id) === String(form.machine_request_id))) {
          setForm((current) => ({ ...current, machine_request_id: requestList[0]?.id || "" }));
        }
        setOwners(toList(ownersResponse.data));
      } catch (err) {
        if (alive) setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/messages/", form);
      await api.patch(`/machine-requests/${form.machine_request_id}/`, { status: "contacted" });
      setSuccess(t("Message sent."));
      setForm({ ...form, message: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading message form" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Send Message")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Contact a matching machine owner.")}</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <ErrorBlock message={error} />
          {success ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</div> : null}
          <Field label="Machine request">
            <select className={inputClass} value={form.machine_request_id} onChange={(e) => setForm({ ...form, machine_request_id: e.target.value })} required>
              <option value="">{t("Select request")}</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>{requestDisplayName(request, t)} - {request.location || "-"}</option>
              ))}
            </select>
          </Field>
          <Field label="Machine owner">
            <select className={inputClass} value={form.recipient_machine_owner_id} onChange={(e) => setForm({ ...form, recipient_machine_owner_id: e.target.value })} required>
              <option value="">{t("Select owner")}</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.username} - {owner.phone_number || owner.email}</option>
              ))}
            </select>
          </Field>
          <Field label="Message">
            <textarea className={`${inputClass} min-h-40`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </Field>
          <div className="flex justify-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Send size={17} />
              {t("Send message")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
