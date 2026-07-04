'use client';

import { useEffect, useState } from 'react';

type PushState = 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported';

/**
 * Hook que:
 * 1. Registra o service worker (sw.js)
 * 2. Busca a chave pública VAPID da API
 * 3. Solicita permissão ao usuário
 * 4. Salva a PushSubscription no banco via /api/push/subscribe
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushState>('idle');

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    setState('loading');

    try {
      // 1. Registra (ou reutiliza) o service worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Verifica permissão atual
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      // 3. Busca chave pública VAPID
      const keyRes = await fetch('/api/push/subscribe');
      if (!keyRes.ok) {
        setState('idle');
        return;
      }
      const { publicKey } = await keyRes.json();

      // 4. Subscreve no Push Manager do browser
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Salva no banco
      const subJson = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: subJson.keys,
        }),
      });

      setState('subscribed');
    } catch (err) {
      console.error('[push] subscribe error:', err);
      setState('idle');
    }
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return;

    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    // Remove do banco
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setState('idle');
  }

  // Detecta estado inicial sem pedir permissão
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setState('subscribed');
      })
      .catch(() => {});
  }, []);

  return { state, subscribe, unsubscribe };
}

// Converte a chave VAPID base64url para Uint8Array (exigido pelo browser)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
