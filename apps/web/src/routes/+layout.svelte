<script>
	import { Button } from '$lib/components/ui/button';
	import '../app.css';
</script>

<div
	class="app bg-surface grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] overflow-x-hidden"
>
	<header class="flex w-screen justify-center py-10">
		<Button variant="link" class="text-foreground w-fit p-0 text-3xl font-medium" href="/">
			<h1>Agenda Cultural CR</h1>
		</Button>
	</header>

	<main class="mx-auto w-[75rem] pb-24 pt-8">
		<slot />
	</main>

	<footer class="flex justify-center border-t py-6">
		<p>
			Creado con ❤️ por <Button
				href="https://github.com/merojosa/"
				target="_blank"
				variant="link"
				class="w-fit p-0 text-base">Jose Andrés</Button
			>
		</p>
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
