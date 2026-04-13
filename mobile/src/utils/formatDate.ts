export const formatDate = (date: string | Date) => {
  if (!date) return '';

  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('pt-BR');
};