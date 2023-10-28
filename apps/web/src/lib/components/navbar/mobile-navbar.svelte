<script lang="ts">
	import { Button } from '../ui/button';
	import { EqualIcon, XIcon } from 'lucide-svelte';
	import { HEADER_LINKS } from './links';

	let checkboxToggleElement: HTMLInputElement;
	let isOpen = false;

	function closeToggle() {
		isOpen = false;
		checkboxToggleElement.checked = false;
	}
</script>

<nav class="flex flex-wrap items-center gap-4 py-8 md:hidden">
	<div class="flex-1">
		<Button
			variant="link"
			class="text-foreground p-0 text-2xl font-medium"
			href="/"
			on:click={closeToggle}
		>
			<h1>Agenda Cultural CR</h1>
		</Button>
	</div>

	<label class="h-10 w-10" for="open-nav">
		<div
			on:click={() => (isOpen = !isOpen)}
			on:keypress={() => (isOpen = !isOpen)}
			role="button"
			tabindex={0}
		>
			{#if isOpen}
				<XIcon class="h-full w-full" />
			{:else}
				<EqualIcon class="h-full w-full" />
			{/if}
		</div>
	</label>
	<input class="peer hidden" bind:this={checkboxToggleElement} id="open-nav" type="checkbox" />
	<ul class="hidden basis-full flex-col gap-1 peer-checked:flex">
		{#each HEADER_LINKS as link}
			<li>
				<Button
					variant="link"
					href={link.url}
					on:click={closeToggle}
					class="text-foreground p-0 text-lg"
				>
					{link.label}
				</Button>
			</li>
		{/each}
	</ul>
</nav>
