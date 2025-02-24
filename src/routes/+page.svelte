<script lang="ts">
    import { onMount } from 'svelte';
    import { orderCode } from '$lib/stores/orderStore';
    import { generateOrderCode } from '$lib/utils/codeGenerator';
    import { checkNotificationPermission, requestNotificationPermission, subscribeUserToPush } from '$lib/utils/notificationHelper';

    let mounted = false;
    let notificationsEnabled = false;
    let setupError = '';
    let suscripcionString = '';

    async function setupNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setupError = 'Tu navegador no soporta notificaciones push';
            return;
        }

        try {
            // Registrar el service worker si no está registrado
            let swRegistration;
            const existingRegistration = await navigator.serviceWorker.getRegistration();
            
            if (!existingRegistration) {
                swRegistration = await navigator.serviceWorker.register('/sw.js');
            } else {
                swRegistration = existingRegistration;
            }

            // Verificar o solicitar permisos
            const hasPermission = await checkNotificationPermission();
            const permissionGranted = hasPermission || await requestNotificationPermission();
            
            if (permissionGranted) {
                const subscription = await subscribeUserToPush();
                if (subscription) {
                    notificationsEnabled = true;
                    setupError = '';
                    suscripcionString = JSON.stringify(subscription);
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
        
        // Verificar estado inicial de notificaciones
        const hasPermission = await checkNotificationPermission();
        if (hasPermission) {
            await setupNotifications();
        }
    });

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(suscripcionString);
            alert('Copiado al portapapeles!');
        } catch (err) {
            console.error('Error al copiar:', err);
            alert('Error al copiar al portapapeles');
        }
    }
</script>

{#if mounted}
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Localizador de Pedidos b6</h1>
        
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
            <div class="mt-4">
    <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl">Suscripción:</h2>
        <button 
            class="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            on:click={copyToClipboard}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
            </svg>
            Copiar
        </button>
    </div>
    <pre class="bg-gray-100 p-2 rounded-lg overflow-auto">{suscripcionString}</pre>
</div>
        {:else}
            <p>Generando código...</p>
        {/if}
    </div>
{/if}
