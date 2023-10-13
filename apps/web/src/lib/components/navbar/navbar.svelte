<script>
	import { Button } from '../ui/button';
	import { HEADER_LINKS } from './links';
</script>

<nav class="mx-auto hidden items-center px-10 py-8 md:flex xl:w-[75rem] xl:px-0">
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
