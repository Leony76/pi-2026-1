export const getLastDayOfMonth = (date: Date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  );
};