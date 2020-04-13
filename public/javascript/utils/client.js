const publicVapidKey = 'BEUKKprV93HSM_kvIvKn9-XGbz8ioi1idf02Ta27LRKfJ0KUTfuvx0gikP-PtabmhLLQJWp398exTepv4BXyyKw';

if('serviceWorker' in navigator){
    send().catch(err => console.error(err))
}

async function send(){
    console.log('Registering service worker...')
    const register = await navigator.serviceWorker.register('/javascript/utils/worker.js',{
        scope:'/'
    });

    console.log('Service Worker registered');

    console.log('Registering push ...')
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly : true,
        applicationServerKey : urlBase64ToUint8Array(public)
    });
    console.log('Push registered...');

    console.log('Sending Push...');
    await fetch('/subscribe',{
        method:'post',
        body:JSON.stringify(subscription),
        headers:{
            'content-type':'application/json'
        }
    });
    console.log('Push sent...');
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
   
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
   
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}