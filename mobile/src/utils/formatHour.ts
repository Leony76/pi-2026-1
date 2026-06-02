export const formatHour = (dateString: string, utc?: boolean) => {
  return new Date(dateString).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    ...(utc && { timeZone: 'UTC' }), 
  });
};