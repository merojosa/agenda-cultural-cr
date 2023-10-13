<script lang="ts">
	import { Button } from '../ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ChevronDownCircleIcon } from 'lucide-svelte';
	import { HEADER_LINKS } from './links';

	let open: boolean | undefined = false;
</script>

<nav class="mx-auto flex w-screen items-center px-6 pb-8 pt-6 sm:px-8 md:hidden">
	<div class="flex-1">
		<Button variant="link" class="text-foreground p-0 text-2xl font-medium" href="/">
			<h1>Agenda Cultural CR</h1>
		</Button>
	</div>
	<Sheet.Root
		bind:open
		onOpenChange={(openParam) => {
			open = openParam;
		}}
		closeOnOutsideClick={false}
	>
		<Sheet.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8 hover:bg-transparent">
				<ChevronDownCircleIcon class="h-full w-full" />
			</Button>
		</Sheet.Trigger>
		<Sheet.Content side="top" class="h-full border-none p-0 pt-20">
			<ul class="flex flex-col">
				{#each HEADER_LINKS as link}
					<li class="rounded-none border-b py-4 text-center first:border-t">
						<Button
							variant="link"
							href={link.url}
							class="text-foreground h-full w-fit text-3xl"
							on:click={() => {
								open = false;
							}}
						>
							{link.label}
						</Button>
					</li>
				{/each}
			</ul>
		</Sheet.Content>
	</Sheet.Root>
</nav>
