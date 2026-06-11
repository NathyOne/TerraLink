import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { roleLabel, shortDate } from "../../utils/format";

export default function UsersManagement() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.role) params.set("role", filters.role);
      const response = await api.get(`/users/?${params.toString()}`);
      setUsers(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.role]);

  const patchUser = async (user, data) => {
    try {
      await api.patch(`/users/${user.id}/`, data);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Users Management")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Platform accounts and access state.")}</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-soft md:grid-cols-[1fr_240px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input className={`${inputClass} pl-10`} placeholder={t("Search users")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
        <select className={inputClass} value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">{t("All roles")}</option>
          <option value="admin">{t("Admin")}</option>
          <option value="construction_owner">{t("Construction Owner")}</option>
          <option value="machine_owner">{t("Machine Owner")}</option>
        </select>
      </div>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading users" />
      ) : users.length === 0 ? (
        <EmptyBlock label="No users found." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("User")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Role")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Phone")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Active")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Created")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{user.username}</p>
                      <p className="text-sm font-medium text-stone-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={user.role} />
                        <select className={`${inputClass} max-w-56`} value={user.role} onChange={(e) => patchUser(user, { role: e.target.value })}>
                          {Object.entries(roleLabel).map(([value, label]) => (
                            <option key={value} value={value}>{t(label)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{user.phone_number}</td>
                    <td className="px-4 py-4">
                      <input className="h-5 w-5 rounded border-stone-300 text-slate-950 focus:ring-amber-500" type="checkbox" checked={user.is_active} onChange={(e) => patchUser(user, { is_active: e.target.checked })} />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{shortDate(user.created_at)}</td>
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
