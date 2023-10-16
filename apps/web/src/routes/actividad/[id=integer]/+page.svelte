<script lang="ts">
	import { Calendar, MapPin, Link2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';

	export let data: PageData;

	function capitalizeFirstLetter(text: string) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
</script>

<article
	class="grid grid-rows-[50vh_auto_auto] gap-y-10 md:grid-cols-[1fr_1.5fr] md:grid-rows-none md:gap-x-8 md:gap-y-16"
>
	<img
		class="h-full justify-self-center object-contain md:h-auto md:w-full"
		src={data.activity.imageUrl}
		alt={`Portada de ${data.activity.title}`}
	/>

	<div class="flex flex-col gap-8">
		<h2 class="text-3xl font-bold leading-tight">{data.activity.title}</h2>
		<ul class="flex flex-col gap-8">
			<li class="flex flex-row items-center gap-2 text-xl">
				<MapPin class="h-10 w-10" />
				{data.activity.locationName}
			</li>
			<li class="flex flex-row items-center gap-2 text-xl">
				<Calendar class="h-10 w-10" />
				{capitalizeFirstLetter(
					DateTime.fromJSDate(data.activity.datetime, { zone: 'uct' }).toFormat(
						"cccc LL 'de' LLLL, hh:mm a",
						{ locale: 'es-ES' }
					)
				)}
			</li>
			<li class="flex flex-row items-center gap-2">
				<Link2 class="h-10 w-10" />
				<Button class="p-0 text-xl" variant="link" href={data.activity.activityUrl} target="_blank">
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
	<Card.Root class="w-fit p-4 md:col-span-2">
		<Card.Description class="col-start-2 col-end-auto text-lg">
			Recordá visitar el sitio oficial para validar la información y comprar/conseguir las entradas.
			Si querés saber cómo recolectamos la información de los eventos, hacé clic <Button
				class="p-0 text-lg font-bold"
				href="/recoleccion"
				variant="link"
				target="_blank">aquí.</Button
			>
		</Card.Description>
	</Card.Root>
</article>
