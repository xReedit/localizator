<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<style lang="postcss">
	:global(html) {
		font-family: "Nunito", sans-serif;
		font-optical-sizing: auto;
		font-weight: <weight>;
		font-style: normal;
		min-height: 100vh;
	}

	.footer {
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 1rem;
		text-align: center;
		background-color: #f9fafb;
		border-top: 1px solid #e5e7eb;
	}
</style>

<div class="min-h-screen pb-16">
	<slot />
</div>

<footer class="footer">
	<a href="https://papaya.com.pe" target="_blank" class="text-blue-500">papaya.com.pe</a>
</footer>
