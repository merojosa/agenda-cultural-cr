<script lang="ts">
	import { Button } from '../ui/button';
	import { Menu } from 'lucide-svelte';
	import { HEADER_LINKS } from './links';
</script>

<nav class="flex flex-wrap items-center gap-4 py-8 md:hidden">
	<div class="flex-1">
		<Button variant="link" class="text-foreground p-0 text-2xl font-medium" href="/">
			<h1>Agenda Cultural CR</h1>
		</Button>
	</div>

	<label class="h-10 w-10" for="open-nav">
		<Menu class="h-full w-full" />
	</label>
	<input class="peer hidden" id="open-nav" type="checkbox" />
	<ul class="hidden basis-full flex-col gap-1 peer-checked:flex">
		{#each HEADER_LINKS as link}
			<li>
				<Button variant="link" href={link.url} class="text-foreground p-0 text-lg">
					{link.label}
				</Button>
			</li>
		{/each}
	</ul>
</nav>
