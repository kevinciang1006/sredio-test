import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { SredMode, SredProjectBar, EmployeeBreakdownBar } from '../models/chart-data.model';
import { hourlyRate } from './hourly-rate';
import { sredCredits } from './sred-totals';


function entryValue(
  entries: readonly TimeEntry[],
  rate: number,
  isSredEligible: boolean,
  mode: SredMode,
  creditRate: number,
): number {
  if (mode === 'hours') {
    return entries.reduce((sum, e) => sum + e.hours, 0);
  }
  const cost = entries.reduce((sum, e) => sum + e.hours * rate, 0);
  if (mode === 'credits') return isSredEligible ? sredCredits(cost, creditRate) : 0;
  return cost;
}

export function projectBarData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
  mode: SredMode,
  creditRate: number,
): SredProjectBar[] {
  const rateById = new Map(employees.map(emp => [emp.id, hourlyRate(emp)]));

  return projects.map(project => {
    const projEntries = periodEntries.filter(e => e.projectId === project.id);

    let value: number;
    if (mode === 'hours') {
      value = projEntries.reduce((sum, e) => sum + e.hours, 0);
    } else {
      const cost = projEntries.reduce((sum, e) => {
        return sum + e.hours * (rateById.get(e.employeeId) ?? 0);
      }, 0);
      value = mode === 'credits' ? (project.isSredEligible ? sredCredits(cost, creditRate) : 0) : cost;
    }

    return {
      projectId: project.id,
      projectName: project.name,
      value,
      isSredEligible: project.isSredEligible,
      color: project.color,
    };
  });
}

export function employeeBreakdownData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projectId: string,
  mode: SredMode,
  creditRate: number,
  isSredEligible: boolean,
): EmployeeBreakdownBar[] {
  return employees
    .map(emp => {
      const empEntries = periodEntries.filter(
        e => e.projectId === projectId && e.employeeId === emp.id,
      );
      const rate = hourlyRate(emp);
      const value = entryValue(empEntries, rate, isSredEligible, mode, creditRate);
      return { employeeId: emp.id, name: emp.name, value, color: emp.color };
    })
    .filter(b => b.value > 0);
}

export function employeeProjectBars(
  periodEntries: readonly TimeEntry[],
  employee: Employee,
  projects: readonly Project[],
  mode: SredMode,
  creditRate: number,
): SredProjectBar[] {
  const rate = hourlyRate(employee);

  return projects
    .map(project => {
      const entries = periodEntries.filter(
        e => e.projectId === project.id && e.employeeId === employee.id,
      );
      const value = entryValue(entries, rate, project.isSredEligible, mode, creditRate);
      return {
        projectId: project.id,
        projectName: project.name,
        value,
        isSredEligible: project.isSredEligible,
        color: project.color,
      };
    })
    .filter(b => b.value > 0);
}
