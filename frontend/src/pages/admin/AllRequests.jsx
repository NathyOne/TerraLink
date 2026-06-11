import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { requestCategoryLabel, requestCategoryOptions, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function AllRequests() {
  const { t } = useI18n();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", request_category: "", requested_item_type__icontains: "", location__icontains: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await api.get(`/machine-requests/?${params.toString()}`);
      setRequests(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.status, filters.request_category, filters.requested_item_type__icontains, filters.location__icontains]);

  const updateStatus = async (request, status) => {
    try {
      await api.patch(`/machine-requests/${request.id}/`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("All Machine Requests")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Admin-only request queue.")}</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_180px_180px_180px_180px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input className={`${inputClass} pl-10`} placeholder={t("Search requests")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
        <select className={inputClass} value={filters.request_category} onChange={(e) => setFilters({ ...filters, request_category: e.target.value })}>
          <option value="">{t("All request types")}</option>
          {requestCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{t(option.label)}</option>
          ))}
        </select>
        <input className={inputClass} placeholder={t("Item type")} value={filters.requested_item_type__icontains} onChange={(e) => setFilters({ ...filters, requested_item_type__icontains: e.target.value })} />
        <input className={inputClass} placeholder={t("Location")} value={filters.location__icontains} onChange={(e) => setFilters({ ...filters, location__icontains: e.target.value })} />
        <select className={inputClass} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">{t("All statuses")}</option>
          <option value="pending">{t("Pending")}</option>
          <option value="reviewing">{t("Reviewing")}</option>
          <option value="contacted">{t("Contacted")}</option>
          <option value="assigned">{t("Assigned")}</option>
          <option value="completed">{t("Completed")}</option>
          <option value="cancelled">{t("Cancelled")}</option>
        </select>
      </div>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading requests" />
      ) : requests.length === 0 ? (
        <EmptyBlock label="No requests match the filters." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Request")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Client")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Request type")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Need")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Needed date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-4">
                      <Link to={`/admin/requests/${request.id}`} className="font-bold text-slate-950 hover:text-amber-700">
                        {requestDisplayName(request, t)}
                      </Link>
                      <p className="text-sm font-medium text-stone-500">{request.location} - {shortDate(request.expected_start_date)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{request.requested_by?.username}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{t(requestCategoryLabel(request.request_category))}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{request.quantity || 1} x {t(requestItem(request))}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{shortDate(request.expected_start_date)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={request.status} />
                        <select className={`${inputClass} max-w-44`} value={request.status} onChange={(e) => updateStatus(request, e.target.value)}>
                          <option value="pending">{t("Pending")}</option>
                          <option value="reviewing">{t("Reviewing")}</option>
                          <option value="contacted">{t("Contacted")}</option>
                          <option value="assigned">{t("Assigned")}</option>
                          <option value="completed">{t("Completed")}</option>
                          <option value="cancelled">{t("Cancelled")}</option>
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
