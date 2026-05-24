export const feeByClass = {
  6: 600,
  7: 700,
  8: 800,
  9: 900,
  10: 1000,
  11: 2300,
  12: 2500
};

export const classes = Object.keys(feeByClass);

export const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
