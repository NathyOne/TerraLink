import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { useI18n } from "../../i18n/I18nContext";
import { currency } from "../../utils/format";

const initialForm = {
  name: "",
  description: "",
  unit_type: "m3",
  price_per_unit: "",
  supplier_name: "",
  location: "",
  quantity_available: "",
};

const materialPresets = [
  { name: "National Cement", unit_type: "bag", description: "Ethiopian cement supply, typically sold in 50 kg bags." },
  { name: "Mugar Cement", unit_type: "bag", description: "Ethiopian cement supply, typically sold in 50 kg bags." },
  { name: "Dangote Cement", unit_type: "bag", description: "Ethiopian cement supply, typically sold in 50 kg bags." },
  { name: "Habesha Cement", unit_type: "bag", description: "Ethiopian cement supply, typically sold in 50 kg bags." },
  { name: "Gypsum Board", unit_type: "sheet", description: "Interior partition and ceiling gypsum board." },
  { name: "Gypsum Powder", unit_type: "bag", description: "Gypsum powder for finishing and plaster work." },
  { name: "Rebar", unit_type: "ton", description: "Reinforcement steel bars for concrete work." },
  { name: "Steel Bars", unit_type: "ton", description: "Structural and fabrication steel supply." },
  { name: "Hollow Concrete Blocks", unit_type: "piece", description: "HCB walling blocks for building construction." },
  { name: "Sand", unit_type: "truckload", description: "Washed or local construction sand." },
  { name: "Aggregate", unit_type: "m3", description: "Coarse aggregate for concrete and road works." },
  { name: "Roofing Sheet", unit_type: "sheet", description: "Corrugated or profile roofing sheet supply." },
];

export default function Materials() {
  const { t } = useI18n();
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await api.get("/materials/?ordering=name");
      setMaterials(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const createMaterial = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/materials/", form);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteMaterial = async (material) => {
    if (!window.confirm(`${t("Delete")} ${material.name}?`)) return;
    try {
      await api.delete(`/materials/${material.id}/`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const applyPreset = (preset) => {
    setForm({
      ...form,
      name: preset.name,
      unit_type: preset.unit_type,
      description: preset.description,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Construction Materials")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Admin-only material catalog.")}</p>
      </div>
      <form onSubmit={createMaterial} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t("Quick material presets")}</span>
            <div className="flex flex-wrap gap-2">
              {materialPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-amber-400 hover:bg-amber-50"
                >
                  {t(preset.name)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Supplier">
              <input className={inputClass} value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} required />
            </Field>
            <Field label="Location">
              <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </Field>
            <Field label="Unit">
              <select className={inputClass} value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })}>
                <option value="m3">m3</option>
                <option value="kg">kg</option>
                <option value="bag">{t("Bag")}</option>
                <option value="quintal">{t("Quintal")}</option>
                <option value="ton">{t("Ton")}</option>
                <option value="truckload">{t("Truckload")}</option>
                <option value="piece">{t("Piece")}</option>
                <option value="meter">{t("Meter")}</option>
                <option value="sheet">{t("Sheet")}</option>
                <option value="roll">{t("Roll")}</option>
                <option value="liter">{t("Liter")}</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto]">
            <Field label="Description">
              <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Price">
              <input className={inputClass} type="number" min="0" step="0.01" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} required />
            </Field>
            <Field label="Quantity">
              <input className={inputClass} type="number" min="0" step="0.01" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} required />
            </Field>
            <div className="flex items-end">
              <button disabled={saving} className={buttonClass} type="submit">
                <Plus size={17} />
                {t("Add")}
              </button>
            </div>
          </div>
        </div>
      </form>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading materials" />
      ) : materials.length === 0 ? (
        <EmptyBlock label="No materials recorded." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Material")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Supplier")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Location")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Price")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Quantity")}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-stone-500">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{material.name}</p>
                      <p className="text-sm font-medium text-stone-500">{material.description}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{material.supplier_name}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{material.location}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{currency(material.price_per_unit)} / {material.unit_type}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{material.quantity_available}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" onClick={() => deleteMaterial(material)} aria-label="Delete material">
                        <Trash2 size={17} />
                      </button>
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
