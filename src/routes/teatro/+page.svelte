<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
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
			<h3>{mockData.name}</h3>
			<p>{mockData.description}</p>
		</article>
	{/each}
</section>

<style>
	.content-container {
		display: grid;
		gap: 2rem;
	}

	.content-container > h2 {
		grid-column: 1 / span 3;
	}

	article {
		display: flex;
		flex-direction: column;
	}

	img {
		width: 100%;
		height: 25rem;
		object-fit: cover;
	}
</style>
