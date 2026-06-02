export const formatDate = (date: string | Date) => {
  if (!date) return '';

  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('pt-BR');
};



export const datePickerFormatDate = (date: string | Date) => {
  if (!date) return '';

  if (typeof date === 'string') {
    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  }

  return date.toLocaleDateString('pt-BR');
};