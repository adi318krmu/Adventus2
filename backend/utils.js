export const classFees = {
  "4": 500,
  "5": 500,
  "6": 600,
  "7": 700,
  "8": 800,
  "9": 900,
  "10": 1000
};

export const validClasses = Object.keys(classFees);

export const isValidClass = (studentClass) => validClasses.includes(String(studentClass));

export const getFeeForClass = (studentClass) => classFees[String(studentClass)] || classFees["4"];

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
