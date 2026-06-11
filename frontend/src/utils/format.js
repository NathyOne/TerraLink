export const roleLabel = {
  admin: "Admin",
  construction_owner: "Construction Owner",
  machine_owner: "Machine Owner",
};

export const requestStatusLabel = {
  pending: "Pending",
  reviewing: "Reviewing",
  contacted: "Contacted",
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const assignmentStatusLabel = {
  proposed: "Proposed",
  accepted: "Accepted",
  rejected: "Rejected",
  active: "Active",
  completed: "Completed",
};

export const availabilityLabel = {
  available: "Available",
  busy: "Busy",
  maintenance: "Maintenance",
  unavailable: "Unavailable",
};

export function currency(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function shortDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
