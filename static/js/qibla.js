let qiblaAngle = 0;

// Create degree markers
function createDegreeMarkers() {
    const markers = document.querySelector('.degree-markers');
    for (let i = 0; i < 360; i += 15) { // Changed to 15-degree intervals for more precise markings
        const marker = document.createElement('div');
        marker.className = 'degree-marker';
        marker.style.transform = `rotate(${i}deg)`;
        markers.appendChild(marker);
    }
}

function calculateQiblaDirection(latitude, longitude) {
    // Coordinates of Kaaba
    const kaabaLat = 21.4225;
    const kaabaLong = 39.8262;
    
    // Convert to radians
    const lat1 = latitude * (Math.PI / 180);
    const lat2 = kaabaLat * (Math.PI / 180);
    const longDiff = (kaabaLong - longitude) * (Math.PI / 180);
    
    // Calculate Qibla direction
    const y = Math.sin(longDiff);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(longDiff);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    
    // Normalize to 0-360
    qibla = (qibla + 360) % 360;
    
    return qibla;
}

function updateCompass(heading) {
    const compassInner = document.querySelector('.compass-inner');
    const qiblaIndicator = document.querySelector('.qibla-indicator');
    
    // Update compass rotation
    compassInner.style.transform = `rotate(${-heading}deg)`;
    
    // Update Qibla indicator
    qiblaIndicator.style.transform = `rotate(${qiblaAngle}deg)`;

    // Add smooth transition
    compassInner.style.transition = 'transform 0.2s ease';
    qiblaIndicator.style.transition = 'transform 0.2s ease';
}

function handleOrientation(event) {
    let heading;
    
    if (event.webkitCompassHeading) {
        // iOS devices
        heading = event.webkitCompassHeading;
    } else if (event.alpha) {
        // Android devices
        heading = 360 - event.alpha;
    } else {
        return;
    }
    
    updateCompass(heading);
}

async function initQibla() {
    // Create degree markers
    createDegreeMarkers();
    
    // Setup calibration button
    const calibrateBtn = document.getElementById('calibrate-btn');
    calibrateBtn.addEventListener('click', async () => {
        if (DeviceOrientationEvent.requestPermission) {
            try {
                calibrateBtn.innerHTML = `
                    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    Calibrating...
                `;
                
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    calibrateBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                        Recalibrate
                    `;
                }
            } catch (error) {
                console.error('Error requesting permission:', error);
                calibrateBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    Try Again
                `;
            }
        }
    });
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Calculate Qibla direction
            qiblaAngle = calculateQiblaDirection(latitude, longitude);
            document.getElementById('qibla-degree').textContent = `${Math.round(qiblaAngle)}°`;
            
            // Get location name
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`);
                const data = await response.json();
                document.getElementById('current-location').textContent = `${data.city}, ${data.countryName}`;
            } catch (error) {
                console.error('Error getting location name:', error);
                document.getElementById('current-location').textContent = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
            }
            
            // Initialize orientation tracking
            if (window.DeviceOrientationEvent) {
                if (DeviceOrientationEvent.requestPermission) {
                    // iOS 13+ devices
                    calibrateBtn.style.display = 'flex';
                } else {
                    // Other devices
                    window.addEventListener('deviceorientation', handleOrientation);
                    calibrateBtn.style.display = 'none';
                }
            } else {
                document.querySelector('.instructions').innerHTML = '<p class="error">Device orientation not supported on this device.</p>';
                calibrateBtn.style.display = 'none';
            }
        }, (error) => {
            console.error('Error getting location:', error);
            document.getElementById('current-location').textContent = 'Location access denied';
            calibrateBtn.style.display = 'none';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initQibla);