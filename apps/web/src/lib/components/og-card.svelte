<script lang="ts">
	export let title: string | null = null;
</script>

{#if title}
	<div class="flex h-full w-full flex-col items-center justify-center bg-black text-6xl text-white">
		{title}
	</div>
{/if}
