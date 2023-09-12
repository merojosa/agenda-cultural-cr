<script lang="ts">
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
		<article class="relative flex flex-col h-[40rem] border border-black">
			<img
				class="w-full h-1/2 object-cover"
				src={activity.imageUrl}
				alt={`Portada de ${activity.title}`}
			/>
			<div class="h-1/2 p-4 flex flex-col">
				<h3 class="line-clamp-3">{activity.title}</h3>
				<p class="line-clamp-[8]">{formatDescription(activity.description)}</p>
				<time
					class="absolute right-[-22px] top-[-21px] bg-black text-white p-3 border-r-4"
					datetime={activity.datetime.toISOString()}>{formatDatetime(activity.datetime)}</time
				>
				<a class="mt-auto text-center" target="_blank" href={activity.activityUrl}>Sitio oficial</a>
			</div>
		</article>
	{/each}
</section>
