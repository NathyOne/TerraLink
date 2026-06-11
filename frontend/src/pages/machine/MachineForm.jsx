import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, getErrorMessage } from "../../api/client";
import { ErrorBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass } from "../../components/FormControls";
import { useI18n } from "../../i18n/I18nContext";
import { machineTypes } from "../../utils/machineTypes";

const initialForm = {
  plate_number: "",
  machine_type: "",
};

export default function MachineForm() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/machines/", form);
      navigate("/machine/machines");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Add Machine")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Submit the machine details admins need for matching.")}</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4">
          <ErrorBlock message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plate number">
              <input className={inputClass} value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} required />
            </Field>
            <Field label="Machine type">
              <select className={inputClass} value={form.machine_type} onChange={(e) => setForm({ ...form, machine_type: e.target.value })} required>
                <option value="">{t("Select machine type")}</option>
                {machineTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(type)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex justify-end">
            <button disabled={saving} className={buttonClass} type="submit">
              <Save size={17} />
              {t("Submit machine")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
