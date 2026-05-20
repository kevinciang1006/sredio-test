# Staff Gauge Animation + Display Mode Toggle — Design Spec

## Overview

Enhance the staff section employee cards with two improvements:
1. **Gauge fill animation** — the SR&ED arc sweeps in from empty on card mount.
2. **Section-level display mode toggle** — a pill toggle in the staff section header lets the user switch between showing SR&ED values, Unclaimed values, or Both in the gauge center. The gauge arc proportion (SR&ED ÷ total) is unchanged by the toggle; only the center label text changes.

---

## New Type

Add `StaffDisplayMode` to `src/app/features/dashboard/models/chart-data.model.ts`:

```ts
export type StaffDisplayMode = 'sred' | 'unclaimed' | 'both';
```

---

## Gauge Animation

### CSS

A new `staff-employee-card.scss` file is added alongside the existing `.ts` and `.html`:

```scss
@keyframes gauge-fill {
  from { stroke-dasharray: 0 113; }
  to   { stroke-dasharray: var(--target-dash, 85) 113; }
}

.gauge-arc-animated {
  stroke-dasharray: 0 113; /* start empty */
  animation: gauge-fill 900ms cubic-bezier(0.4, 0, 0.2, 1) 200ms forwards;
}
```

The `@Component` decorator references it via `styleUrl: './staff-employee-card.scss'`.

### Template change

The SR&ED arc `<path>` gets `class="gauge-arc-animated"` and a CSS custom property binding:

```html
<path
  class="gauge-arc-animated"
  [style.--target-dash]="sreddash()"
  d="M4,44 A36,36 0 0,1 76,44"
  [attr.stroke]="entry().color"
  stroke-width="8"
  fill="none"
  stroke-linecap="round" />
```

Note: the `[attr.stroke-dasharray]` binding is removed from the SR&ED arc because the animation now owns that property via `@keyframes`.

The animation plays once when the component mounts. Re-mounting (e.g., navigating away and back) replays it naturally.

---

## Display Mode Toggle

### StaffSectionComponent

Adds internal signal state — no input needed since this is section-local state:

```ts
readonly displayMode = signal<StaffDisplayMode>('sred');

setDisplayMode(m: StaffDisplayMode): void {
  this.displayMode.set(m);
}
```

Passes `[displayMode]` down to each card:

```html
<app-staff-employee-card
  [entry]="entry"
  [mode]="mode()"
  [displayMode]="displayMode()"
  (viewDetails)="employeeClick.emit(entry.employeeId)" />
```

Toggle pill in the section header (next to the title):

```html
<div class="flex items-center gap-1.5 flex-wrap">
  <!-- existing title + icon -->
  <div class="ml-auto flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
    @for (opt of displayModeOptions; track opt.value) {
      <button
        type="button"
        class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
        [class.bg-white]="displayMode() === opt.value"
        [class.shadow-sm]="displayMode() === opt.value"
        [class.text-gray-900]="displayMode() === opt.value"
        [class.text-gray-500]="displayMode() !== opt.value"
        (click)="setDisplayMode(opt.value)">
        {{ opt.label }}
      </button>
    }
  </div>
</div>
```

`displayModeOptions` is a static readonly array on the component:

```ts
readonly displayModeOptions: readonly { value: StaffDisplayMode; label: string }[] = [
  { value: 'sred', label: 'SR&ED' },
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'both', label: 'Both' },
];
```

### StaffEmployeeCardComponent

New input:

```ts
readonly displayMode = input<StaffDisplayMode>('both');
```

New computed signals:

```ts
readonly centerValue = computed(() => {
  const dm = this.displayMode();
  if (dm === 'unclaimed') {
    return this.mode() === 'hours'
      ? Math.round(this.entry().unclaimedValue).toLocaleString('en-CA')
      : CAD_FORMATTER.format(this.entry().unclaimedValue);
  }
  return this.sredDisplay();
});

readonly centerLabel = computed(() => {
  const dm = this.displayMode();
  if (dm === 'unclaimed') {
    return this.mode() === 'hours' ? 'unclaimed hrs' : 'unclaimed $';
  }
  return this.gaugeLabel();
});

readonly showUnclaimedSubLabel = computed(() =>
  this.displayMode() !== 'unclaimed' && this.mode() !== 'credits'
);
```

In the template, replace the hard-coded center text:

```html
<text x="40" y="35" text-anchor="middle" font-size="12" font-weight="700" fill="#111827">{{ centerValue() }}</text>
<text x="40" y="45" text-anchor="middle" font-size="6" fill="#9ca3af">{{ centerLabel() }}</text>
```

And update the unclaimed sub-label condition:

```html
@if (showUnclaimedSubLabel()) {
  <p class="text-xs text-gray-400 self-start">{{ unclaimedDisplay() }}</p>
}
```

---

## Behavior Summary

| Toggle | Gauge arc | Center value | Center label | Sub-label |
|--------|-----------|-------------|--------------|-----------|
| SR&ED  | SR&ED fraction (unchanged) | SR&ED amount | "SR&ED hrs" / "SR&ED $" | unclaimed amount shown |
| Unclaimed | SR&ED fraction (unchanged) | Unclaimed amount | "unclaimed hrs" / "unclaimed $" | hidden |
| Both | SR&ED fraction (unchanged) | SR&ED amount | "SR&ED hrs" / "SR&ED $" | unclaimed amount shown |

Default toggle state: `'sred'`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/features/dashboard/models/chart-data.model.ts` | Add `StaffDisplayMode` type |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts` | Add `displayMode` input + 3 new computeds |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html` | Animate arc, update center text, update sub-label condition |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.scss` | New — gauge animation keyframes |
| `src/app/features/dashboard/components/staff-section/staff-section.ts` | Add `displayMode` signal + `displayModeOptions` + `setDisplayMode()` |
| `src/app/features/dashboard/components/staff-section/staff-section.html` | Add toggle pill to header, pass `[displayMode]` to cards |
