export const formatDayMonthYear = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
  const year = date.getUTCFullYear();
  
  return `${day} ${month} ${year}`;
};