<script>
	import { Button } from '../ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ChevronDownCircleIcon } from 'lucide-svelte';
	import { HEADER_LINKS } from './links';
</script>

<nav class="mx-auto flex w-screen items-center px-6 pb-8 pt-6 sm:px-8 md:hidden">
	<div class="flex-1">
		<Button variant="link" class="text-foreground p-0 text-2xl font-medium" href="/">
			<h1>Agenda Cultural CR</h1>
		</Button>
	</div>
	<Sheet.Root>
		<Sheet.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8 hover:bg-transparent">
				<ChevronDownCircleIcon class="h-full w-full" />
			</Button>
		</Sheet.Trigger>
		<Sheet.Content side="top" class="p-0">
			<ul class="flex flex-col">
				{#each HEADER_LINKS as link}
					<li>
						<Button
							variant="link"
							href={link.url}
							class="text-foreground h-full w-full rounded-none border py-10 text-xl"
						>
							{link.label}
						</Button>
					</li>
				{/each}
			</ul>
		</Sheet.Content>
	</Sheet.Root>
</nav>
