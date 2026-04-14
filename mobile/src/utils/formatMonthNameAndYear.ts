export const formatMonthNameAndYear = (dateString: string | null): string => {
  if (!dateString) return 'Indeterminado';

  const limitDate = new Date(dateString);
  const today = new Date();
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = 
    limitDate.getUTCDate() === today.getDate() &&
    limitDate.getUTCMonth() === today.getMonth() &&
    limitDate.getUTCFullYear() === today.getFullYear();

  const isTomorrow = 
    limitDate.getUTCDate() === tomorrow.getDate() &&
    limitDate.getUTCMonth() === tomorrow.getMonth() &&
    limitDate.getUTCFullYear() === tomorrow.getFullYear();

  if (isToday) return 'hoje';
  if (isTomorrow) return 'amanhã';

  const formatted = limitDate.toLocaleDateString('pt-BR', {
    month: 'short', 
    year: 'numeric',
    timeZone: 'UTC'
  });

  return formatted.replace('.', '').replace(' de ', ' / ');
};