export const formatSessionDate = (dateValue: Date | string): string => {
  try {
    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(dateValue)
    ;

    if (isNaN(date.getTime())) {
      return String(dateValue);
    }

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
    return String(dateValue);
  }
};