export const formatDayMonth = (date: Date | string) => {
  const parsedDate = typeof date === "string"
    ? new Date(date)
    : date;

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}`;
};