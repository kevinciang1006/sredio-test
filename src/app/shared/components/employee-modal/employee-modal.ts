import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Employee } from '../../../core/models/employee.model';
import { ChartView, SredMode, SredProjectBar } from '../../../features/dashboard/models/chart-data.model';
import { ModeTabsComponent } from '../../../features/dashboard/components/mode-tabs/mode-tabs';
import { ChartViewTabsComponent } from '../../../features/dashboard/components/chart-view-tabs/chart-view-tabs';
import { SredProjectsBarComponent } from '../../../features/dashboard/components/sred-projects-bar/sred-projects-bar';
import { SredProjectsEchartsComponent } from '../../../features/dashboard/components/sred-projects-echarts/sred-projects-echarts';
import { ShortDatePipe } from '../../pipes/short-date.pipe';

@Component({
  selector: 'app-employee-modal',
  imports: [CurrencyPipe, DecimalPipe, PercentPipe, ShortDatePipe,
    ModeTabsComponent, ChartViewTabsComponent,
    SredProjectsBarComponent, SredProjectsEchartsComponent],
  templateUrl: './employee-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeModalComponent {
  readonly employee = input.required<Employee>();
  readonly projectBars = input.required<readonly SredProjectBar[]>();
  readonly sredHours = input.required<number>();
  readonly sredCost = input.required<number>();
  readonly sredCredits = input.required<number>();
  readonly totalHours = input.required<number>();
  readonly periodLabel = input<string>('');
  readonly mode = input<SredMode>('hours');
  readonly close = output<void>();
  readonly modeChange = output<SredMode>();

  readonly chartView = signal<ChartView>('donut');

  readonly sredAllocation = computed(() => {
    const total = this.totalHours();
    return total === 0 ? 0 : this.sredHours() / total;
  });
}
