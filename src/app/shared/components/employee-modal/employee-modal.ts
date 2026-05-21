import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Modal, type ModalOptions } from 'flowbite';
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

  private readonly destroyRef = inject(DestroyRef);
  private readonly modalEl = viewChild.required<ElementRef<HTMLElement>>('modalEl');
  private flowbiteModal: Modal | null = null;

  readonly sredAllocation = computed(() => {
    const total = this.totalHours();
    return total === 0 ? 0 : this.sredHours() / total;
  });

  constructor() {
    afterNextRender(() => {
      const options: ModalOptions = {
        placement: 'center',
        backdrop: 'dynamic',
        backdropClasses: 'bg-black/40 fixed inset-0 z-40',
        closable: true,
        onHide: () => this.close.emit(),
      };
      this.flowbiteModal = new Modal(this.modalEl().nativeElement, options);
      this.flowbiteModal.show();
    });

    this.destroyRef.onDestroy(() => {
      this.flowbiteModal?.hide();
      this.flowbiteModal?.destroy();
      this.flowbiteModal = null;
    });
  }

  onOk(): void {
    this.flowbiteModal?.hide();
  }
}
