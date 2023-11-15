<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { DateTime } from 'luxon';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';

	export let data: PageData;

	function getISOString(date: Date, time: string | null) {
		if (time) {
			const [hours, minutes] = time.split(':');
			return DateTime.fromJSDate(date, { zone: 'utc' })
				.plus({ hours: Number(hours), minutes: Number(minutes) })
				.toISO();
		}

		return DateTime.fromJSDate(date, { zone: 'utc' }).toISODate();
	}

	function formatDatetime(date: Date, time: string | null) {
		if (time) {
			const [hours, minutes] = time.split(':');
			return DateTime.fromJSDate(date, { zone: 'utc' })
				.plus({ hours: Number(hours), minutes: Number(minutes) })
				.toFormat('ccc dd LLL hh:mm a', { locale: 'es-ES' })
				.toUpperCase();
		}

		return DateTime.fromJSDate(date, { zone: 'utc' })
			.toFormat('ccc dd LLL', { locale: 'es-ES' })
			.toUpperCase();
	}

	function formatDescription(description: string | null) {
		return description?.replace(/\s+/g, ' ');
	}

	function isImageAboveTheFold(index: number) {
		return index <= 9;
	}
</script>

<svelte:head>
	<title>Agenda Cultural CR</title>
	<meta name="description" content="Cartelera de eventos culturales en Costa Rica" />
</svelte:head>

<section class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.events as event, index}
		<Card.Root tag="article" class="relative flex h-[28rem] flex-col justify-center">
			{#if event.imageUrl}
				<a class="h-1/2 w-full hover:opacity-90 focus:opacity-75" href={`/evento/${event.id}`}>
					<img
						class="h-full w-full rounded-se-lg rounded-ss-lg object-cover"
						src={event.imageUrl}
						alt={`Portada de ${event.title}`}
						loading={isImageAboveTheFold(index) ? 'eager' : 'lazy'}
						decoding={isImageAboveTheFold(index) ? 'auto' : 'async'}
					/>
					<time
						class="bg-foreground absolute left-0 right-0 top-[-21px] mx-auto w-fit rounded-sm p-3 text-black lg:left-auto lg:right-[-22px]"
						datetime={getISOString(event.date, event.time)}
						>{formatDatetime(event.date, event.time)}</time
					>
				</a>
			{:else}
				<time
					class="bg-foreground absolute left-0 right-0 top-[-21px] mx-auto w-fit rounded-sm p-3 text-black lg:left-auto lg:right-[-22px]"
					datetime={getISOString(event.date, event.time)}
					>{formatDatetime(event.date, event.time)}</time
				>
			{/if}

			<Card.Content
				class={cn(
					event.imageUrl ? 'h-1/2' : 'h-full',
					!event.imageUrl && 'justify-center',
					'flex',
					'flex-col',
					'gap-3',
					'p-4'
				)}
			>
				<Button
					href={`/evento/${event.id}`}
					variant="link"
					class="text-foreground hover:text-primary h-fit w-fit justify-start whitespace-normal p-0 transition-none"
				>
					<Card.Title
						class={cn(
							event.title.length > 35 ? 'line-clamp-2' : 'line-clamp-1',
							!event.imageUrl && 'line-clamp-6',
							'leading-normal'
						)}
						tag="h2">{event.title}</Card.Title
					>
				</Button>

				<Card.Description
					class={cn(
						event.title.length > 35 ? 'line-clamp-6' : 'line-clamp-[7]',
						!event.imageUrl && 'line-clamp-[10]',
						'leading-normal',
						'text-ellipsis'
					)}>{formatDescription(event.description)}</Card.Description
				>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
