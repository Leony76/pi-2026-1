export const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 2 && digits[2] !== '9') {
    digits = digits.slice(0, 10);
  } else {
    digits = digits.slice(0, 11);
  }

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 5) {
    return `(${areaCode}) ${number}`;
  }

  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
};