import type { JSX } from 'preact/jsx-runtime';

export type PButtonProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
};

const BASE =
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2';
const VARIANTS: Record<NonNullable<PButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

export function PButton({ variant = 'primary', className, children, ...rest }: PButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className ?? ''}`.trim();
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
