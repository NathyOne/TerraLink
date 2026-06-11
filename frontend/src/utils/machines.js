export function machineTitle(machine) {
  if (!machine) return "-";
  return machine.name || machine.plate_number || machine.machine_type || "Machine";
}

export function ownerPhone(machine) {
  return machine?.owner?.phone_number || "";
}
