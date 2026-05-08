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

  if (number.length <= 4) {
    return `(${areaCode}) ${number}`;
  }

  if (number.length <= 8) {
    return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
};