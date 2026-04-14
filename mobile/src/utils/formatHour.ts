export const formatHour = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC' 
  });
};