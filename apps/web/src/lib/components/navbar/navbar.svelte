<script>
	import { Button } from '../ui/button';
	import { HEADER_LINKS } from './links';
</script>

<nav class="hidden items-center py-8 md:flex">
	<div class="flex-1">
		<Button variant="link" class="text-foreground p-0 text-2xl  font-medium" href="/">
			<h1>Agenda Cultural CR</h1>
		</Button>
	</div>
	<ul class="flex gap-6">
		{#each HEADER_LINKS as link}
			<li>
				<Button variant="link" href={link.url} class="text-foreground p-0 text-lg">
					{link.label}
				</Button>
			</li>
		{/each}
	</ul>
</nav>
