<script lang="ts">
    import { onMount } from 'svelte';
    import { orderCode } from '$lib/stores/orderStore';
    import { generateOrderCode } from '$lib/utils/codeGenerator';
    import { requestNotificationPermission, subscribeUserToPush } from '$lib/utils/notificationHelper';

    let mounted = false;
    let notificationsEnabled = false;

    async function setupNotifications() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                const permissionGranted = await requestNotificationPermission();
                if (permissionGranted) {
                    const subscription = await subscribeUserToPush();
                    if (subscription) {
                        notificationsEnabled = true;
                        console.log('subscription === >', subscription);
                        // Aquí deberías enviar la subscription al servidor junto con el código
                        // const response = await fetch('https://tu-servidor.com/guardar-suscripcion', {
                        //     method: 'POST',
                        //     body: JSON.stringify({
                        //         orderCode: $orderCode,
                        //         subscription: subscription
                        //     }),
                        //     headers: {
                        //         'Content-Type': 'application/json'
                        //     }
                        // });
                    }
                }
            } catch (error) {
                console.error('Error configurando notificaciones:', error);
            }
        }
    }

    onMount(async () => {
        mounted = true;
        if (!$orderCode) {
            const newCode = generateOrderCode();
            orderCode.setCode(newCode);
        }
        await setupNotifications();
    });
</script>

{#if mounted}
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Localizador de Pedidos</h1>
        
        {#if $orderCode}
            <div class="bg-green-100 p-4 rounded-lg">
                <h2 class="text-xl mb-2">Tu código de pedido es:</h2>
                <p class="text-3xl font-bold text-center">{$orderCode}</p>
                {#if notificationsEnabled}
                    <p class="mt-2 text-green-600 text-center">✓ Recibirás notificaciones cuando tu pedido esté listo</p>
                {:else}
                    <button 
                        class="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded"
                        on:click={setupNotifications}
                    >
                        Activar notificaciones
                    </button>
                {/if}
            </div>
        {:else}
            <p>Generando código...</p>
        {/if}
    </div>
{/if}
