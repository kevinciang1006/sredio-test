import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

const BG_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts.length || !parts[0]) return '?';
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % BG_COLORS.length;
}

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<AvatarSize>('md');

  readonly initials = computed(() => initials(this.name()));
  readonly hostClass = computed(
    () => `inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${SIZE_CLASSES[this.size()]} ${BG_COLORS[colorIndex(this.name())]}`
  );
}
