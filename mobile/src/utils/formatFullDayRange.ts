export const formatFullDayRange = (
  date: Date | string,
  includesYear?: boolean,
) => {
  const parsedDate =
    typeof date === "string"
      ? new Date(date)
      : date;

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = String(parsedDate.getFullYear());

  if (includesYear) return `${day}/${month}/${year} - 00:00 às 23:59`;

  return `${day}/${month} - 00:00 às 23:59`;
};