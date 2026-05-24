export const classFees = {
  "6": 1000,
  "7": 1200,
  "8": 1500,
  "9": 1800,
  "10": 2000,
  "11": 2300,
  "12": 2500
};

export const getFeeForClass = (studentClass) => classFees[String(studentClass)] || 1000;

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
