import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  imports: [RouterOutlet],
  templateUrl: './guest-layout.html',
  styleUrl: './guest-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestLayoutComponent {}
