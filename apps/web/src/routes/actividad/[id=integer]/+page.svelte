<script lang="ts">
	import { Calendar, MapPin, Link2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import Button from '$lib/components/ui/button/button.svelte';

	export let data: PageData;

	function capitalizeFirstLetter(text: string) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
</script>

<article class="grid grid-cols-[40%_60%] gap-8">
	<img class="w-full" src={data.activity.imageUrl} alt={`Portada de ${data.activity.title}`} />

	<div class="flex flex-col gap-8">
		<h1 class="text-4xl font-extrabold leading-tight">{data.activity.title}</h1>
		<ul class="flex flex-col gap-8">
			<li class="flex flex-row gap-2 items-center text-xl">
				<MapPin class="w-10 h-10" />
				{data.activity.locationName}
			</li>
			<li class="flex flex-row gap-2 items-center text-xl">
				<Calendar class="w-10 h-10" />
				{capitalizeFirstLetter(
					DateTime.fromJSDate(data.activity.datetime, { zone: 'uct' }).toFormat(
						"cccc LL 'de' LLLL, hh:mm a",
						{ locale: 'es-ES' }
					)
				)}
			</li>
			<li class="flex flex-row gap-2 items-center">
				<Link2 class="w-10 h-10" />
				<Button class="text-xl p-0" variant="link" href={data.activity.activityUrl} target="_blank">
					Sitio oficial
				</Button>
			</li>
			<div class="flex flex-col gap-4">
				{#each data.activity.description?.split('\n') || [] as paragraph}
					{#if paragraph.trim().length > 0}
						<p>{paragraph.trim()}</p>
					{/if}
				{/each}
			</div>
		</ul>
	</div>
</article>
