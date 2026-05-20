import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { SredMode, SredProjectBar, EmployeeBreakdownBar } from '../models/chart-data.model';
import { hourlyRate } from './hourly-rate';
import { sredCredits } from './sred-totals';

const SRED_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const UNCLAIMED_COLOR = '#9ca3af';

function buildColorMap(projects: readonly Project[]): Map<string, string> {
  const colors = new Map<string, string>();
  let idx = 0;
  for (const p of projects) {
    colors.set(p.id, p.isSredEligible ? SRED_COLORS[idx++ % SRED_COLORS.length] : UNCLAIMED_COLOR);
  }
  return colors;
}

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
  return mode === 'credits' && isSredEligible ? sredCredits(cost, creditRate) : cost;
}

export function projectBarData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
  mode: SredMode,
  creditRate: number,
): SredProjectBar[] {
  const colorMap = buildColorMap(projects);
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
      value = mode === 'credits' && project.isSredEligible ? sredCredits(cost, creditRate) : cost;
    }

    return {
      projectId: project.id,
      projectName: project.name,
      value,
      isSredEligible: project.isSredEligible,
      color: colorMap.get(project.id) ?? UNCLAIMED_COLOR,
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
  const colorMap = buildColorMap(projects);
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
        color: colorMap.get(project.id) ?? UNCLAIMED_COLOR,
      };
    })
    .filter(b => b.value > 0);
}
