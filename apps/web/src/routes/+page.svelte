<script lang="ts">
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
		<Card.Root tag="article" class="relative flex flex-col h-[28rem]">
			<a class="w-full h-1/2" href={`/actividad/${activity.id}`}>
				<img
					class="w-full h-full object-cover rounded-ss-lg rounded-se-lg"
					src={activity.imageUrl}
					alt={`Portada de ${activity.title}`}
				/>
				<time
					class="absolute right-[-22px] top-[-21px] bg-secondary text-black p-3 rounded-sm"
					datetime={activity.datetime.toISOString()}>{formatDatetime(activity.datetime)}</time
				>
			</a>
			<Card.Content class="h-1/2 p-4 flex flex-col gap-3">
				<a href={`/actividad/${activity.id}`}>
					<Card.Title
						class={`${activity.title.length > 35 ? 'line-clamp-2' : 'line-clamp-1'} leading-normal`}
						tag="h2">{activity.title}</Card.Title
					>
				</a>

				<Card.Description
					class={`leading-normal ${
						activity.title.length > 35 ? 'line-clamp-6' : 'line-clamp-[7]'
					} text-ellipsis`}>{formatDescription(activity.description)}</Card.Description
				>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
