# SR&ED Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/dashboard` page to match the sred.io reference app: quarterly timeline tabs, SR&ED-mode switching (Hours / Expenditures / Credits), dual KPI, proportional project bar with drill-down, staff section with team charts, employee modal, and staff salary table.

**Architecture:** The dashboard page is fully rewritten with a new signal-driven layout; existing chart components (SummaryCard, HoursCostToggle, AggregateChart, ProjectBreakdownChart, EmployeeGrid) remain on disk but are no longer imported by the dashboard. New pure calculations handle quarterly slicing and SR&ED totals; new Angular 21 OnPush components handle each visual section.

**Tech Stack:** Angular 21, Tailwind CSS v4, ng-apexcharts (ApexCharts), Vitest for calc specs, signal-based state, zoneless change detection.

---

## File Map

**Modified:**
- `src/app/core/models/client.model.ts` — add `sredCreditRate?: number`
- `src/app/core/models/employee.model.ts` — add `endDate?`, `confirmedSalary?`, `isSpecialEmployee?`, `teamId?`
- `src/app/features/dashboard/models/chart-data.model.ts` — add `SredMode`, `QuarterPeriod`, `SredProjectBar`, `EmployeeBreakdownBar`, `StaffBarEntry`; keep `ChartMode` for profile compat
- `src/app/features/dashboard/calculations/index.ts` — re-export new calculations
- `src/app/features/dashboard/mock/clients.mock.ts` — add `sredCreditRate: 0.45`
- `src/app/features/dashboard/mock/employees.mock.ts` — add new fields + `teamId`
- `src/app/features/dashboard/dashboard.ts` — full rewrite
- `src/app/features/dashboard/dashboard.html` — full rewrite

**Created:**
- `src/app/core/models/team.model.ts`
- `src/app/features/dashboard/mock/teams.mock.ts`
- `src/app/features/dashboard/services/teams.service.ts`
- `src/app/features/dashboard/calculations/quarterly.ts` + `.spec.ts`
- `src/app/features/dashboard/calculations/sred-totals.ts` + `.spec.ts`
- `src/app/features/dashboard/calculations/project-bar-data.ts` + `.spec.ts`
- `src/app/features/dashboard/calculations/staff-bar-data.ts` + `.spec.ts`
- `src/app/features/dashboard/components/mode-tabs/mode-tabs.ts` + `.html`
- `src/app/features/dashboard/components/quarterly-timeline/quarterly-timeline.ts` + `.html`
- `src/app/features/dashboard/components/dual-kpi-panel/dual-kpi-panel.ts` + `.html`
- `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.ts` + `.html`
- `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.ts` + `.html`
- `src/app/features/dashboard/components/staff-section/staff-section.ts` + `.html`
- `src/app/features/dashboard/components/team-staff-chart/team-staff-chart.ts` + `.html`
- `src/app/features/dashboard/components/employee-modal/employee-modal.ts` + `.html`
- `src/app/features/dashboard/components/staff-salary-table/staff-salary-table.ts` + `.html`

---

## Task 1: Data Models + Mock Data Foundation

**Files:**
- Modify: `src/app/core/models/client.model.ts`
- Modify: `src/app/core/models/employee.model.ts`
- Create: `src/app/core/models/team.model.ts`
- Modify: `src/app/features/dashboard/models/chart-data.model.ts`
- Modify: `src/app/features/dashboard/mock/clients.mock.ts`
- Modify: `src/app/features/dashboard/mock/employees.mock.ts`
- Create: `src/app/features/dashboard/mock/teams.mock.ts`

- [ ] **Step 1: Update Client model**

Replace entire `src/app/core/models/client.model.ts`:

```typescript
export interface Client {
  readonly id: string;
  readonly name: string;
  readonly claimPeriod: {
    readonly startDate: string;
    readonly endDate: string;
  };
  readonly province: string;
  readonly timeZone: string;
  readonly sredCreditRate?: number;
}
```

- [ ] **Step 2: Update Employee model**

Replace entire `src/app/core/models/employee.model.ts`:

```typescript
export interface Employee {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hireDate: string;
  readonly annualSalary: number;
  readonly role: string;
  readonly endDate?: string;
  readonly confirmedSalary?: number;
  readonly isSpecialEmployee?: boolean;
  readonly teamId?: string;
}
```

- [ ] **Step 3: Create Team model**

Create `src/app/core/models/team.model.ts`:

```typescript
export interface Team {
  readonly id: string;
  readonly name: string;
}
```

- [ ] **Step 4: Update chart-data model**

Replace entire `src/app/features/dashboard/models/chart-data.model.ts`:

```typescript
export type ChartMode = 'hours' | 'cost';
export type SredMode = 'hours' | 'expenditures' | 'credits';
export type QuarterPeriod = 'q1' | 'q2' | 'q3' | 'q4' | 'ytd';

export interface ProjectBreakdownSeries {
  readonly name: string;
  readonly data: readonly number[];
}

export interface ProjectBreakdownData {
  readonly categories: readonly string[];
  readonly series: readonly ProjectBreakdownSeries[];
}

export interface AggregateDatum {
  readonly project: string;
  readonly value: number;
}

export interface AggregateData {
  readonly data: readonly AggregateDatum[];
  readonly grandTotal: number;
}

export interface EmployeeRow {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly hireDate: string;
  readonly endDate?: string;
  readonly annualSalary: number;
  readonly confirmedSalary?: number;
  readonly hourlyRate: number;
  readonly ytdHours: number;
  readonly ytdCost: number;
  readonly isSpecialEmployee?: boolean;
}

export interface SredProjectBar {
  readonly projectId: string;
  readonly projectName: string;
  readonly value: number;
  readonly isSredEligible: boolean;
  readonly color: string;
}

export interface EmployeeBreakdownBar {
  readonly employeeId: string;
  readonly name: string;
  readonly value: number;
}

export interface StaffBarEntry {
  readonly employeeId: string;
  readonly name: string;
  readonly sredHours: number;
  readonly unclaimedHours: number;
}
```

- [ ] **Step 5: Update mock client**

Replace entire `src/app/features/dashboard/mock/clients.mock.ts`:

```typescript
import { Client } from '../../../core/models/client.model';

export const MOCK_CLIENT: Client = {
  id: 'client-001',
  name: 'Northwind Labs',
  claimPeriod: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  province: 'ON',
  timeZone: 'EST',
  sredCreditRate: 0.45,
};
```

- [ ] **Step 6: Update mock employees with team assignments and new fields**

Replace entire `src/app/features/dashboard/mock/employees.mock.ts`:

```typescript
import { Employee } from '../../../core/models/employee.model';

export const MOCK_EMPLOYEES: readonly Employee[] = [
  { id: 'emp-001', name: 'Aria Chen',      email: 'aria@northwindlabs.ca',    hireDate: '2022-04-11', annualSalary:  92000, role: 'Senior Engineer', teamId: 'team-001', confirmedSalary:  94000 },
  { id: 'emp-002', name: 'Benjamin Patel', email: 'ben@northwindlabs.ca',     hireDate: '2023-09-05', annualSalary:  72000, role: 'Engineer',        teamId: 'team-002', confirmedSalary:  72000 },
  { id: 'emp-003', name: 'Camille Dubois', email: 'camille@northwindlabs.ca', hireDate: '2021-01-18', annualSalary: 118000, role: 'Staff Engineer',   teamId: 'team-001', confirmedSalary: 120000 },
  { id: 'emp-004', name: 'Devon Singh',    email: 'devon@northwindlabs.ca',   hireDate: '2024-02-12', annualSalary:  56000, role: 'Junior Engineer',  teamId: 'team-002' },
  { id: 'emp-005', name: 'Emiko Tanaka',   email: 'emiko@northwindlabs.ca',   hireDate: '2020-07-30', annualSalary: 105000, role: 'Senior Engineer',  teamId: 'team-001', confirmedSalary: 105000 },
  { id: 'emp-006', name: 'Felix Okafor',   email: 'felix@northwindlabs.ca',   hireDate: '2023-03-22', annualSalary:  68000, role: 'Engineer',        teamId: 'team-002' },
  { id: 'emp-007', name: 'Gianna Romano',  email: 'gianna@northwindlabs.ca',  hireDate: '2022-11-08', annualSalary:  85000, role: 'Senior Engineer',  isSpecialEmployee: true, confirmedSalary: 85000 },
] as const;
```

- [ ] **Step 7: Create mock teams**

Create `src/app/features/dashboard/mock/teams.mock.ts`:

```typescript
import { Team } from '../../../core/models/team.model';

export const MOCK_TEAMS: readonly Team[] = [
  { id: 'team-001', name: 'Platform Team' },
  { id: 'team-002', name: 'Mobile Team' },
] as const;
```

- [ ] **Step 8: Type-check**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 9: Commit**

```bash
git add src/app/core/models/client.model.ts \
        src/app/core/models/employee.model.ts \
        src/app/core/models/team.model.ts \
        src/app/features/dashboard/models/chart-data.model.ts \
        src/app/features/dashboard/mock/clients.mock.ts \
        src/app/features/dashboard/mock/employees.mock.ts \
        src/app/features/dashboard/mock/teams.mock.ts
git commit -m "feat: add SredMode, Team model, employee team/salary fields, SR&ED credit rate to mock data"
```

---

## Task 2: TeamsService

**Files:**
- Create: `src/app/features/dashboard/services/teams.service.ts`

- [ ] **Step 1: Create TeamsService**

Create `src/app/features/dashboard/services/teams.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Team } from '../../../core/models/team.model';
import { MOCK_TEAMS } from '../mock/teams.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Team[]> {
    if (environment.useMocks) {
      return of(MOCK_TEAMS).pipe(delay(250));
    }
    return this.http.get<readonly Team[]>(`${environment.apiBaseUrl}/teams`);
  }
}
```

- [ ] **Step 2: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/services/teams.service.ts
git commit -m "feat: add TeamsService with mock support"
```

---

## Task 3: Quarterly Calculations (TDD)

**Files:**
- Create: `src/app/features/dashboard/calculations/quarterly.ts`
- Create: `src/app/features/dashboard/calculations/quarterly.spec.ts`

- [ ] **Step 1: Write failing spec**

Create `src/app/features/dashboard/calculations/quarterly.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { quarterBoundaries, filterEntriesByPeriod } from './quarterly';
import { TimeEntry } from '../models/time-entry.model';

const e = (date: string): TimeEntry => ({ id: date, employeeId: 'a', projectId: 'p', date, hours: 1 });

describe('quarterBoundaries', () => {
  it('returns correct bounds for q1', () => {
    expect(quarterBoundaries('q1', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-01-01',
      end: '2025-03-31',
    });
  });

  it('returns correct bounds for q2', () => {
    expect(quarterBoundaries('q2', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-04-01',
      end: '2025-06-30',
    });
  });

  it('returns correct bounds for q3', () => {
    expect(quarterBoundaries('q3', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-07-01',
      end: '2025-09-30',
    });
  });

  it('returns correct bounds for q4', () => {
    expect(quarterBoundaries('q4', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-10-01',
      end: '2025-12-31',
    });
  });

  it('returns claim start to asOf for ytd', () => {
    expect(quarterBoundaries('ytd', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-01-01',
      end: '2025-09-30',
    });
  });
});

describe('filterEntriesByPeriod', () => {
  const entries = [
    e('2025-01-15'),
    e('2025-04-01'),
    e('2025-06-30'),
    e('2025-10-01'),
  ];

  it('returns only entries within bounds (inclusive)', () => {
    const result = filterEntriesByPeriod(entries, '2025-04-01', '2025-06-30');
    expect(result).toHaveLength(2);
    expect(result.map(x => x.date)).toEqual(['2025-04-01', '2025-06-30']);
  });

  it('returns empty array when no entries fall in period', () => {
    expect(filterEntriesByPeriod(entries, '2025-11-01', '2025-11-30')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/quarterly.spec.ts
```

Expected: FAIL — "Cannot find module './quarterly'"

- [ ] **Step 3: Implement quarterly.ts**

Create `src/app/features/dashboard/calculations/quarterly.ts`:

```typescript
import { TimeEntry } from '../models/time-entry.model';
import { QuarterPeriod } from '../models/chart-data.model';

export function quarterBoundaries(
  period: QuarterPeriod,
  claimStartIso: string,
  asOfIso: string,
): { start: string; end: string } {
  const year = parseInt(claimStartIso.slice(0, 4), 10);
  switch (period) {
    case 'q1': return { start: `${year}-01-01`, end: `${year}-03-31` };
    case 'q2': return { start: `${year}-04-01`, end: `${year}-06-30` };
    case 'q3': return { start: `${year}-07-01`, end: `${year}-09-30` };
    case 'q4': return { start: `${year}-10-01`, end: `${year}-12-31` };
    case 'ytd': return { start: claimStartIso, end: asOfIso };
  }
}

export function filterEntriesByPeriod(
  entries: readonly TimeEntry[],
  start: string,
  end: string,
): readonly TimeEntry[] {
  return entries.filter(e => e.date >= start && e.date <= end);
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/quarterly.spec.ts
```

Expected: PASS — 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/calculations/quarterly.ts \
        src/app/features/dashboard/calculations/quarterly.spec.ts
git commit -m "feat: add quarterly period boundaries and entry filtering calculations"
```

---

## Task 4: SR&ED Totals Calculations (TDD)

**Files:**
- Create: `src/app/features/dashboard/calculations/sred-totals.ts`
- Create: `src/app/features/dashboard/calculations/sred-totals.spec.ts`

- [ ] **Step 1: Write failing spec**

Create `src/app/features/dashboard/calculations/sred-totals.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { sredTotalHours, sredTotalCost, sredCredits } from './sred-totals';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: id, description: '', isSredEligible: eligible,
});
const e = (projectId: string, hours: number): TimeEntry => ({
  id: projectId, employeeId: 'a', projectId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a', 100000)]; // $50/hr (100000 / 2000)
const PROJECTS = [proj('p-sred', true), proj('p-unclaimed', false)];
const ENTRIES = [
  e('p-sred', 10),
  e('p-unclaimed', 20),
];

describe('sredTotalHours', () => {
  it('counts only SR&ED eligible project hours', () => {
    expect(sredTotalHours(ENTRIES, PROJECTS)).toBe(10);
  });

  it('returns 0 when no eligible entries', () => {
    expect(sredTotalHours([e('p-unclaimed', 5)], PROJECTS)).toBe(0);
  });
});

describe('sredTotalCost', () => {
  it('sums cost for SR&ED eligible hours only', () => {
    // 10 hrs × $50/hr = $500
    expect(sredTotalCost(ENTRIES, EMPLOYEES, PROJECTS)).toBe(500);
  });
});

describe('sredCredits', () => {
  it('returns cost multiplied by credit rate', () => {
    expect(sredCredits(1000, 0.45)).toBeCloseTo(450);
  });

  it('returns 0 for zero cost', () => {
    expect(sredCredits(0, 0.45)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to confirm fail**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/sred-totals.spec.ts
```

Expected: FAIL — "Cannot find module './sred-totals'"

- [ ] **Step 3: Implement sred-totals.ts**

Create `src/app/features/dashboard/calculations/sred-totals.ts`:

```typescript
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

function eligibleSet(projects: readonly Project[]): Set<string> {
  return new Set(projects.filter(p => p.isSredEligible).map(p => p.id));
}

export function sredTotalHours(
  periodEntries: readonly TimeEntry[],
  projects: readonly Project[],
): number {
  const eligible = eligibleSet(projects);
  let total = 0;
  for (const e of periodEntries) {
    if (eligible.has(e.projectId)) total += e.hours;
  }
  return total;
}

export function sredTotalCost(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
): number {
  const eligible = eligibleSet(projects);
  const rateById = new Map(employees.map(emp => [emp.id, hourlyRate(emp)]));
  let total = 0;
  for (const e of periodEntries) {
    if (!eligible.has(e.projectId)) continue;
    const rate = rateById.get(e.employeeId);
    if (rate === undefined) continue;
    total += e.hours * rate;
  }
  return total;
}

export function sredCredits(sredCost: number, creditRate: number): number {
  return sredCost * creditRate;
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/sred-totals.spec.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/calculations/sred-totals.ts \
        src/app/features/dashboard/calculations/sred-totals.spec.ts
git commit -m "feat: add SR&ED totals and credits calculations"
```

---

## Task 5: Project Bar Data Calculations (TDD)

**Files:**
- Create: `src/app/features/dashboard/calculations/project-bar-data.ts`
- Create: `src/app/features/dashboard/calculations/project-bar-data.spec.ts`

- [ ] **Step 1: Write failing spec**

Create `src/app/features/dashboard/calculations/project-bar-data.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { projectBarData, employeeBreakdownData, employeeProjectBars } from './project-bar-data';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: `Name-${id}`, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: `Proj-${id}`, description: '', isSredEligible: eligible,
});
const e = (empId: string, projId: string, hours: number): TimeEntry => ({
  id: `${empId}-${projId}`, employeeId: empId, projectId: projId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a', 100000), emp('b', 60000)];
// a: $50/hr   b: $30/hr
const PROJECTS = [proj('sred', true), proj('unclaimed', false)];
const ENTRIES = [
  e('a', 'sred', 10),
  e('b', 'sred', 20),
  e('a', 'unclaimed', 5),
];

describe('projectBarData', () => {
  it('returns one bar per project in hours mode', () => {
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'hours', 0.45);
    expect(bars).toHaveLength(2);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBe(30);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBe(5);
  });

  it('assigns grey to unclaimed projects', () => {
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'hours', 0.45);
    expect(bars.find(b => b.projectId === 'unclaimed')?.color).toBe('#9ca3af');
  });

  it('computes expenditure mode correctly', () => {
    // a: 10×50=500, b: 20×30=600 → sred=1100; a: 5×50=250 → unclaimed=250
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'expenditures', 0.45);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBeCloseTo(1100);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBeCloseTo(250);
  });

  it('computes credits mode (eligible only scaled by rate)', () => {
    // sred=1100×0.45=495; unclaimed stays as cost (250, not credits)
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'credits', 0.45);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBeCloseTo(495);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBeCloseTo(250);
  });
});

describe('employeeBreakdownData', () => {
  it('returns one entry per employee with hours on that project', () => {
    const result = employeeBreakdownData(ENTRIES, EMPLOYEES, 'sred', 'hours', 0.45, true);
    expect(result).toHaveLength(2);
    expect(result.find(r => r.employeeId === 'a')?.value).toBe(10);
    expect(result.find(r => r.employeeId === 'b')?.value).toBe(20);
  });

  it('excludes employees with zero hours on that project', () => {
    const result = employeeBreakdownData(ENTRIES, EMPLOYEES, 'unclaimed', 'hours', 0.45, false);
    expect(result).toHaveLength(1);
    expect(result[0].employeeId).toBe('a');
  });
});
```

- [ ] **Step 2: Run test to confirm fail**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/project-bar-data.spec.ts
```

Expected: FAIL — "Cannot find module './project-bar-data'"

- [ ] **Step 3: Implement project-bar-data.ts**

Create `src/app/features/dashboard/calculations/project-bar-data.ts`:

```typescript
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
    const totalHours = projEntries.reduce((sum, e) => sum + e.hours, 0);

    let value: number;
    if (mode === 'hours') {
      value = totalHours;
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
      return { employeeId: emp.id, name: emp.name, value };
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
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/project-bar-data.spec.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/calculations/project-bar-data.ts \
        src/app/features/dashboard/calculations/project-bar-data.spec.ts
git commit -m "feat: add project bar data and employee breakdown calculations"
```

---

## Task 6: Staff Bar Data Calculations (TDD)

**Files:**
- Create: `src/app/features/dashboard/calculations/staff-bar-data.ts`
- Create: `src/app/features/dashboard/calculations/staff-bar-data.spec.ts`

- [ ] **Step 1: Write failing spec**

Create `src/app/features/dashboard/calculations/staff-bar-data.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { staffBarData } from './staff-bar-data';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string): Employee => ({
  id, name: `Name-${id}`, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: 60000, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: id, description: '', isSredEligible: eligible,
});
const e = (empId: string, projId: string, hours: number): TimeEntry => ({
  id: `${empId}-${projId}`, employeeId: empId, projectId: projId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a'), emp('b')];
const PROJECTS = [proj('p-sred', true), proj('p-unclaim', false)];
const ENTRIES = [
  e('a', 'p-sred', 8),
  e('a', 'p-unclaim', 4),
  e('b', 'p-sred', 3),
];

describe('staffBarData', () => {
  it('splits hours into SR&ED and unclaimed per employee', () => {
    const result = staffBarData(ENTRIES, EMPLOYEES, PROJECTS);
    const a = result.find(r => r.employeeId === 'a');
    const b = result.find(r => r.employeeId === 'b');
    expect(a?.sredHours).toBe(8);
    expect(a?.unclaimedHours).toBe(4);
    expect(b?.sredHours).toBe(3);
    expect(b?.unclaimedHours).toBe(0);
  });

  it('returns an entry for every employee even with zero hours', () => {
    const result = staffBarData([], EMPLOYEES, PROJECTS);
    expect(result).toHaveLength(2);
    expect(result.every(r => r.sredHours === 0 && r.unclaimedHours === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to confirm fail**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/staff-bar-data.spec.ts
```

Expected: FAIL — "Cannot find module './staff-bar-data'"

- [ ] **Step 3: Implement staff-bar-data.ts**

Create `src/app/features/dashboard/calculations/staff-bar-data.ts`:

```typescript
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { StaffBarEntry } from '../models/chart-data.model';

export function staffBarData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
): StaffBarEntry[] {
  const eligibleIds = new Set(projects.filter(p => p.isSredEligible).map(p => p.id));

  return employees.map(emp => {
    let sredHours = 0;
    let unclaimedHours = 0;
    for (const e of periodEntries) {
      if (e.employeeId !== emp.id) continue;
      if (eligibleIds.has(e.projectId)) {
        sredHours += e.hours;
      } else {
        unclaimedHours += e.hours;
      }
    }
    return { employeeId: emp.id, name: emp.name, sredHours, unclaimedHours };
  });
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/staff-bar-data.spec.ts
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Update calculations index**

Replace entire `src/app/features/dashboard/calculations/index.ts`:

```typescript
export * from './hourly-rate';
export * from './date-utils';
export * from './project-totals';
export * from './grand-totals';
export * from './projections';
export * from './quarterly';
export * from './sred-totals';
export * from './project-bar-data';
export * from './staff-bar-data';
```

- [ ] **Step 6: Run all calc tests**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/
```

Expected: all specs PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/features/dashboard/calculations/staff-bar-data.ts \
        src/app/features/dashboard/calculations/staff-bar-data.spec.ts \
        src/app/features/dashboard/calculations/index.ts
git commit -m "feat: add staff bar data calculation and update calculations index"
```

---

## Task 7: ModeTabs Component

**Files:**
- Create: `src/app/features/dashboard/components/mode-tabs/mode-tabs.ts`
- Create: `src/app/features/dashboard/components/mode-tabs/mode-tabs.html`

- [ ] **Step 1: Create mode-tabs.ts**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SredMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-mode-tabs',
  imports: [],
  templateUrl: './mode-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeTabsComponent {
  readonly mode = input<SredMode>('hours');
  readonly modeChange = output<SredMode>();

  readonly tabs: readonly { value: SredMode; label: string }[] = [
    { value: 'hours', label: 'Show Hours' },
    { value: 'expenditures', label: 'Show Expenditures' },
    { value: 'credits', label: 'Show Credits' },
  ];

  select(next: SredMode): void {
    if (next !== this.mode()) this.modeChange.emit(next);
  }
}
```

- [ ] **Step 2: Create mode-tabs.html**

```html
<div role="group" class="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm p-0.5">
  @for (tab of tabs; track tab.value) {
    <button
      type="button"
      (click)="select(tab.value)"
      [class.bg-blue-600]="mode() === tab.value"
      [class.text-white]="mode() === tab.value"
      [class.text-gray-700]="mode() !== tab.value"
      class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap">
      @if (mode() === tab.value) {
        <span class="mr-1">✓</span>
      }
      {{ tab.label }}
    </button>
  }
</div>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/mode-tabs/
git commit -m "feat: add ModeTabs component (Hours/Expenditures/Credits)"
```

---

## Task 8: QuarterlyTimeline Component

**Files:**
- Create: `src/app/features/dashboard/components/quarterly-timeline/quarterly-timeline.ts`
- Create: `src/app/features/dashboard/components/quarterly-timeline/quarterly-timeline.html`

- [ ] **Step 1: Create quarterly-timeline.ts**

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterPeriod, SredMode } from '../../models/chart-data.model';

export interface QuarterTab {
  readonly period: QuarterPeriod;
  readonly label: string;
  readonly sublabel: string;
  readonly value: number;
}

@Component({
  selector: 'app-quarterly-timeline',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './quarterly-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterlyTimelineComponent {
  readonly tabs = input.required<readonly QuarterTab[]>();
  readonly selected = input<QuarterPeriod>('ytd');
  readonly mode = input<SredMode>('hours');
  readonly periodSelect = output<QuarterPeriod>();

  select(period: QuarterPeriod): void {
    if (period !== this.selected()) this.periodSelect.emit(period);
  }
}
```

- [ ] **Step 2: Create quarterly-timeline.html**

```html
<div class="grid grid-cols-5 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 text-center">
  @for (tab of tabs(); track tab.period) {
    @let isActive = selected() === tab.period;
    <button
      type="button"
      (click)="select(tab.period)"
      [class.bg-white]="isActive"
      [class.shadow-sm]="isActive"
      [class.border-b-2]="isActive"
      [class.border-b-blue-600]="isActive"
      [class.text-blue-700]="isActive"
      [class.text-gray-600]="!isActive"
      class="py-3 px-2 transition-colors cursor-pointer">
      <p class="text-base font-semibold truncate">
        @if (mode() === 'hours') {
          {{ tab.value | number:'1.0-0' }}
          <span class="text-sm font-normal ml-0.5">hrs</span>
        } @else {
          {{ tab.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
        }
      </p>
      <p class="text-xs mt-0.5 truncate">{{ tab.sublabel }}</p>
      <p class="text-xs font-medium mt-0.5">{{ tab.label }}</p>
    </button>
  }
</div>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/quarterly-timeline/
git commit -m "feat: add QuarterlyTimeline component with Q1-Q4+YTD tabs"
```

---

## Task 9: DualKpiPanel Component

**Files:**
- Create: `src/app/features/dashboard/components/dual-kpi-panel/dual-kpi-panel.ts`
- Create: `src/app/features/dashboard/components/dual-kpi-panel/dual-kpi-panel.html`

- [ ] **Step 1: Create dual-kpi-panel.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterPeriod, SredMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-dual-kpi-panel',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dual-kpi-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DualKpiPanelComponent {
  readonly currentValue = input.required<number>();
  readonly projectedValue = input<number | null>(null);
  readonly mode = input<SredMode>('hours');
  readonly selectedPeriod = input<QuarterPeriod>('ytd');
  readonly isLoading = input(false);

  readonly showProjection = computed(
    () => this.selectedPeriod() === 'ytd' && this.projectedValue() !== null,
  );

  readonly periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'ytd': return 'Current Year to Date SR&ED';
      case 'q1': return 'Q1 SR&ED';
      case 'q2': return 'Q2 SR&ED';
      case 'q3': return 'Q3 SR&ED';
      case 'q4': return 'Q4 SR&ED';
    }
  });
}
```

- [ ] **Step 2: Create dual-kpi-panel.html**

```html
<div class="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-8">
  @if (isLoading()) {
    <div class="flex-1 h-16 animate-pulse bg-gray-100 rounded"></div>
  } @else {
    <div class="flex-1 text-center border-r border-gray-100">
      <p class="text-4xl font-bold text-blue-700">
        @if (mode() === 'hours') {
          {{ currentValue() | number:'1.0-0' }}
          <span class="text-2xl font-semibold ml-1">hours</span>
        } @else {
          {{ currentValue() | currency:'CAD':'symbol-narrow':'1.0-0' }}
        }
      </p>
      <p class="text-sm text-gray-500 mt-1">{{ periodLabel() }}</p>
    </div>

    @if (showProjection()) {
      <div class="flex-1 text-center">
        <p class="text-3xl font-semibold text-gray-400">
          <span class="text-lg mr-1 text-gray-300">↗</span>
          @if (mode() === 'hours') {
            {{ projectedValue() | number:'1.0-0' }}
            <span class="text-xl font-normal ml-1">hours</span>
          } @else {
            {{ projectedValue() | currency:'CAD':'symbol-narrow':'1.0-0' }}
          }
        </p>
        <p class="text-sm text-gray-400 mt-1">Full Year SR&ED (Projected)</p>
      </div>
    } @else {
      <div class="flex-1"></div>
    }
  }
</div>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/dual-kpi-panel/
git commit -m "feat: add DualKpiPanel showing current period and projected full-year KPIs"
```

---

## Task 10: SredProjectsBar Component

**Files:**
- Create: `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.ts`
- Create: `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html`

- [ ] **Step 1: Create sred-projects-bar.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';

@Component({
  selector: 'app-sred-projects-bar',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './sred-projects-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SredProjectsBarComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly projectClick = output<string>();

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));

  widthPct(value: number): string {
    const t = this.total();
    return t === 0 ? '0%' : `${((value / t) * 100).toFixed(2)}%`;
  }
}
```

- [ ] **Step 2: Create sred-projects-bar.html**

```html
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-8 text-center">No data for this period.</p>
} @else {
  <div class="flex w-full h-16 rounded overflow-hidden gap-0.5">
    @for (bar of bars(); track bar.projectId) {
      @if (bar.value > 0) {
        <button
          type="button"
          [style.width]="widthPct(bar.value)"
          [style.background-color]="bar.color"
          (click)="projectClick.emit(bar.projectId)"
          class="relative flex flex-col items-center justify-center text-white text-xs font-medium overflow-hidden hover:opacity-90 transition-opacity cursor-pointer min-w-0 shrink-0">
          <span class="truncate px-1 text-center leading-tight">{{ bar.projectName }}</span>
          <span class="truncate px-1 text-center leading-tight opacity-90">
            @if (mode() === 'hours') {
              {{ bar.value | number:'1.0-0' }} hrs
            } @else {
              {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
            }
          </span>
        </button>
      }
    }
  </div>
}
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/sred-projects-bar/
git commit -m "feat: add SredProjectsBar proportional bar chart component"
```

---

## Task 11: EmployeeBreakdownBar Component

**Files:**
- Create: `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.ts`
- Create: `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html`

- [ ] **Step 1: Create employee-breakdown-bar.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeBreakdownBar, SredMode } from '../../models/chart-data.model';

const EMPLOYEE_COLORS = [
  '#1d4ed8','#0891b2','#059669','#d97706','#dc2626',
  '#7c3aed','#be185d','#0369a1',
];

@Component({
  selector: 'app-employee-breakdown-bar',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './employee-breakdown-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeBreakdownBarComponent {
  readonly bars = input.required<readonly EmployeeBreakdownBar[]>();
  readonly mode = input<SredMode>('hours');

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));

  widthPct(value: number): string {
    const t = this.total();
    return t === 0 ? '0%' : `${((value / t) * 100).toFixed(2)}%`;
  }

  colorFor(index: number): string {
    return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
  }
}
```

- [ ] **Step 2: Create employee-breakdown-bar.html**

```html
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-4 text-center">No employee data for this project/period.</p>
} @else {
  <div class="flex w-full h-16 rounded overflow-hidden gap-0.5">
    @for (bar of bars(); track bar.employeeId; let i = $index) {
      <button
        type="button"
        [style.width]="widthPct(bar.value)"
        [style.background-color]="colorFor(i)"
        class="flex flex-col items-center justify-center text-white text-xs font-medium overflow-hidden min-w-0 shrink-0 cursor-default">
        <span class="truncate px-1 text-center leading-tight">{{ bar.name }}</span>
        <span class="truncate px-1 text-center leading-tight opacity-90">
          @if (mode() === 'hours') {
            {{ bar.value | number:'1.0-0' }} hrs
          } @else {
            {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
          }
        </span>
      </button>
    }
  </div>
}
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/employee-breakdown-bar/
git commit -m "feat: add EmployeeBreakdownBar component for project drill-down"
```

---

## Task 12: StaffSalaryTable Component

**Files:**
- Create: `src/app/features/dashboard/components/staff-salary-table/staff-salary-table.ts`
- Create: `src/app/features/dashboard/components/staff-salary-table/staff-salary-table.html`

- [ ] **Step 1: Create staff-salary-table.ts**

```typescript
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeRow } from '../../models/chart-data.model';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';

@Component({
  selector: 'app-staff-salary-table',
  imports: [CurrencyPipe, DecimalPipe, ShortDatePipe],
  templateUrl: './staff-salary-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffSalaryTableComponent {
  readonly rows = input.required<readonly EmployeeRow[]>();
  readonly isLoading = input(false);

  readonly isCollapsed = signal(false);

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }
}
```

- [ ] **Step 2: Create staff-salary-table.html**

```html
<section class="bg-white rounded-lg border border-gray-200">
  <button
    type="button"
    (click)="toggleCollapse()"
    class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
    <h2 class="text-base font-semibold text-gray-900">Staff Salary</h2>
    <svg
      class="w-4 h-4 text-gray-400 transition-transform"
      [class.rotate-180]="isCollapsed()"
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  @if (!isCollapsed()) {
    @if (isLoading()) {
      <div class="h-32 mx-5 mb-5 animate-pulse bg-gray-100 rounded"></div>
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-t border-gray-100">
            <tr>
              <th class="px-5 py-3">Name</th>
              <th class="px-5 py-3">Start Date</th>
              <th class="px-5 py-3">End Date</th>
              <th class="px-5 py-3 text-right">Expected Salary</th>
              <th class="px-5 py-3 text-right">Confirmed Salary</th>
              <th class="px-5 py-3 text-right">Hourly Rate</th>
              <th class="px-5 py-3 text-right">Hours Worked</th>
              <th class="px-5 py-3 text-center">Special</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (row of rows(); track row.id) {
              <tr class="bg-white hover:bg-gray-50">
                <td class="px-5 py-3 font-medium text-gray-900">{{ row.name }}</td>
                <td class="px-5 py-3">{{ row.hireDate | shortDate }}</td>
                <td class="px-5 py-3">{{ row.endDate ? (row.endDate | shortDate) : '—' }}</td>
                <td class="px-5 py-3 text-right">
                  {{ row.annualSalary | currency:'CAD':'symbol-narrow':'1.0-0' }}
                </td>
                <td class="px-5 py-3 text-right">
                  {{ row.confirmedSalary != null
                    ? (row.confirmedSalary | currency:'CAD':'symbol-narrow':'1.0-0')
                    : '—' }}
                </td>
                <td class="px-5 py-3 text-right">
                  {{ row.hourlyRate | currency:'CAD':'symbol-narrow':'1.2-2' }}
                </td>
                <td class="px-5 py-3 text-right">{{ row.ytdHours | number:'1.0-0' }}</td>
                <td class="px-5 py-3 text-center">
                  <input type="checkbox" [checked]="row.isSpecialEmployee ?? false" disabled class="rounded" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  }
</section>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/staff-salary-table/
git commit -m "feat: add StaffSalaryTable component with collapsible rows"
```

---

## Task 13: TeamStaffChart Component

**Files:**
- Create: `src/app/features/dashboard/components/team-staff-chart/team-staff-chart.ts`
- Create: `src/app/features/dashboard/components/team-staff-chart/team-staff-chart.html`

- [ ] **Step 1: Create team-staff-chart.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexChart, ApexPlotOptions, ApexDataLabels, ApexXAxis, ApexYAxis, ApexLegend, ApexTooltip } from 'ng-apexcharts';
import { StaffBarEntry } from '../../models/chart-data.model';

@Component({
  selector: 'app-team-staff-chart',
  imports: [NgApexchartsModule],
  templateUrl: './team-staff-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStaffChartComponent {
  readonly entries = input.required<readonly StaffBarEntry[]>();
  readonly employeeClick = output<string>();

  readonly series = computed(() => [
    { name: 'SR&ED', data: this.entries().map(e => Math.round(e.sredHours)) },
    { name: 'Unclaimed', data: this.entries().map(e => Math.round(e.unclaimedHours)) },
  ]);

  readonly chartOptions = computed(() => {
    const entries = this.entries();
    return {
      chart: {
        type: 'bar' as const,
        height: Math.max(180, entries.length * 60 + 80),
        width: '100%',
        redrawOnParentResize: true,
        toolbar: { show: false },
        events: {
          dataPointSelection: (
            _event: unknown,
            _ctx: unknown,
            config: { dataPointIndex: number },
          ) => {
            const entry = entries[config.dataPointIndex];
            if (entry) this.employeeClick.emit(entry.employeeId);
          },
        },
      } as ApexChart,
      plotOptions: {
        bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 },
      } as ApexPlotOptions,
      dataLabels: { enabled: false } as ApexDataLabels,
      xaxis: {
        categories: entries.map(e => e.name),
        labels: { rotate: -30, style: { fontSize: '11px' } },
        title: { text: 'SR&ED Employees and Contractors' },
      } as ApexXAxis,
      yaxis: { title: { text: 'SR&ED Hours' } } as ApexYAxis,
      colors: ['#1e40af', '#9ca3af'],
      legend: { show: true, position: 'right' as const } as ApexLegend,
      tooltip: {
        y: { formatter: (v: number) => `${v.toFixed(0)} hrs` },
      } as ApexTooltip,
    };
  });
}
```

- [ ] **Step 2: Create team-staff-chart.html**

```html
<apx-chart
  class="block w-full"
  [series]="series()"
  [chart]="chartOptions().chart"
  [plotOptions]="chartOptions().plotOptions"
  [dataLabels]="chartOptions().dataLabels"
  [xaxis]="chartOptions().xaxis"
  [yaxis]="chartOptions().yaxis"
  [colors]="chartOptions().colors"
  [legend]="chartOptions().legend"
  [tooltip]="chartOptions().tooltip" />
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/team-staff-chart/
git commit -m "feat: add TeamStaffChart ApexCharts component with SR&ED vs Unclaimed grouped bars"
```

---

## Task 14: EmployeeModal Component

**Files:**
- Create: `src/app/features/dashboard/components/employee-modal/employee-modal.ts`
- Create: `src/app/features/dashboard/components/employee-modal/employee-modal.html`

- [ ] **Step 1: Create employee-modal.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Employee } from '../../../../core/models/employee.model';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';
import { ModeTabsComponent } from '../mode-tabs/mode-tabs';
import { SredProjectsBarComponent } from '../sred-projects-bar/sred-projects-bar';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';

@Component({
  selector: 'app-employee-modal',
  imports: [CurrencyPipe, DecimalPipe, PercentPipe, ShortDatePipe, ModeTabsComponent, SredProjectsBarComponent],
  templateUrl: './employee-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeModalComponent {
  readonly employee = input.required<Employee>();
  readonly projectBars = input.required<readonly SredProjectBar[]>();
  readonly sredHours = input.required<number>();
  readonly totalHours = input.required<number>();
  readonly periodLabel = input<string>('');
  readonly mode = input<SredMode>('hours');
  readonly close = output<void>();
  readonly modeChange = output<SredMode>();

  readonly sredAllocation = computed(() => {
    const total = this.totalHours();
    return total === 0 ? 0 : this.sredHours() / total;
  });
}
```

- [ ] **Step 2: Create employee-modal.html**

```html
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true">
  <div
    class="absolute inset-0 bg-black/40"
    (click)="close.emit()"></div>

  <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
      <h2 class="text-base font-semibold text-gray-900">{{ employee().name }}</h2>
      <app-mode-tabs [mode]="mode()" (modeChange)="modeChange.emit($event)" />
    </div>

    <div class="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm border-b border-gray-100">
      <div>
        <span class="font-medium text-gray-700">Date Range: </span>
        <span class="text-gray-600">{{ periodLabel() }}</span>
      </div>
      <div>
        <span class="font-medium text-gray-700">Hire Date: </span>
        <span class="text-gray-600">{{ employee().hireDate | shortDate }}</span>
      </div>
      <div>
        <span class="font-medium text-gray-700">Role: </span>
        <span class="text-gray-600">{{ employee().role }}</span>
      </div>
      <div>
        <span class="font-medium text-gray-700">End Date: </span>
        <span class="text-gray-600">{{ employee().endDate ? (employee().endDate! | shortDate) : '—' }}</span>
      </div>
    </div>

    <div class="px-6 py-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">SR&amp;ED Projects</h3>
      <app-sred-projects-bar [bars]="projectBars()" [mode]="mode()" />
    </div>

    <div class="px-6 py-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
      <div>
        <p class="font-semibold text-gray-900">
          @if (mode() === 'hours') {
            {{ sredHours() | number:'1.0-0' }}
          } @else if (mode() === 'expenditures') {
            {{ sredHours() | currency:'CAD':'symbol-narrow':'1.0-0' }}
          }
        </p>
        <p class="text-gray-500 text-xs">SR&amp;ED Hours</p>
      </div>
      <div>
        <p class="font-semibold text-gray-900">{{ totalHours() | number:'1.0-0' }}</p>
        <p class="text-gray-500 text-xs">Total Hours</p>
      </div>
      <div>
        <p class="text-xl font-bold text-gray-900">SR&amp;ED Allocation: {{ sredAllocation() | percent:'1.3-3' }}</p>
      </div>
    </div>

    <div class="px-6 pb-5 flex justify-end">
      <button
        type="button"
        (click)="close.emit()"
        class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        Ok
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/employee-modal/
git commit -m "feat: add EmployeeModal with project breakdown and SR&ED allocation stats"
```

---

## Task 15: StaffSection Component

**Files:**
- Create: `src/app/features/dashboard/components/staff-section/staff-section.ts`
- Create: `src/app/features/dashboard/components/staff-section/staff-section.html`

- [ ] **Step 1: Create staff-section.ts**

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Team } from '../../../../core/models/team.model';
import { Employee } from '../../../../core/models/employee.model';
import { StaffBarEntry } from '../../models/chart-data.model';
import { TeamStaffChartComponent } from '../team-staff-chart/team-staff-chart';

interface TeamGroup {
  readonly label: string;
  readonly teamId: string | null;
  readonly entries: readonly StaffBarEntry[];
}

@Component({
  selector: 'app-staff-section',
  imports: [TeamStaffChartComponent],
  templateUrl: './staff-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffSectionComponent {
  readonly teams = input.required<readonly Team[]>();
  readonly employees = input.required<readonly Employee[]>();
  readonly staffData = input.required<readonly StaffBarEntry[]>();
  readonly employeeClick = output<string>();

  readonly totalCount = computed(() => this.employees().length);

  readonly groups = computed<readonly TeamGroup[]>(() => {
    const teams = this.teams();
    const employees = this.employees();
    const staffData = this.staffData();

    const byEmpId = new Map(staffData.map(s => [s.employeeId, s]));

    const unassigned = employees
      .filter(emp => !emp.teamId)
      .map(emp => byEmpId.get(emp.id))
      .filter((s): s is StaffBarEntry => !!s);

    const teamGroups: TeamGroup[] = teams.map(team => ({
      label: team.name,
      teamId: team.id,
      entries: employees
        .filter(emp => emp.teamId === team.id)
        .map(emp => byEmpId.get(emp.id))
        .filter((s): s is StaffBarEntry => !!s),
    }));

    const result: TeamGroup[] = [];
    if (unassigned.length > 0) {
      result.push({ label: 'Staff not Assigned to Team', teamId: null, entries: unassigned });
    }
    return [...result, ...teamGroups];
  });
}
```

- [ ] **Step 2: Create staff-section.html**

```html
<section class="bg-white rounded-lg border border-gray-200 p-5 space-y-6">
  <div class="flex items-center gap-2">
    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.48-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.48.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <h2 class="text-base font-semibold text-gray-900">
      Total Staff Included in Claim ({{ totalCount() }})
    </h2>
  </div>

  @for (group of groups(); track group.label) {
    <div>
      <div class="flex items-center gap-1.5 mb-3">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span class="text-sm font-medium text-gray-700">{{ group.label }}</span>
      </div>
      <app-team-staff-chart
        [entries]="group.entries"
        (employeeClick)="employeeClick.emit($event)" />
    </div>
  }
</section>
```

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
git add src/app/features/dashboard/components/staff-section/
git commit -m "feat: add StaffSection with team groupings and grouped bar charts"
```

---

## Task 16: Dashboard Page Rewrite

**Files:**
- Modify: `src/app/features/dashboard/dashboard.ts`
- Modify: `src/app/features/dashboard/dashboard.html`

- [ ] **Step 1: Replace dashboard.ts**

Replace entire `src/app/features/dashboard/dashboard.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { TeamsService } from './services/teams.service';
import { ClientHeaderComponent } from './components/client-header/client-header';
import { ModeTabsComponent } from './components/mode-tabs/mode-tabs';
import { QuarterlyTimelineComponent, QuarterTab } from './components/quarterly-timeline/quarterly-timeline';
import { DualKpiPanelComponent } from './components/dual-kpi-panel/dual-kpi-panel';
import { SredProjectsBarComponent } from './components/sred-projects-bar/sred-projects-bar';
import { EmployeeBreakdownBarComponent } from './components/employee-breakdown-bar/employee-breakdown-bar';
import { StaffSectionComponent } from './components/staff-section/staff-section';
import { EmployeeModalComponent } from './components/employee-modal/employee-modal';
import { StaffSalaryTableComponent } from './components/staff-salary-table/staff-salary-table';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import {
  projectFullYear,
  hourlyRate,
} from './calculations';
import {
  quarterBoundaries,
  filterEntriesByPeriod,
} from './calculations/quarterly';
import {
  sredTotalHours,
  sredTotalCost,
  sredCredits,
} from './calculations/sred-totals';
import {
  projectBarData,
  employeeBreakdownData,
  employeeProjectBars,
} from './calculations/project-bar-data';
import { staffBarData } from './calculations/staff-bar-data';
import { SredMode, QuarterPeriod, EmployeeRow } from './models/chart-data.model';
import { Client } from '../../core/models/client.model';
import { Employee } from '../../core/models/employee.model';
import { Project } from './models/project.model';
import { TimeEntry } from './models/time-entry.model';
import { Team } from '../../core/models/team.model';

const QUARTER_LABELS: Record<QuarterPeriod, string> = {
  q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4', ytd: 'Year to Date',
};

@Component({
  selector: 'app-dashboard',
  imports: [
    ClientHeaderComponent,
    ModeTabsComponent,
    QuarterlyTimelineComponent,
    DualKpiPanelComponent,
    SredProjectsBarComponent,
    EmployeeBreakdownBarComponent,
    StaffSectionComponent,
    EmployeeModalComponent,
    StaffSalaryTableComponent,
    CurrencyPipe,
    DecimalPipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly clientsSvc = inject(ClientsService);
  private readonly employeesSvc = inject(EmployeesService);
  private readonly projectsSvc = inject(ProjectsService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);
  private readonly teamsSvc = inject(TeamsService);

  readonly client = toSignal<Client | null, Client | null>(this.clientsSvc.getCurrent(), {
    initialValue: null,
  });
  readonly employees = toSignal<readonly Employee[], readonly Employee[]>(
    this.employeesSvc.getAll(), { initialValue: [] },
  );
  readonly projects = toSignal<readonly Project[], readonly Project[]>(
    this.projectsSvc.getAll(), { initialValue: [] },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(), { initialValue: [] },
  );
  readonly teams = toSignal<readonly Team[], readonly Team[]>(
    this.teamsSvc.getAll(), { initialValue: [] },
  );

  readonly mode = signal<SredMode>('hours');
  readonly selectedPeriod = signal<QuarterPeriod>('ytd');
  readonly drilledProjectId = signal<string | null>(null);
  readonly selectedEmployeeId = signal<string | null>(null);
  readonly modalMode = signal<SredMode>('hours');

  readonly isLoading = computed(() =>
    !this.client() ||
    this.employees().length === 0 ||
    this.projects().length === 0 ||
    this.timeEntries().length === 0,
  );

  readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly periodEntries = computed(() => {
    const c = this.client();
    if (!c) return [];
    const { start, end } = quarterBoundaries(this.selectedPeriod(), c.claimPeriod.startDate, this.asOf);
    return filterEntriesByPeriod(this.timeEntries(), start, end);
  });

  readonly quarterlyTabs = computed<readonly QuarterTab[]>(() => {
    const c = this.client();
    if (!c) return [];
    const entries = this.timeEntries();
    const employees = this.employees();
    const projects = this.projects();
    const mode = this.mode();
    const creditRate = c.sredCreditRate ?? 0.45;
    const year = parseInt(c.claimPeriod.startDate.slice(0, 4), 10);

    const PERIODS: QuarterPeriod[] = ['q1', 'q2', 'q3', 'q4', 'ytd'];
    const SUBLABELS: Record<QuarterPeriod, string> = {
      q1: `Jan 1 – Mar 31, ${year}`,
      q2: `Apr 1 – Jun 30, ${year}`,
      q3: `Jul 1 – Sep 30, ${year}`,
      q4: `Oct 1 – Dec 31, ${year}`,
      ytd: `${c.claimPeriod.startDate} – ${this.asOf}`,
    };

    return PERIODS.map(period => {
      const { start, end } = quarterBoundaries(period, c.claimPeriod.startDate, this.asOf);
      const pEntries = filterEntriesByPeriod(entries, start, end);
      let value: number;
      if (mode === 'hours') {
        value = sredTotalHours(pEntries, projects);
      } else {
        const cost = sredTotalCost(pEntries, employees, projects);
        value = mode === 'credits' ? sredCredits(cost, creditRate) : cost;
      }
      return { period, label: QUARTER_LABELS[period], sublabel: SUBLABELS[period], value };
    });
  });

  readonly currentKpiValue = computed(() => {
    const tab = this.quarterlyTabs().find(t => t.period === this.selectedPeriod());
    return tab?.value ?? 0;
  });

  readonly projectedFullYearValue = computed<number | null>(() => {
    if (this.selectedPeriod() !== 'ytd') return null;
    const c = this.client();
    if (!c) return null;
    return projectFullYear(
      this.currentKpiValue(),
      c.claimPeriod.startDate,
      c.claimPeriod.endDate,
      this.asOf,
    ).projectedFullYear;
  });

  readonly projectBars = computed(() =>
    projectBarData(
      this.periodEntries(),
      this.employees(),
      this.projects(),
      this.mode(),
      this.client()?.sredCreditRate ?? 0.45,
    ),
  );

  readonly drilledProject = computed(() => {
    const id = this.drilledProjectId();
    return id ? (this.projects().find(p => p.id === id) ?? null) : null;
  });

  readonly employeeBreakdownBars = computed(() => {
    const projectId = this.drilledProjectId();
    if (!projectId) return [];
    return employeeBreakdownData(
      this.periodEntries(),
      this.employees(),
      projectId,
      this.mode(),
      this.client()?.sredCreditRate ?? 0.45,
      this.drilledProject()?.isSredEligible ?? false,
    );
  });

  readonly staffBars = computed(() =>
    staffBarData(this.periodEntries(), this.employees(), this.projects()),
  );

  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const c = this.client();
    if (!c) return [];
    const { start, end } = quarterBoundaries('ytd', c.claimPeriod.startDate, this.asOf);
    const ytdEntries = filterEntriesByPeriod(this.timeEntries(), start, end);
    return this.employees().map(emp => {
      const ytdHours = ytdEntries
        .filter(e => e.employeeId === emp.id)
        .reduce((sum, e) => sum + e.hours, 0);
      const rate = hourlyRate(emp);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        hireDate: emp.hireDate,
        endDate: emp.endDate,
        annualSalary: emp.annualSalary,
        confirmedSalary: emp.confirmedSalary,
        isSpecialEmployee: emp.isSpecialEmployee ?? false,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
      };
    });
  });

  readonly selectedEmployee = computed(() => {
    const id = this.selectedEmployeeId();
    return id ? (this.employees().find(e => e.id === id) ?? null) : null;
  });

  readonly modalProjectBars = computed(() => {
    const emp = this.selectedEmployee();
    if (!emp) return [];
    return employeeProjectBars(
      this.periodEntries(),
      emp,
      this.projects(),
      this.modalMode(),
      this.client()?.sredCreditRate ?? 0.45,
    );
  });

  readonly modalSredHours = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return sredTotalHours(
      this.periodEntries().filter(e => e.employeeId === id),
      this.projects(),
    );
  });

  readonly modalTotalHours = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return this.periodEntries()
      .filter(e => e.employeeId === id)
      .reduce((sum, e) => sum + e.hours, 0);
  });

  readonly modalPeriodLabel = computed(() => {
    const c = this.client();
    if (!c) return '';
    const { start, end } = quarterBoundaries(this.selectedPeriod(), c.claimPeriod.startDate, this.asOf);
    return `${start} – ${end}`;
  });

  onModeChange(mode: SredMode): void { this.mode.set(mode); }
  onPeriodSelect(period: QuarterPeriod): void {
    this.selectedPeriod.set(period);
    this.drilledProjectId.set(null);
  }
  onProjectClick(projectId: string): void { this.drilledProjectId.set(projectId); }
  onDrillBack(): void { this.drilledProjectId.set(null); }
  onEmployeeClick(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
    this.modalMode.set(this.mode());
  }
  onModalClose(): void { this.selectedEmployeeId.set(null); }
  onModalModeChange(mode: SredMode): void { this.modalMode.set(mode); }
}
```

- [ ] **Step 2: Replace dashboard.html**

Replace entire `src/app/features/dashboard/dashboard.html`:

```html
<div class="space-y-5">
  <app-client-header [client]="client()" [isLoading]="isLoading()" />

  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <div class="flex items-start justify-between flex-wrap gap-3 mb-5">
      <h1 class="text-xl font-bold text-gray-900">SR&amp;ED Projections</h1>
      <div class="flex items-center gap-3 flex-wrap">
        <app-mode-tabs [mode]="mode()" (modeChange)="onModeChange($event)" />
        <button
          type="button"
          class="px-4 py-1.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap">
          Recalculate Projections
        </button>
      </div>
    </div>

    @if (isLoading()) {
      <div class="h-14 animate-pulse bg-gray-100 rounded mb-5"></div>
      <div class="h-20 animate-pulse bg-gray-100 rounded"></div>
    } @else {
      <app-quarterly-timeline
        [tabs]="quarterlyTabs()"
        [selected]="selectedPeriod()"
        [mode]="mode()"
        (periodSelect)="onPeriodSelect($event)" />

      <div class="mt-4">
        <app-dual-kpi-panel
          [currentValue]="currentKpiValue()"
          [projectedValue]="projectedFullYearValue()"
          [mode]="mode()"
          [selectedPeriod]="selectedPeriod()" />
      </div>
    }
  </div>

  <section class="bg-white rounded-lg border border-gray-200 p-5">
    <div class="flex items-center gap-2 mb-4">
      @if (drilledProject()) {
        <button
          type="button"
          (click)="onDrillBack()"
          class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-sm text-gray-500">/ {{ drilledProject()!.name }}</span>
      }
      <h2 class="text-base font-semibold text-gray-900">SR&amp;ED Projects</h2>
    </div>

    @if (isLoading()) {
      <div class="h-16 animate-pulse bg-gray-100 rounded"></div>
    } @else if (drilledProject()) {
      <app-employee-breakdown-bar
        [bars]="employeeBreakdownBars()"
        [mode]="mode()" />
    } @else {
      <app-sred-projects-bar
        [bars]="projectBars()"
        [mode]="mode()"
        (projectClick)="onProjectClick($event)" />
    }
  </section>

  <app-staff-section
    [teams]="teams()"
    [employees]="employees()"
    [staffData]="staffBars()"
    (employeeClick)="onEmployeeClick($event)" />

  <app-staff-salary-table
    [rows]="employeeRows()"
    [isLoading]="isLoading()" />
</div>

@if (selectedEmployee()) {
  <app-employee-modal
    [employee]="selectedEmployee()!"
    [projectBars]="modalProjectBars()"
    [sredHours]="modalSredHours()"
    [totalHours]="modalTotalHours()"
    [periodLabel]="modalPeriodLabel()"
    [mode]="modalMode()"
    (close)="onModalClose()"
    (modeChange)="onModalModeChange($event)" />
}
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit
```

Expected: zero errors. Fix any type errors before continuing.

- [ ] **Step 4: Run all calc specs to confirm nothing is broken**

```bash
cd /Users/kevinciang/Documents/Sredio && npx vitest run src/app/features/dashboard/calculations/
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/dashboard.ts \
        src/app/features/dashboard/dashboard.html
git commit -m "feat: rewrite dashboard as SR&ED Projections with quarterly timeline, dual KPI, projects bar, staff section, and salary table"
```

---

## Verification Checklist

Run after all tasks are complete:

```bash
cd /Users/kevinciang/Documents/Sredio && npx tsc --noEmit && npx vitest run
```

Expected: zero TypeScript errors; all specs PASS.

Then open the dev server and verify manually:

```bash
cd /Users/kevinciang/Documents/Sredio && npx ng serve
```

- [ ] Dashboard loads at `/dashboard`; default view: YTD period, Hours mode
- [ ] Quarterly timeline shows Q1–Q4 + YTD with SR&ED hours per quarter; Q4 shows 0 (no entries after Sep 30)
- [ ] Clicking "Show Expenditures" switches all values to dollar amounts
- [ ] Clicking "Show Credits" shows ~45% of expenditure values
- [ ] Clicking a quarterly tab (e.g. Q2) filters the KPI and project bars to that quarter; projection hidden
- [ ] Clicking YTD restores YTD view with projection shown
- [ ] Clicking a project bar drills in; shows employee segments; back arrow returns to project view
- [ ] Staff section shows 7 employees in 3 groups (Platform Team, Mobile Team, 1 unassigned)
- [ ] Clicking an employee bar opens the modal with their name, project breakdown, allocation %
- [ ] Modal's mode tabs are independent of the dashboard's mode tabs
- [ ] Staff Salary table is collapsible; shows all 7 employees with all columns
- [ ] Profile page at `/profile` is unaffected (still uses hours/cost toggle)
