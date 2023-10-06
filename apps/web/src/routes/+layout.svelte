<script>
	import '../app.css';
</script>

<div
	class="app bg-surface grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] overflow-x-hidden"
>
	<header class="flex w-screen justify-center">
		<h1>Agenda Cultural CR</h1>
	</header>

	<main class="mx-auto my-8 w-[75rem]">
		<slot />
	</main>

	<footer class="flex justify-center">
		<p>Creado por Jose Andrés</p>
	</footer>
</div>

<style>
	.app {
		grid-template-areas: 'header' 'main' 'footer';
	}

	header {
		grid-area: header;
	}

	main {
		grid-area: main;
	}

	footer {
		grid-area: footer;
	}
</style>
