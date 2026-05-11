export const HOURS = {
  MORNING: [
    { startHour: '08:00', endHour: '09:00' },
    { startHour: '09:00', endHour: '10:00' },
    { startHour: '10:00', endHour: '11:00' },
    { startHour: '11:00', endHour: '12:00' },
  ],
  AFTERNOON: [
    { startHour: '12:00', endHour: '13:00' },
    { startHour: '13:00', endHour: '14:00' },
    { startHour: '14:00', endHour: '15:00' },
    { startHour: '15:00', endHour: '16:00' },
    { startHour: '16:00', endHour: '17:00' },
    { startHour: '17:00', endHour: '18:00' },
  ],
  NIGHT: [
    { startHour: '18:00', endHour: '19:00' },
    { startHour: '19:00', endHour: '20:00' },
    { startHour: '20:00', endHour: '21:00' },
    { startHour: '21:00', endHour: '22:00' },
    { startHour: '22:00', endHour: '23:00' },
    { startHour: '23:00', endHour: '00:00' },
  ],
} as const;

export const HOURS_MAP = {
  MORNING    : HOURS.MORNING, 
  AFTERNOON  : HOURS.AFTERNOON,  
  NIGHT      : HOURS.NIGHT,
  UNSELECTED : [],  
} as const;