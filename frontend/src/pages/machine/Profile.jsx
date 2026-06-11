import { Save } from "lucide-react";
import { useState } from "react";

import { api, getErrorMessage } from "../../api/client";
import { ErrorBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { useI18n } from "../../i18n/I18nContext";
import { useAuthStore } from "../../store/authStore";
import { roleLabel } from "../../utils/format";

export default function Profile() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const access = useAuthStore((state) => state.access);
  const refresh = useAuthStore((state) => state.refresh);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const response = await api.patch("/auth/me/", form);
      setSession({ access, refresh, user: response.data });
      setSuccess(t("Profile saved."));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Profile")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t(roleLabel[user?.role])}</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <ErrorBlock message={error} />
          {success ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</div> : null}
          <Field label="Username">
            <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </Field>
          <div className="flex justify-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Save size={17} />
              {t("Save profile")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
