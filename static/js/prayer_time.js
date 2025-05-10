function formatTimeForDisplay(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

function getNextPrayer(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimes = {
        'Fajr': timings.Fajr,
        'Sunrise': timings.Sunrise,
        'Dhuhr': timings.Dhuhr,
        'Asr': timings.Asr,
        'Maghrib': timings.Maghrib,
        'Isha': timings.Isha
    };

    let nextPrayer = null;
    let minDiff = Infinity;

    for (const [prayer, time] of Object.entries(prayerTimes)) {
        const [hours, minutes] = time.split(':');
        const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const diff = prayerMinutes - currentTime;

        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = { name: prayer, time: time };
        }
    }

    // If no next prayer found today, return first prayer of next day
    if (!nextPrayer) {
        const firstPrayer = Object.entries(prayerTimes)[0];
        nextPrayer = { name: firstPrayer[0], time: firstPrayer[1] };
    }

    return nextPrayer;
}

function updateCountdown(nextPrayer) {
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':');
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(hours));
    prayerTime.setMinutes(parseInt(minutes));
    prayerTime.setSeconds(0);

    if (prayerTime < now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const diff = prayerTime - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('next-prayer-name').textContent = nextPrayer.name;
    document.getElementById('time-remaining').textContent = 
        `${hoursLeft}h ${minutesLeft}m`;

    // Update countdown every minute
    setTimeout(() => updateCountdown(nextPrayer), 60000);
}

async function getPrayerTimes(latitude, longitude) {
    try {
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
        const response = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            
            // Store raw time and display formatted time
            document.getElementById('fajr-time').setAttribute('data-raw-time', timings.Fajr);
            document.getElementById('sunrise-time').setAttribute('data-raw-time', timings.Sunrise);
            document.getElementById('dhuhr-time').setAttribute('data-raw-time', timings.Dhuhr);
            document.getElementById('asr-time').setAttribute('data-raw-time', timings.Asr);
            document.getElementById('maghrib-time').setAttribute('data-raw-time', timings.Maghrib);
            document.getElementById('isha-time').setAttribute('data-raw-time', timings.Isha);
            
            // Update prayer times with formatted time
            document.getElementById('fajr-time').textContent = formatTimeForDisplay(timings.Fajr);
            document.getElementById('sunrise-time').textContent = formatTimeForDisplay(timings.Sunrise);
            document.getElementById('dhuhr-time').textContent = formatTimeForDisplay(timings.Dhuhr);
            document.getElementById('asr-time').textContent = formatTimeForDisplay(timings.Asr);
            document.getElementById('maghrib-time').textContent = formatTimeForDisplay(timings.Maghrib);
            document.getElementById('isha-time').textContent = formatTimeForDisplay(timings.Isha);
            
            // Update date
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            document.getElementById('current-date').textContent = date.toLocaleDateString('en-US', options);
            
            // Update next prayer and start countdown
            const nextPrayer = getNextPrayer(timings);
            updateCountdown(nextPrayer);

            // Highlight next prayer card
            document.querySelectorAll('.prayer-card').forEach(card => {
                card.classList.remove('next-prayer');
                if (card.querySelector('h3').textContent.toLowerCase() === nextPrayer.name.toLowerCase()) {
                    card.classList.add('next-prayer');
                }
            });
            
            // Get location name using reverse geocoding
            const geocodeResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`);
            const geocodeData = await geocodeResponse.json();
            document.getElementById('location-name').textContent = `${geocodeData.city}, ${geocodeData.countryName}`;
            
            // Dispatch event that prayer times are loaded
            const prayerTimesLoadedEvent = new CustomEvent('prayerTimesLoaded', {
                detail: { timings }
            });
            document.dispatchEvent(prayerTimesLoadedEvent);
            
            return timings;
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
    }
    
    return null;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getPrayerTimes(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                // Default to Mecca coordinates if location access is denied
                getPrayerTimes(21.4225, 39.8262);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser');
        // Default to Mecca coordinates
        getPrayerTimes(21.4225, 39.8262);
    }
}

// Initialize on page load
getLocation();