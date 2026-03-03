export { cn } from './utils/cn';

// Type utilities for shadcn-svelte components
export type WithElementRef<T, E extends Element = Element> = T & {
	ref?: E | null;
};

export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;
