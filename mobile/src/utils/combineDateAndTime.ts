export const combineDateAndTime = (
  date: string,
  time: string
): Date => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );
};