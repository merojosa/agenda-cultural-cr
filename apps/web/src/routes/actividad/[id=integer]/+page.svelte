<script lang="ts">
	import { Calendar, Link2, Theater } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';
	import { PUBLIC_OG_URL } from '$env/static/public';
	import { page } from '$app/stores';

	export let data: PageData;

	function getFormattedDatetime(date: Date, time: string | null) {
		let newDate = DateTime.fromJSDate(date, { zone: 'utc' });

		if (time) {
			const [hours, minutes] = time.split(':');

			newDate = newDate.plus({ hours: Number(hours), minutes: Number(minutes) });
		}

		const luxonFormat = newDate.toFormat("cccc dd 'de' LLLL, hh:mm a", { locale: 'es-ES' });
		return luxonFormat.charAt(0).toUpperCase() + luxonFormat.slice(1);
	}
</script>

<svelte:head>
	<title>Agenda Cultural CR | {data.activity.title}</title>
	<meta property="og:title" content={data.activity.title} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={`${PUBLIC_OG_URL}?title=${data.activity.title}`} />
	<meta property="og:url" content={$page.url.href} />
</svelte:head>

<article
	class="grid grid-rows-[auto_auto_auto] gap-y-8 md:grid-cols-[1fr_1.5fr] md:grid-rows-none md:gap-x-8 md:gap-y-16"
>
	{#if data.activity.imageUrl}
		<img
			class="justify-self-center object-contain"
			src={data.activity.imageUrl}
			alt={`Portada de ${data.activity.title}`}
		/>
	{/if}

	<div class={cn('flex', 'flex-col', 'gap-8', !data.activity.imageUrl && 'col-span-2')}>
		<h2 class="text-3xl font-bold leading-tight">{data.activity.title}</h2>
		<ul class="flex flex-col gap-8">
			<li class="flex flex-row items-center gap-2 text-xl">
				<Theater class="h-10 w-10" />
				{data.activity.locationName}
			</li>
			<li class="flex flex-row items-center gap-2 text-xl">
				<Calendar class="h-10 w-10" />
				{getFormattedDatetime(data.activity.date, data.activity.time)}
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
	<Card.Root class={cn('w-fit', 'p-4', data.activity.imageUrl ? 'md:col-span-2' : 'col-span-2')}>
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
