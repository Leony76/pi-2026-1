export const getDisplayNameOrInitials = (name: string) => {
  const nameArray = name.trim().split(' ') || [];

  const displayName = nameArray.length > 1 
    ? `${nameArray[0]} ${nameArray[1]}` 
    : nameArray[0]
  ;

 const initials = nameArray.length > 1 
    ? `${nameArray[0]?.[0]}${nameArray[1]?.[0]}` 
    :    nameArray[0]?.[0]
  ;

  return {
    initials    : initials ?? '',
    displayName : displayName ?? '',
  }
}