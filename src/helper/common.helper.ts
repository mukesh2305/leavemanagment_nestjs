import { HolidaysService } from '../holidays/holidays.service';
export async function getDay(date: string) {
  const weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const d = new Date(date);
  const day = weekday[d.getDay()];
  return day;
}

export async function isWeekend(date: any) {
  const day = date.getDay();
  //check holiday for date

  return day === 0 || day === 6;
}
