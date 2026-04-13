export const getFirstTwoNames = (name:string) => {
  const nameArray = name.trim().split(' ') || [];

  const displayName = nameArray.length > 1 
    ? `${nameArray[0]} ${nameArray[1]}` 
    : nameArray[0]
  ;

  return displayName;
}