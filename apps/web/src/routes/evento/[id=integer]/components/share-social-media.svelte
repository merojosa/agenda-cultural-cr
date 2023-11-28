<script lang="ts">
	import WhatsAppIcon from '$lib/icons/whatsapp.svg?raw';
	import FacebookIcon from '$lib/icons/facebook.svg?raw';
	import TelegramIcon from '$lib/icons/telegram.svg?raw';
	import TwitterIcon from '$lib/icons/twitter.svg?raw';
	import { Mail } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export let className: string | undefined | null = null;
	export let urlToShare: string;
</script>

<ul class={cn('flex flex-row items-center justify-evenly', className)}>
	<li class="fill-foreground [&>*>svg]:h-12">
		<a
			href={`https://web.whatsapp.com/send?text=${urlToShare}`}
			data-action="share/whatsapp/share"
			target="_blank"
			>{@html WhatsAppIcon}
		</a>
	</li>
	<li class="fill-foreground [&>*>svg]:h-12">
		<a href={`https://twitter.com/intent/tweet?text=${urlToShare}`} target="_blank">
			{@html TwitterIcon}
		</a>
	</li>
	<li class="fill-foreground [&>*>svg]:h-12">
		<a href={`https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`} target="_blank">
			{@html FacebookIcon}
		</a>
	</li>
	<li class="fill-foreground [&>*>svg]:h-12">
		<a href={`https://t.me/share/url?url=${urlToShare}`} target="_blank">
			{@html TelegramIcon}
		</a>
	</li>
	<li class="[&>*>*]:h-12 [&>*>*]:w-12">
		<a href={`mailto:?body=${urlToShare}`} target="_blank"> <Mail /> </a>
	</li>
</ul>
