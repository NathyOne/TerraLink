import { MessageSquareText, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { currency } from "../../utils/format";
import { machineTitle } from "../../utils/machines";

export default function MachinesManagement() {
  const { t } = useI18n();
  const [machines, setMachines] = useState([]);
  const [filters, setFilters] = useState({ search: "", machine_type__icontains: "", location__icontains: "", availability_status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await api.get(`/machines/?${params.toString()}`);
      setMachines(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.machine_type__icontains, filters.location__icontains, filters.availability_status]);

  const updateAvailability = async (machine, availability_status) => {
    try {
      await api.patch(`/machines/${machine.id}/`, { availability_status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Machines Management")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Registered heavy equipment network.")}</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_180px_180px_200px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input className={`${inputClass} pl-10`} placeholder={t("Search machines")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
        <input className={inputClass} placeholder={t("Type")} value={filters.machine_type__icontains} onChange={(e) => setFilters({ ...filters, machine_type__icontains: e.target.value })} />
        <input className={inputClass} placeholder={t("Location")} value={filters.location__icontains} onChange={(e) => setFilters({ ...filters, location__icontains: e.target.value })} />
        <select className={inputClass} value={filters.availability_status} onChange={(e) => setFilters({ ...filters, availability_status: e.target.value })}>
          <option value="">{t("All availability")}</option>
          <option value="available">{t("Available")}</option>
          <option value="busy">{t("Busy")}</option>
          <option value="maintenance">{t("Maintenance")}</option>
          <option value="unavailable">{t("Unavailable")}</option>
        </select>
      </div>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading machines" />
      ) : machines.length === 0 ? (
        <EmptyBlock label="No machines found." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Machine")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Plate")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Owner")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Phone")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Location")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Rates")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Availability")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {machines.map((machine) => (
                  <tr key={machine.id}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{machineTitle(machine)}</p>
                      <p className="text-sm font-medium text-stone-500">{machine.machine_type}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machine.plate_number || "-"}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machine.owner?.username}</td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-40 flex-col gap-2">
                        <span className="text-sm font-bold text-slate-950">{machine.owner?.phone_number || "-"}</span>
                        {machine.owner?.phone_number ? (
                          <div className="flex gap-2">
                            <a className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-stone-300 px-2 text-xs font-bold text-slate-700 hover:bg-stone-50" href={`tel:${machine.owner.phone_number}`}>
                              <Phone size={14} />
                              {t("Call")}
                            </a>
                            <a className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-stone-300 px-2 text-xs font-bold text-slate-700 hover:bg-stone-50" href={`sms:${machine.owner.phone_number}`}>
                              <MessageSquareText size={14} />
                              {t("Text")}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machine.location || "-"}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{currency(machine.hourly_rate)}/hr<br />{currency(machine.daily_rate)}/day</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={machine.availability_status} />
                        <select className={`${inputClass} max-w-44`} value={machine.availability_status} onChange={(e) => updateAvailability(machine, e.target.value)}>
                          <option value="available">{t("Available")}</option>
                          <option value="busy">{t("Busy")}</option>
                          <option value="maintenance">{t("Maintenance")}</option>
                          <option value="unavailable">{t("Unavailable")}</option>
                        </select>
                      </div>
                    </td>
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
