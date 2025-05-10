// Prayer Times Service Worker
// Handles background notifications for prayer times even when browser is closed

const CACHE_NAME = 'emomin-cache-v1';
const OFFLINE_URL = '/prayer-times';

// Cache essential resources during installation
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        OFFLINE_URL,
        '/static/js/prayer_time.js',
        '/static/js/prayer_reminders.js',
        '/static/css/style.css'
      ]);
    }).then(() => {
      console.log('Service Worker: Installation Complete');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation Complete');
      return self.clients.claim();
    })
  );
});

// Listen for messages from the main page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_PRAYERS') {
    // Store prayer times and reminders in service worker
    const { prayerTimes, reminderSettings } = event.data;
    
    // Clear existing scheduled notifications
    if (self.scheduledNotifications) {
      self.scheduledNotifications.forEach(timeout => clearTimeout(timeout));
    }
    
    self.prayerTimes = prayerTimes;
    self.reminderSettings = reminderSettings;
    self.scheduledNotifications = [];
    
    // Schedule notifications based on prayer times and settings
    scheduleNotifications(prayerTimes, reminderSettings);
    
    // Acknowledge receipt
    event.source.postMessage({
      type: 'PRAYERS_SET',
      message: 'Prayer times and reminders successfully scheduled'
    });
  } else if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    // Send a test notification
    self.registration.showNotification('Prayer Reminder Test', {
      body: 'This is a test notification from EmoMin',
      icon: '/static/images/logo.png',
      vibrate: [100, 50, 100],
      badge: '/static/images/notification-badge.png',
    });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientsArr => {
      // If a window with the app is already open, focus it
      const hadWindowToFocus = clientsArr.some(windowClient => {
        if (windowClient.url.includes('/prayer-times')) {
          return windowClient.focus();
        }
      });
      
      // Otherwise, open a new window with the prayer times page
      if (!hadWindowToFocus) {
        clients.openWindow('/prayer-times');
      }
    })
  );
});

// Handle push notifications (if subscription is set up)
self.addEventListener('push', event => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Prayer Reminder';
  const options = {
    body: data.body || 'It\'s time for prayer!',
    icon: data.icon || '/static/images/logo.png',
    badge: data.badge || '/static/images/notification-badge.png',
    vibrate: data.vibrate || [100, 50, 100],
    data: data.data || { url: '/prayer-times' }
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

function scheduleNotifications(prayerTimes, reminderSettings) {
  if (!prayerTimes || !reminderSettings) return;
  
  const now = new Date();
  
  Object.entries(prayerTimes).forEach(([prayer, timeStr]) => {
    // Skip if reminder is not enabled for this prayer
    if (!reminderSettings[prayer.toLowerCase()]?.enabled) return;
    
    // Parse prayer time
    const [hours, minutes] = timeStr.split(':');
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(hours));
    prayerTime.setMinutes(parseInt(minutes));
    prayerTime.setSeconds(0);
    
    // Calculate reminder time based on minutes before setting
    const minutesBefore = reminderSettings[prayer.toLowerCase()]?.minutesBefore || 15;
    const reminderTime = new Date(prayerTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);
    
    // If the time has already passed today, schedule for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    // Calculate delay in milliseconds
    const delay = reminderTime.getTime() - now.getTime();
    
    // Schedule the notification
    const timeoutId = setTimeout(() => {
      self.registration.showNotification(`Time for ${prayer} Prayer`, {
        body: `${prayer} prayer time will be in ${minutesBefore} minutes`,
        icon: '/static/images/logo.png',
        vibrate: [100, 50, 100],
        badge: '/static/images/notification-badge.png',
        sound: reminderSettings[prayer.toLowerCase()]?.sound || 'default',
        data: { prayer, url: '/prayer-times' }
      });
      
      // Reschedule for next day
      const nextDay = new Date(reminderTime);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDelay = nextDay.getTime() - new Date().getTime();
      
      const nextTimeoutId = setTimeout(() => {
        scheduleNotification(prayer, timeStr, reminderSettings[prayer.toLowerCase()]);
      }, nextDelay);
      
      self.scheduledNotifications.push(nextTimeoutId);
      
    }, delay);
    
    self.scheduledNotifications.push(timeoutId);
  });
}