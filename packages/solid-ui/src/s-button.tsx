/* eslint-disable react/no-unknown-property */
import type { JSX } from 'solid-js';
import { mergeProps, splitProps } from 'solid-js';

export type SButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
};

export function SButton(allProps: SButtonProps) {
  const props = mergeProps({ variant: 'primary' as const }, allProps);
  const [local, rest] = splitProps(props, ['variant', 'class', 'children']);

  const BASE =
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2';
  const variants: Record<NonNullable<SButtonProps['variant']>, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const classes = `${BASE} ${variants[local.variant ?? 'primary']} ${local.class ?? ''}`.trim();

  return (
    <button class={classes} {...rest}>
      {local.children}
    </button>
  );
}
