
const CACHE_NAME = 'devonn-agent-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle background sync for voice commands
self.addEventListener('sync', event => {
  if (event.tag === 'voice-command-sync') {
    event.waitUntil(syncVoiceCommands());
  }
});

async function syncVoiceCommands() {
  try {
    const commands = await getStoredCommands();
    for (const command of commands) {
      await sendCommandToServer(command);
    }
    await clearStoredCommands();
  } catch (error) {
    console.error('Failed to sync voice commands:', error);
  }
}

async function getStoredCommands() {
  // Get commands from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem('offline_commands') || '[]');
}

async function sendCommandToServer(command) {
  await fetch('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
}

async function clearStoredCommands() {
  localStorage.removeItem('offline_commands');
}
