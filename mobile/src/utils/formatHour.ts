export const formatHour = (dateString: string) => {
  const date = new Date(dateString);
  
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }); 
};