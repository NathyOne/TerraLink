export const REQUEST_CATEGORY_EQUIPMENT = "equipment";
export const REQUEST_CATEGORY_MATERIAL = "material";

export const requestCategoryOptions = [
  { value: REQUEST_CATEGORY_EQUIPMENT, label: "Construction equipment" },
  { value: REQUEST_CATEGORY_MATERIAL, label: "Construction material" },
];

export const materialTypes = [
  "Cement",
  "National Cement",
  "Mugar Cement",
  "Dangote Cement",
  "Habesha Cement",
  "Derba Cement",
  "Cement Blocks",
  "Gypsum",
  "Gypsum Board",
  "Gypsum Powder",
  "Sand",
  "Gravel",
  "Crushed Rock",
  "Aggregate",
  "Ready-mix Concrete",
  "Rebar",
  "Steel",
  "Steel Bars",
  "Steel Beams",
  "Wire Mesh",
  "Binding Wire",
  "Bricks",
  "Blocks",
  "Hollow Concrete Blocks",
  "Timber",
  "Plywood",
  "Nails and Fasteners",
  "Roofing Sheet",
  "Waterproofing Materials",
  "Paint",
  "Pipes",
  "Tiles",
  "Ceramic Tiles",
  "Asphalt",
  "Water",
  "Electrical Materials",
  "Plumbing Materials",
  "Glass",
  "Formwork",
  "Other",
];

export function requestCategoryLabel(value) {
  return requestCategoryOptions.find((option) => option.value === value)?.label || "Construction equipment";
}

export function requestItem(request) {
  return request?.requested_item_type || request?.required_machine_type || "-";
}

export function requestDisplayName(request, t = (value) => value) {
  const item = requestItem(request);
  const fallback = item === "-" ? t(requestCategoryLabel(request?.request_category)) : `${t(requestCategoryLabel(request?.request_category))}: ${t(item)}`;
  if (!request?.title) return fallback;

  const generatedPrefixes = [
    "Construction equipment:",
    "Construction material:",
    "Equipment request:",
    "Material request:",
  ];
  return generatedPrefixes.some((prefix) => request.title.startsWith(prefix)) ? fallback : request.title;
}

export function isMaterialRequest(request) {
  return request?.request_category === REQUEST_CATEGORY_MATERIAL;
}

export function isEquipmentRequest(request) {
  return !isMaterialRequest(request);
}
