import { useI18n } from "../i18n/I18nContext";

export default function StatCard({ label, value, icon: Icon, accent = "bg-slate-900 text-white" }) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500">{t(label)}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value ?? 0}</p>
        </div>
        {Icon ? (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}>
            <Icon size={20} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
