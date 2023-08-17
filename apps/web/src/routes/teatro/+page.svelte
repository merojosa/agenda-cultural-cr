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
</script>

<svelte:head>
	<title>Agenda Cultural CR - Teatro🎭</title>
	<meta name="description" content="Cartelera de teatro para Costa Rica" />
</svelte:head>

<section class="content-container">
	<h2>Teatro 🎭</h2>

	{#each data.mockData as mockData}
		<article>
			<img src={mockData.image} alt="Testing" />
			<div class="card-body">
				<h3>{mockData.name}</h3>
				<p>{mockData.description}</p>
				<time datetime={mockData.date.toISOString()}>{formatDatetime(mockData.date)}</time>
				<button>Sitio oficial</button>
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
		flex: 1.5;
		width: 100%;
		object-fit: cover;
	}

	article > .card-body {
		padding: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	article > .card-body > h3 {
		margin: 0;
	}

	article > .card-body > p {
		flex: 1;
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
</style>
