<script>
	import { Navbar, MobileNavbar } from '$lib/components/navbar';
	import { Button } from '$lib/components/ui/button';
	import '../app.css';
</script>

<div
	class="app bg-surface grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] [&>*]:w-screen [&>*]:max-w-full"
>
	<header class="2xl:mx-auto [&>*]:mx-[10vw] 2xl:[&>*]:mx-auto 2xl:[&>*]:w-[70rem]">
		<Navbar />
		<MobileNavbar />
	</header>

	<main
		class="pb-10 pt-4 lg:pb-24 2xl:mx-auto [&>*]:mx-[10vw] 2xl:[&>*]:mx-auto 2xl:[&>*]:w-[70rem]"
	>
		<slot />
	</main>

	<footer class="flex justify-center bg-black py-6">
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
