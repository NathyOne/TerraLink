import { useI18n } from "../i18n/I18nContext";

export function LoadingBlock({ label = "Loading" }) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm font-medium text-stone-500 shadow-soft">
      {t(label)}
    </div>
  );
}

export function EmptyBlock({ label = "No records found." }) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-sm font-medium text-stone-500">
      {t(label)}
    </div>
  );
}

export function ErrorBlock({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
      {message}
    </div>
  );
}
