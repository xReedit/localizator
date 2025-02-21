<script lang="ts">
    import { onMount } from 'svelte';
    import { orderCode } from '$lib/stores/orderStore';
    import { generateOrderCode } from '$lib/utils/codeGenerator';

    let mounted = false;

    onMount(() => {
        mounted = true;
        if (!$orderCode) {
            const newCode = generateOrderCode();
            orderCode.setCode(newCode);
        }
    });
</script>

{#if mounted}
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Localizador de Pedidos</h1>
        
        {#if $orderCode}
            <div class="bg-green-100 p-4 rounded-lg">
                <h2 class="text-xl mb-2">Tu código de pedido es:</h2>
                <p class="text-3xl font-bold text-center">{$orderCode}</p>
            </div>
        {:else}
            <p>Generando código...</p>
        {/if}

        <!-- <button 
            class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            on:click={() => {
                const newCode = generateOrderCode();
                orderCode.setCode(newCode);
            }}
        >
            Generar nuevo código
        </button> -->
    </div>
{/if}
