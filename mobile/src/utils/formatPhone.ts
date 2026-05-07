export const formatPhone = (value: string) => {
  // Remove tudo que não é número e limita a 11 dígitos (2 DDD + 9 números)
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 5) {
    return `(${areaCode}) ${number}`;
  }

  // Formata com hífen: (XX) XXXXX-XXXX
  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
};