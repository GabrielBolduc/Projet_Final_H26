// src/app/core/utils/date.utils.ts

export class DateUtils {
  
  // form
  
  static formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toTimeString().substring(0, 5);
  }

  static combineDateTime(date: Date | string, time: string): string {
    const d = new Date(date);
    const [hours, minutes] = time.split(':');
    d.setHours(+hours);   
    d.setMinutes(+minutes);
    d.setSeconds(0);
    return d.toISOString();
  }

  // dashboard
  
  static compareDates(dateA: Date | string, dateB: Date | string): number {
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  }

  static toDateStringKey(date: Date | string): string {
    return new Date(date).toDateString();
  }

  static toDate(date: Date | string): Date {
    return new Date(date);
  }
}