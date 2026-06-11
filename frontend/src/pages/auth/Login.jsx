import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hammer, LogIn } from "lucide-react";

import { getErrorMessage } from "../../api/client";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { ErrorBlock } from "../../components/DataState";
import { roleHome, useAuthStore } from "../../store/authStore";
import LanguageSwitch from "../../components/LanguageSwitch";
import { useI18n } from "../../i18n/I18nContext";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t } = useI18n();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const user = await login(form);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Hammer size={21} />
          </span>
          <span className="text-xl font-bold text-slate-950">TerraLink</span>
        </Link>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-950">{t("Login")}</h1>
          <LanguageSwitch />
        </div>
        <div className="mt-5 space-y-4">
          <ErrorBlock message={error} />
          <Field label="Username">
            <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
          </Field>
          <button disabled={saving} className={`${buttonClass} w-full`} type="submit">
            <LogIn size={17} />
            {t("Login")}
          </button>
        </div>
        <p className="mt-5 text-center text-sm font-medium text-stone-600">
          {t("Need an account?")}{" "}
          <Link className="font-bold text-slate-950" to="/register">
            {t("Register")}
          </Link>
        </p>
      </form>
    </div>
  );
}
