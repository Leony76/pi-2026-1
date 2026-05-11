export const addHoursToStringDate = (
  dateString: string,
  hoursToAdd: number
): Date => {
  const date = new Date(dateString);

  date.setHours(date.getHours() + hoursToAdd);

  return date;
};
