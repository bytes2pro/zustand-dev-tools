import * as React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return <SonnerToaster richColors position="top-right" {...props} />;
}

export const toast = sonnerToast;
