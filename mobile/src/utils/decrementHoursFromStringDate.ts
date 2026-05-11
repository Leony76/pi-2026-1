export const decrementHoursFromStringDate = (
  dateString: string,
  hoursToDecrement: number
): Date => {
  const date = new Date(dateString);

  date.setHours(date.getHours() - hoursToDecrement);

  return date;
};
