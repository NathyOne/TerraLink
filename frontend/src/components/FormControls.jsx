import { useI18n } from "../i18n/I18nContext";

export function Field({ label, children }) {
  const { t } = useI18n();
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{t(label)}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100";

export const buttonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60";
