<script lang="ts">
	import { Calendar, Link2, Theater, Mail } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import Button from '$lib/components/ui/button/button.svelte';
	import { page } from '$app/stores';
	import WhatsAppIcon from '$lib/icons/whatsapp.svg?raw';
	import FacebookIcon from '$lib/icons/facebook.svg?raw';
	import TelegramIcon from '$lib/icons/telegram.svg?raw';
	import TwitterIcon from '$lib/icons/twitter.svg?raw';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	export let data: PageData;

	function upperCaseFirstLetter(text: string) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	function getFormattedDatetime(date: Date, time: string | null) {
		if (time) {
			const [hours, minutes] = time.split(':');

			return upperCaseFirstLetter(
				DateTime.fromJSDate(date, { zone: 'utc' })
					.plus({ hours: Number(hours), minutes: Number(minutes) })
					.toFormat("cccc dd 'de' LLLL, hh:mm a", { locale: 'es-ES' })
			);
		}

		return upperCaseFirstLetter(
			DateTime.fromJSDate(date, { zone: 'utc' }).toFormat("cccc dd 'de' LLLL", {
				locale: 'es-ES',
			})
		);
	}
</script>

<svelte:head>
	<title>Agenda Cultural CR | {data.event.title}</title>
	<meta property="og:title" content={data.event.title} />
	<meta property="og:type" content="article" />
	<meta
		property="og:image"
		content={`${import.meta.env.VITE_APP_OG_URL}?title=${data.event.title}`}
	/>
	<meta property="og:url" content={$page.url.href} />
</svelte:head>

<article class="flex flex-col gap-10">
	<div class="flex flex-row gap-5">
		<div class="sticky top-3 flex flex-1 flex-col gap-8 self-start overflow-auto">
			<h2 class="text-2xl font-bold leading-tight">{data.event.title}</h2>
			<ul class="flex flex-col gap-8">
				<li class="flex flex-row items-center gap-2 text-xl">
					<Theater class="h-10 w-10" />
					{data.event.locationName}
				</li>
				<li class="flex flex-row items-center gap-2 text-xl">
					<Calendar class="h-10 w-10" />
					{getFormattedDatetime(data.event.date, data.event.time)}
				</li>
				<li class="flex flex-row items-center gap-2">
					<Link2 class="h-10 w-10" />
					<Button class="p-0 text-xl" variant="link" href={data.event.eventUrl} target="_blank">
						Sitio oficial
					</Button>
				</li>
			</ul>

			<Separator />

			<div class="flex flex-col gap-6">
				<ul class="flex flex-row items-center justify-evenly">
					<li class="fill-foreground [&>*>svg]:h-12">
						<a
							href={`https://web.whatsapp.com/send?text=${$page.url.href}`}
							data-action="share/whatsapp/share"
							target="_blank"
							>{@html WhatsAppIcon}
						</a>
					</li>
					<li class="fill-foreground [&>*>svg]:h-12">
						<a href={`https://twitter.com/intent/tweet?text=${$page.url.href}`} target="_blank">
							{@html TwitterIcon}
						</a>
					</li>
					<li class="fill-foreground [&>*>svg]:h-12">
						<a
							href={`https://www.facebook.com/sharer/sharer.php?u=${$page.url.href}`}
							target="_blank"
						>
							{@html FacebookIcon}
						</a>
					</li>
					<li class="fill-foreground [&>*>svg]:h-12">
						<a href={`https://t.me/share/url?url=${$page.url.href}`} target="_blank">
							{@html TelegramIcon}
						</a>
					</li>
					<li class="[&>*>*]:h-12 [&>*>*]:w-12">
						<a href={`mailto:?body=${$page.url.href}`} target="_blank"> <Mail /> </a>
					</li>
				</ul>

				<p class="text-lg">
					Recordá visitar el sitio oficial para validar la información y comprar/conseguir las
					entradas. Si querés saber cómo recolectamos la información de los eventos, hacé clic <Button
						class="h-fit p-0 text-lg font-bold"
						href="/recoleccion"
						variant="link"
						target="_blank">aquí.</Button
					>
				</p>
			</div>
		</div>
		{#if data.event.imageUrl}
			<div class="flex flex-1 flex-col gap-6">
				<img
					class="justify-self-center object-contain"
					src={data.event.imageUrl}
					alt={`Portada de ${data.event.title}`}
				/>
				<div class="flex flex-col gap-4">
					{#each data.event.description?.split('\n') || [] as paragraph}
						{#if paragraph.trim().length > 0}
							<p>{paragraph.trim()}</p>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
</article>
