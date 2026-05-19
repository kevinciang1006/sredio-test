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
