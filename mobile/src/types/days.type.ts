export type Days =
| 'MONDAY'
| 'TUESDAY'
| 'WEDNESDAY'
| 'THURSDAY'
| 'FRIDAY'
| 'SATURDAY'
| 'SUNDAY'
;

export type _3xWeek = {
  day1 : Days;
  day2 : Days;
  day3 : Days;
};