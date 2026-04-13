export const formatCrmCrp = (value: string) => {
  const cleaned = value.replace(/[^0-9a-zA-Z]/g, "");

  const numbers = cleaned.slice(0, 5).replace(/[^0-9]/g, "");
  const letters = cleaned.slice(5, 7).replace(/[^a-zA-Z]/g, "").toUpperCase();

  if (numbers.length > 0 && letters.length > 0) {
    return `${numbers}-${letters}`;
  } else if (numbers.length === 5 && value.length >= 6) {
    return `${numbers}-`;
  }
  
  return numbers;
};