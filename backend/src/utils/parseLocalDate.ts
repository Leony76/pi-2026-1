export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month) return new Date(dateStr);

  return new Date(year, month - 1, day);
}