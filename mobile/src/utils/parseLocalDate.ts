export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  
  ///@ts-ignore
  return new Date(year, month - 1, day);
};