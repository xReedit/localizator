<script lang="ts">
    import { onMount } from 'svelte';
    import { orderCode } from '$lib/stores/orderStore';
    import { generateOrderCode } from '$lib/utils/codeGenerator';
    import { requestNotificationPermission, subscribeUserToPush } from '$lib/utils/notificationHelper';

    let mounted = false;
    let notificationsEnabled = false;
    let setupError = '';

    async function setupNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setupError = 'Tu navegador no soporta notificaciones push';
            return;
        }

        try {
            const swRegistration = await navigator.serviceWorker.register('/sw.js');
            const permissionGranted = await requestNotificationPermission();
            
            if (permissionGranted) {
                const subscription = await subscribeUserToPush();
                if (subscription) {
                    notificationsEnabled = true;
                    setupError = '';

                    // Enviar la suscripción al servidor
                    const response = await fetch(`${import.meta.env.VITE_URL_API_RESTOBAR}/subscribe`, {
                        method: 'POST',
                        body: JSON.stringify({
                            orderCode: $orderCode,
                            subscription: subscription
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al registrar la suscripción');
                    }
                }
            } else {
                setupError = 'Necesitamos tu permiso para enviar notificaciones';
            }
        } catch (error) {
            console.error('Error:', error);
            setupError = 'Error al configurar las notificaciones';
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
                    <p class="mt-2 text-green-600 text-center">
                        ✓ Recibirás una notificación cuando tu pedido esté listo
                    </p>
                {:else}
                    {#if setupError}
                        <p class="mt-2 text-red-600 text-center">{setupError}</p>
                    {/if}
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
