<script>
	import { Button } from '$lib/components/ui/button';
	import '../app.css';
</script>

<div
	class="app bg-surface grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] overflow-x-hidden"
>
	<header class="mx-auto w-[75rem] py-8">
		<nav class="flex items-center">
			<div class="flex-1">
				<Button variant="link" class="text-foreground p-0 text-xl font-medium" href="/">
					<h1>Agenda Cultural CR</h1>
				</Button>
			</div>
			<ul class="flex gap-6">
				<li>
					<Button variant="link" href="/recoleccion" class="text-foreground p-0">
						Recolección de datos
					</Button>
				</li>
				<li>
					<Button variant="link" href="/acerca-accr" class="text-foreground p-0">
						Acerca de la agenda
					</Button>
				</li>
			</ul>
		</nav>
	</header>

	<main class="mx-auto w-[75rem] pb-24 pt-4">
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
