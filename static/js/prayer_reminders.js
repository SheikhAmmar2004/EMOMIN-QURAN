// Prayer Reminders functionality
// Manages prayer reminder preferences and notification permissions

const prayerReminderManager = {
  // Default reminder settings
  defaultSettings: {
    fajr: { enabled: true, minutesBefore: 30, sound: 'adhan1' },
    sunrise: { enabled: false, minutesBefore: 15, sound: 'adhan1' },
    dhuhr: { enabled: true, minutesBefore: 15, sound: 'adhan1' },
    asr: { enabled: true, minutesBefore: 15, sound: 'adhan1' },
    maghrib: { enabled: true, minutesBefore: 10, sound: 'adhan1' },
    isha: { enabled: true, minutesBefore: 15, sound: 'adhan1' }
  },
  
  // Available notification sounds
  availableSounds: [
    { id: 'adhan1', name: 'Adhan 1', url: '/static/sounds/adhan1.mp3' },
    { id: 'adhan2', name: 'Adhan 2', url: '/static/sounds/adhan2.mp3' },
    { id: 'beep', name: 'Simple Beep', url: '/static/sounds/beep.mp3' },
    { id: 'none', name: 'Silent', url: null }
  ],
  
  // Current reminder settings
  settings: {},
  
  // Service worker registration
  swRegistration: null,
  
  // Initialize the reminder system
  init: async function() {
    // Load saved settings or use defaults
    this.loadSettings();
    
    // Register event listeners
    this.registerEventListeners();
    
    // Initialize UI
    this.updateUI();
    
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/static/js/service-worker.js');
        console.log('Service Worker registered successfully:', this.swRegistration);
        
        // Request notification permission if not granted
        this.checkNotificationPermission();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        this.updatePermissionStatus(false, 'Service worker not supported');
      }
    } else {
      console.warn('Service Workers not supported');
      this.updatePermissionStatus(false, 'Service worker not supported');
    }
  },
  
  // Load settings from local storage
  loadSettings: function() {
    try {
      const savedSettings = localStorage.getItem('prayerReminderSettings');
      this.settings = savedSettings ? JSON.parse(savedSettings) : { ...this.defaultSettings };
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { ...this.defaultSettings };
    }
  },
  
  // Save settings to local storage
  saveSettings: function() {
    try {
      localStorage.setItem('prayerReminderSettings', JSON.stringify(this.settings));
      
      // Update service worker with new settings if available
      this.updateServiceWorker();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
  
  // Register all UI event listeners
  registerEventListeners: function() {
    // Toggle switches for each prayer
    document.querySelectorAll('.prayer-reminder-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const prayer = e.target.dataset.prayer;
        this.settings[prayer].enabled = e.target.checked;
        this.saveSettings();
        this.updateUI();
      });
    });
    
    // Minutes before selectors
    document.querySelectorAll('.reminder-minutes-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const prayer = e.target.dataset.prayer;
        this.settings[prayer].minutesBefore = parseInt(e.target.value);
        this.saveSettings();
      });
    });
    
    // Sound selectors
    document.querySelectorAll('.reminder-sound-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const prayer = e.target.dataset.prayer;
        this.settings[prayer].sound = e.target.value;
        this.saveSettings();
      });
    });
    
    // Enable all button
    document.getElementById('enable-all-reminders').addEventListener('click', () => {
      Object.keys(this.settings).forEach(prayer => {
        this.settings[prayer].enabled = true;
      });
      this.saveSettings();
      this.updateUI();
    });
    
    // Disable all button
    document.getElementById('disable-all-reminders').addEventListener('click', () => {
      Object.keys(this.settings).forEach(prayer => {
        this.settings[prayer].enabled = false;
      });
      this.saveSettings();
      this.updateUI();
    });
    
    // Test notification button
    document.getElementById('test-notification').addEventListener('click', () => {
      this.sendTestNotification();
    });
    
    // Request permission button
    document.getElementById('request-notification-permission').addEventListener('click', () => {
      this.requestNotificationPermission();
    });
    
    // Toggle reminder settings panel
    document.getElementById('toggle-reminder-settings').addEventListener('click', () => {
      document.getElementById('reminder-settings-panel').classList.toggle('open');
    });
  },
  
  // Update UI based on current settings
  updateUI: function() {
    // Update toggles
    Object.entries(this.settings).forEach(([prayer, settings]) => {
      const toggle = document.querySelector(`.prayer-reminder-toggle[data-prayer="${prayer}"]`);
      if (toggle) {
        toggle.checked = settings.enabled;
      }
      
      const minutesSelect = document.querySelector(`.reminder-minutes-select[data-prayer="${prayer}"]`);
      if (minutesSelect) {
        minutesSelect.value = settings.minutesBefore;
      }
      
      const soundSelect = document.querySelector(`.reminder-sound-select[data-prayer="${prayer}"]`);
      if (soundSelect) {
        soundSelect.value = settings.sound;
      }
      
      // Update prayer card indicator
      const prayerCard = document.querySelector(`.prayer-card.${prayer}`);
      if (prayerCard) {
        if (settings.enabled) {
          prayerCard.classList.add('reminder-enabled');
        } else {
          prayerCard.classList.remove('reminder-enabled');
        }
      }
    });
    
    // Update global status
    const allEnabled = Object.values(this.settings).every(setting => setting.enabled);
    const anyEnabled = Object.values(this.settings).some(setting => setting.enabled);
    
    const statusElement = document.getElementById('reminders-status');
    if (statusElement) {
      if (allEnabled) {
        statusElement.textContent = 'All prayer reminders are enabled';
        statusElement.className = 'status-active';
      } else if (anyEnabled) {
        statusElement.textContent = 'Some prayer reminders are enabled';
        statusElement.className = 'status-partial';
      } else {
        statusElement.textContent = 'Prayer reminders are disabled';
        statusElement.className = 'status-inactive';
      }
    }
  },
  
  // Check and update notification permission status
  checkNotificationPermission: function() {
    if (!('Notification' in window)) {
      this.updatePermissionStatus(false, 'Notifications not supported in this browser');
      return false;
    }
    
    const permissionStatus = Notification.permission;
    
    if (permissionStatus === 'granted') {
      this.updatePermissionStatus(true);
      return true;
    } else if (permissionStatus === 'denied') {
      this.updatePermissionStatus(false, 'Notification permission denied');
      return false;
    } else {
      this.updatePermissionStatus(false, 'Notification permission required');
      return false;
    }
  },
  
  // Request notification permission
  requestNotificationPermission: async function() {
    if (!('Notification' in window)) {
      this.updatePermissionStatus(false, 'Notifications not supported');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        this.updatePermissionStatus(true);
        this.updateServiceWorker();
      } else {
        this.updatePermissionStatus(false, 'Permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.updatePermissionStatus(false, 'Error requesting permission');
    }
  },
  
  // Update permission status in UI
  updatePermissionStatus: function(granted, message = '') {
    const statusElement = document.getElementById('notification-permission-status');
    const requestButton = document.getElementById('request-notification-permission');
    
    if (statusElement) {
      if (granted) {
        statusElement.textContent = 'Notification permission granted';
        statusElement.className = 'status-active';
        requestButton.style.display = 'none';
      } else {
        statusElement.textContent = message || 'Notification permission required';
        statusElement.className = 'status-inactive';
        requestButton.style.display = 'block';
      }
    }
  },
  
  // Update service worker with current prayer times and settings
  updateServiceWorker: function() {
    if (!this.swRegistration || !navigator.serviceWorker.controller) {
      console.warn('Service Worker not active yet');
      return;
    }
    
    // Get the latest prayer times from the page
    const prayerTimes = {
      Fajr: document.getElementById('fajr-time').getAttribute('data-raw-time') || document.getElementById('fajr-time').textContent,
      Sunrise: document.getElementById('sunrise-time').getAttribute('data-raw-time') || document.getElementById('sunrise-time').textContent,
      Dhuhr: document.getElementById('dhuhr-time').getAttribute('data-raw-time') || document.getElementById('dhuhr-time').textContent,
      Asr: document.getElementById('asr-time').getAttribute('data-raw-time') || document.getElementById('asr-time').textContent,
      Maghrib: document.getElementById('maghrib-time').getAttribute('data-raw-time') || document.getElementById('maghrib-time').textContent,
      Isha: document.getElementById('isha-time').getAttribute('data-raw-time') || document.getElementById('isha-time').textContent
    };
    
    // Send message to service worker
    navigator.serviceWorker.controller.postMessage({
      type: 'SET_PRAYERS',
      prayerTimes: prayerTimes,
      reminderSettings: this.settings
    });
  },
  
  // Send a test notification
  sendTestNotification: function() {
    if (!this.checkNotificationPermission()) {
      this.requestNotificationPermission();
      return;
    }
    
    if (this.swRegistration && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TEST_NOTIFICATION'
      });
    } else {
      // Fallback if service worker not ready
      new Notification('Prayer Reminder Test', {
        body: 'This is a test notification from EmoMin',
        icon: '/static/images/logo.png'
      });
    }
  }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  prayerReminderManager.init();
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'PRAYERS_SET') {
      console.log('Service Worker confirmation:', event.data.message);
    }
  });
});