import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { roleLabel, shortDate } from "../../utils/format";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "admin",
  phone_number: "",
  is_active: true,
};

export default function UsersManagement() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const createUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/users/", form);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Users Management")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Platform accounts and access state.")}</p>
      </div>
      <form onSubmit={createUser} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-950">{t("Create user")}</h3>
            <span className="text-sm font-medium text-stone-500">{t("Admins can create admin accounts here.")}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Username">
              <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </Field>
            <Field label="Email">
              <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <input className={inputClass} type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Field>
            <Field label="Role">
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(roleLabel).map(([value, label]) => (
                  <option key={value} value={value}>{t(label)}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input className={inputClass} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Plus size={17} />
              {t("Create user")}
            </button>
          </div>
        </div>
      </form>
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
