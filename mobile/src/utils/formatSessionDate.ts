export const formatSessionDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return dateString;

    const dayMonth = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${dayMonth} - ${time}`;
  } catch {
    return dateString; 
  }
};