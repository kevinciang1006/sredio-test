import { describe, it, expect } from 'vitest';
import { hourlyRate, HOURS_PER_YEAR } from './hourly-rate';
import { Employee } from '../../../core/models/employee.model';

const make = (annualSalary: number): Employee => ({
  id: 'e1', name: 'X', email: 'x@x', hireDate: '2024-01-01', annualSalary, role: 'r',
});

describe('hourlyRate', () => {
  it('computes salary / 2000', () => {
    expect(hourlyRate(make(60000))).toBe(30);
  });

  it('returns zero for zero salary', () => {
    expect(hourlyRate(make(0))).toBe(0);
  });

  it('exposes HOURS_PER_YEAR = 2000', () => {
    expect(HOURS_PER_YEAR).toBe(2000);
  });
});
