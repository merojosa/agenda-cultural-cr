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
		<Card.Root tag="article" class="relative flex flex-col h-[40rem]">
			<!-- <Card.Header>
		
			</Card.Header> -->
			<img
				class="w-full h-1/2 object-cover rounded-ss-lg rounded-se-lg"
				src={activity.imageUrl}
				alt={`Portada de ${activity.title}`}
			/>
			<Card.Content class="h-1/2 p-4 flex flex-col gap-3">
				<Card.Title class="line-clamp-3" tag="h3">{activity.title}</Card.Title>

				<Card.Description class="line-clamp-[8]"
					>{formatDescription(activity.description)}</Card.Description
				>

				<time
					class="absolute right-[-22px] top-[-21px] bg-secondary text-black p-3 rounded-sm"
					datetime={activity.datetime.toISOString()}>{formatDatetime(activity.datetime)}</time
				>
				<a class="mt-auto text-center" target="_blank" href={activity.activityUrl}>Sitio oficial</a>
			</Card.Content>
			<!-- <Card.Footer>
				<p>Card Footer</p>
			</Card.Footer> -->
		</Card.Root>
	{/each}
</section>
