export const getFirstName = (name:string) => {
  const nameArray = name.trim().split(' ') || [];

  return nameArray[0];
}