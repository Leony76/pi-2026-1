export const formatPhone = (value: string) => {

  let digits = value.replace(/\D/g, "");

  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) {
    return `(${areaCode}) ${number}`;
  }

  const isCelular = digits.length === 11;
  const position = isCelular ? 5 : 4;

  return `(${areaCode}) ${number.slice(0, position)}-${number.slice(position)}`;
};