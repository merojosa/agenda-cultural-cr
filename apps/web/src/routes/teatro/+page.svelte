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
	<title>Agenda Cultural CR - Teatro🎭</title>
	<meta name="description" content="Cartelera de teatro para Costa Rica" />
</svelte:head>

<section class="content-container">
	<h2>Teatro 🎭</h2>

	{#each data.activities as activity}
		<article>
			<img src={activity.imageUrl} alt={`Portada de ${activity.title}`} />
			<div class="card-body">
				<h3>{activity.title}</h3>
				<p>{formatDescription(activity.description)}</p>
				<time datetime={activity.datetime.toISOString()}>{formatDatetime(activity.datetime)}</time>
				<a target="_blank" href={activity.activityUrl}>Sitio oficial</a>
			</div>
		</article>
	{/each}
</section>

<style>
	.content-container {
		display: grid;
		gap: 3rem;
	}

	.content-container > h2 {
		grid-column: 1 / span 3;
	}

	article {
		display: flex;
		flex-direction: column;
		height: 40rem;
		border-style: solid;
		border-color: black;
		border-width: 1px;
		position: relative;
	}

	article > img {
		width: 100%;
		height: 50%;
		object-fit: cover;
	}

	article > .card-body {
		height: 50%;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

	article > .card-body > h3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 0;
	}

	article > .card-body > p {
		display: -webkit-box;
		-webkit-line-clamp: 10; /* Adjust the number of lines as needed */
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	article > .card-body > time {
		position: absolute;
		right: -22px;
		top: -21px;
		background-color: black;
		color: white;
		padding: 0.8rem 1rem;
		border-radius: 3px;
	}

	article > .card-body > a {
		margin-top: auto;
		text-align: center;
	}
</style>
