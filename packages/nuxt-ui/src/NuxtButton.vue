<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    class?: string;
  }>(),
  { variant: 'primary' },
);

const BASE =
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2';
const variants: Record<NonNullable<typeof props.variant>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const classes = computed(() => `${BASE} ${variants[props.variant]} ${props.class ?? ''}`.trim());
</script>

<template>
  <button :class="classes"><slot /></button>
  <!-- Wrap in <ClientOnly> in Nuxt if the child uses browser-only APIs -->
  <!-- <ClientOnly><button :style="computedStyle"><slot /></button></ClientOnly> -->
</template>
