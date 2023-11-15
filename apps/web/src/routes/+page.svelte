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
	<meta name="description" content="Cartelera de actividades culturales en Costa Rica" />
</svelte:head>

<section class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.activities as activity, index}
		<Card.Root tag="article" class="relative flex h-[28rem] flex-col justify-center">
			{#if activity.imageUrl}
				<a
					class="h-1/2 w-full hover:opacity-90 focus:opacity-75"
					href={`/actividad/${activity.id}`}
				>
					<img
						class="h-full w-full rounded-se-lg rounded-ss-lg object-cover"
						src={activity.imageUrl}
						alt={`Portada de ${activity.title}`}
						loading={isImageAboveTheFold(index) ? 'eager' : 'lazy'}
						decoding={isImageAboveTheFold(index) ? 'auto' : 'async'}
					/>
					<time
						class="bg-foreground absolute left-0 right-0 top-[-21px] mx-auto w-fit rounded-sm p-3 text-black lg:left-auto lg:right-[-22px]"
						datetime={getISOString(activity.date, activity.time)}
						>{formatDatetime(activity.date, activity.time)}</time
					>
				</a>
			{:else}
				<time
					class="bg-foreground absolute left-0 right-0 top-[-21px] mx-auto w-fit rounded-sm p-3 text-black lg:left-auto lg:right-[-22px]"
					datetime={getISOString(activity.date, activity.time)}
					>{formatDatetime(activity.date, activity.time)}</time
				>
			{/if}

			<Card.Content
				class={cn(
					activity.imageUrl ? 'h-1/2' : 'h-full',
					!activity.imageUrl && 'justify-center',
					'flex',
					'flex-col',
					'gap-3',
					'p-4'
				)}
			>
				<Button
					href={`/actividad/${activity.id}`}
					variant="link"
					class="text-foreground hover:text-primary h-fit w-fit justify-start whitespace-normal p-0 transition-none"
				>
					<Card.Title
						class={cn(
							activity.title.length > 35 ? 'line-clamp-2' : 'line-clamp-1',
							!activity.imageUrl && 'line-clamp-6',
							'leading-normal'
						)}
						tag="h2">{activity.title}</Card.Title
					>
				</Button>

				<Card.Description
					class={cn(
						activity.title.length > 35 ? 'line-clamp-6' : 'line-clamp-[7]',
						!activity.imageUrl && 'line-clamp-[10]',
						'leading-normal',
						'text-ellipsis'
					)}>{formatDescription(activity.description)}</Card.Description
				>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
