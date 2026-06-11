import { Package, Save, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getErrorMessage } from "../../api/client";
import { ErrorBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { useI18n } from "../../i18n/I18nContext";
import { machineTypes } from "../../utils/machineTypes";
import { REQUEST_CATEGORY_EQUIPMENT, materialTypes, requestCategoryOptions } from "../../utils/requestOptions";

const initialForm = {
  request_category: REQUEST_CATEGORY_EQUIPMENT,
  requested_item_type: "",
  quantity: "1",
  expected_start_date: "",
  location: "",
  description: "",
};

const popularMaterialTypes = [
  "National Cement",
  "Mugar Cement",
  "Dangote Cement",
  "Habesha Cement",
  "Gypsum Board",
  "Gypsum Powder",
  "Rebar",
  "Steel Bars",
  "Hollow Concrete Blocks",
  "Sand",
  "Aggregate",
  "Roofing Sheet",
];

export default function SubmitRequest() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const categoryLabel = requestCategoryOptions.find((option) => option.value === form.request_category)?.label || "Construction equipment";
      const payload = {
        ...form,
        title: `${categoryLabel}: ${form.requested_item_type}`,
        required_machine_type: form.request_category === REQUEST_CATEGORY_EQUIPMENT ? form.requested_item_type : "",
        expected_end_date: form.expected_start_date,
        budget: "0",
        quantity: Number(form.quantity),
      };
      const response = await api.post("/machine-requests/", payload);
      navigate(`/construction/requests/${response.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const options = form.request_category === REQUEST_CATEGORY_EQUIPMENT ? machineTypes : materialTypes;
  const itemLabel = form.request_category === REQUEST_CATEGORY_EQUIPMENT ? "Equipment type" : "Material type";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Submit Construction Request")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Your request goes directly to TerraLink admins.")}</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <ErrorBlock message={error} />

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t("What do you need?")}</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {requestCategoryOptions.map((option) => {
                const active = form.request_category === option.value;
                const Icon = option.value === REQUEST_CATEGORY_EQUIPMENT ? Truck : Package;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, request_category: option.value, requested_item_type: "" })}
                    className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 text-left text-sm font-bold transition ${
                      active ? "border-amber-500 bg-amber-50 text-slate-950 ring-4 ring-amber-100" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <Icon size={19} className={active ? "text-amber-700" : "text-stone-500"} />
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {form.request_category !== REQUEST_CATEGORY_EQUIPMENT && (
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t("Popular material supplies")}</span>
              <div className="flex flex-wrap gap-2">
                {popularMaterialTypes.map((material) => {
                  const active = form.requested_item_type === material;
                  return (
                    <button
                      key={material}
                      type="button"
                      onClick={() => setForm({ ...form, requested_item_type: material })}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        active ? "border-amber-500 bg-amber-50 text-slate-950" : "border-stone-300 bg-stone-50 text-slate-800 hover:border-amber-400 hover:bg-amber-50"
                      }`}
                    >
                      {t(material)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={itemLabel}>
              <select className={inputClass} value={form.requested_item_type} onChange={(e) => setForm({ ...form, requested_item_type: e.target.value })} required>
                <option value="">{t(form.request_category === REQUEST_CATEGORY_EQUIPMENT ? "Select equipment type" : "Select material type")}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {t(option)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input className={inputClass} type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </Field>
            <Field label="Needed date">
              <input className={inputClass} type="date" value={form.expected_start_date} onChange={(e) => setForm({ ...form, expected_start_date: e.target.value })} required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site location">
              <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field label="Optional notes">
              <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Save size={17} />
              {t("Submit request")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
