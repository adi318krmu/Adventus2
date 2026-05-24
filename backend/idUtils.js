export const makeTuitionId = (role) => {
  const prefix = role === "admin" ? "ADV-ADM" : "ADV-STU";
  const stamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${stamp}${random}`;
};
