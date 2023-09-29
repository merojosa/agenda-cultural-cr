<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="grid grid-cols-2">
	<img src={data.activity.imageUrl} alt={`Portada de ${data.activity.title}`} />

	<div class="flex flex-col gap-8">
		<h1 class="text-4xl font-extrabold">{data.activity.title}</h1>
		<p>{data.activity.description}</p>
		<div />
	</div>
</article>
