import { Pipe, PipeTransform } from '@angular/core';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

@Pipe({ name: 'shortDate' })
export class ShortDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return value;
    if (month < 0 || month > 11) return '';
    return `${day} ${MONTHS[month]} ${year}`;
  }
}
