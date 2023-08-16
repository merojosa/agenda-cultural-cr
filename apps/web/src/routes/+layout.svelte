<script>
</script>

<div class="app">
	<header>
		<h1>Agenda Cultural CR</h1>
	</header>

	<main>
		<slot />
	</main>

	<footer>
		<p>Creado por Jose Andrés</p>
	</footer>
</div>

<style>
	:global(body) {
		all: unset;
	}

	.app {
		all: unset;
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;
		grid-template-areas: 'header' 'main' 'footer';
		background-color: var(--primaryColor);
		font-family: 'Open Sans', sans-serif;
		overflow-x: hidden;
	}

	header {
		grid-area: header;
		width: 100vw;
		display: flex;
		justify-content: center;
	}

	main {
		width: 75rem;
		margin: 2rem auto;
	}

	footer {
		grid-area: footer;
		display: flex;
		justify-content: center;
	}
</style>
