<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDatetime(date: Date) {
		return new Intl.DateTimeFormat('es-ES', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			hour12: true,
			minute: 'numeric',
		})
			.format(date)
			.toUpperCase()
			.replaceAll(',', '');
	}

	function formatDescription(description: string | null) {
		return description?.replace(/\s+/g, ' ');
	}
</script>

<svelte:head>
	<title>Agenda Cultural CR</title>
	<meta name="description" content="Cartelera de teatro para Costa Rica" />
</svelte:head>

<section class="grid grid-cols-3 gap-12">
	{#each data.activities as activity}
		<Card.Root tag="article" class="relative flex h-[28rem] flex-col">
			<a class="h-1/2 w-full" href={`/actividad/${activity.id}`}>
				<img
					class="h-full w-full rounded-se-lg rounded-ss-lg object-cover"
					src={activity.imageUrl}
					alt={`Portada de ${activity.title}`}
				/>
				<time
					class="bg-foreground absolute right-[-22px] top-[-21px] rounded-sm p-3 text-black"
					datetime={activity.datetime.toISOString()}>{formatDatetime(activity.datetime)}</time
				>
			</a>
			<Card.Content class="flex h-1/2 flex-col gap-3 p-4">
				<Button
					href={`/actividad/${activity.id}`}
					variant="link"
					class="h-fit justify-start whitespace-normal p-0"
				>
					<Card.Title
						class={`${activity.title.length > 35 ? 'line-clamp-2' : 'line-clamp-1'} leading-normal`}
						tag="h2">{activity.title}</Card.Title
					>
				</Button>

				<Card.Description
					class={`leading-normal ${
						activity.title.length > 35 ? 'line-clamp-6' : 'line-clamp-[7]'
					} text-ellipsis`}>{formatDescription(activity.description)}</Card.Description
				>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
