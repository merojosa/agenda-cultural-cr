<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		tag?: string;
	};

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let tag: $$Props['tag'] = 'div';
</script>

<svelte:element
	this={tag}
	class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
	{...$$restProps}
>
	<slot />
</svelte:element>
