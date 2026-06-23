import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hammer, Loader2, UserPlus } from "lucide-react";

import { getErrorMessage } from "../../api/client";
import { ErrorBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { roleHome, useAuthStore } from "../../store/authStore";
import LanguageSwitch from "../../components/LanguageSwitch";
import { useI18n } from "../../i18n/I18nContext";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const { t } = useI18n();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "construction_owner",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const user = await register(form);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Hammer size={21} />
          </span>
          <span className="text-xl font-bold text-slate-950">TerraLink</span>
        </Link>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-950">{t("Register")}</h1>
          <LanguageSwitch />
        </div>
        <div className="mt-5 grid gap-4">
          <ErrorBlock message={error} />
          <Field label="Account type">
            <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="construction_owner">{t("Construction Owner")}</option>
              <option value="machine_owner">{t("Machine Owner")}</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Username">
              <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </Field>
            <Field label="Phone">
              <input className={inputClass} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Password">
            <span className="relative block">
              <input
                className={`${inputClass} pr-11`}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </Field>
          <button disabled={saving} className={`${buttonClass} w-full`} type="submit">
            {saving ? <Loader2 className="animate-spin" size={17} /> : <UserPlus size={17} />}
            {saving ? t("Creating account...") : t("Create account")}
          </button>
        </div>
        <p className="mt-5 text-center text-sm font-medium text-stone-600">
          {t("Already registered?")}{" "}
          <Link className="font-bold text-slate-950" to="/login">
            {t("Login")}
          </Link>
        </p>
      </form>
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/20 bg-white p-6 text-center shadow-soft">
            <div className="mb-4 h-14 w-14 rounded-full bg-amber-50 p-2">
              <Loader2 className="h-full w-full animate-spin text-amber-600" size={40} />
            </div>
            <p className="text-base font-bold text-slate-950">{t("Creating account...")}</p>
            <p className="mt-1 text-sm font-medium text-stone-500">{t("Please wait while we prepare your dashboard.")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
