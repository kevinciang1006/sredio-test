import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexXAxis, ApexTooltip } from 'ng-apexcharts';
import { Profile } from '../../models/profile.model';
import { TimeEntry } from '../../../dashboard/models/time-entry.model';
import { Project } from '../../../dashboard/models/project.model';
import { employeeHoursOnProject, employeeCostOnProject } from '../../../dashboard/calculations';
import { APP_CONSTANTS } from '../../../../core/constants/app-constants';

interface ProjectContribution {
  readonly projectId: string;
  readonly projectName: string;
  readonly isSredEligible: boolean;
  readonly hours: number;
  readonly cost: number;
}

@Component({
  selector: 'app-profile-contributions',
  imports: [NgApexchartsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './profile-contributions.html',
  styleUrl: './profile-contributions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileContributionsComponent {
  readonly profile = input<Profile | null>(null);
  readonly timeEntries = input<readonly TimeEntry[]>([]);
  readonly projects = input<readonly Project[]>([]);
  readonly isLoading = input(false);

  private readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly contributions = computed<readonly ProjectContribution[]>(() => {
    const p = this.profile();
    if (!p) return [];
    const entries = this.timeEntries();
    return this.projects()
      .map(proj => ({
        projectId: proj.id,
        projectName: proj.name,
        isSredEligible: proj.isSredEligible,
        hours: employeeHoursOnProject(p.id, proj.id, entries, this.asOf),
        cost: employeeCostOnProject(p, proj.id, entries, this.asOf),
      }))
      .filter(c => c.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  });

  readonly chartSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Hours', data: this.contributions().map(c => c.hours) },
  ]);

  readonly chartOpts = computed(() => ({
    chart: {
      type: 'bar' as const,
      height: Math.max(120, this.contributions().length * 52),
      width: '100%',
      redrawOnParentResize: true,
      toolbar: { show: false },
      animations: { enabled: false },
    } as ApexChart,
    plotOptions: {
      bar: { horizontal: true, barHeight: '55%', borderRadius: 4 },
    } as ApexPlotOptions,
    dataLabels: { enabled: false } as ApexDataLabels,
    xaxis: {
      categories: this.contributions().map(c => c.projectName),
    } as ApexXAxis,
    colors: ['#2563eb'],
    tooltip: {
      y: { formatter: (v: number) => `${v.toLocaleString('en-CA')} hrs` },
    } as ApexTooltip,
  }));
}
