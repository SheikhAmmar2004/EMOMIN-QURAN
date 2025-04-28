let qiblaAngle = 0;

function createDegreeMarkers() {
    const markers = document.querySelector('.degree-markers');
    if (!markers) return;
    
    // Clear existing markers
    markers.innerHTML = '';
    
    for (let i = 0; i < 360; i += 15) {
        const marker = document.createElement('div');
        marker.className = 'degree-marker';
        marker.style.transform = `rotate(${i}deg)`;
        markers.appendChild(marker);
    }
}

function calculateQiblaDirection(latitude, longitude) {
    const kaabaLat = 21.4225;
    const kaabaLong = 39.8262;
    
    const lat1 = latitude * (Math.PI / 180);
    const lat2 = kaabaLat * (Math.PI / 180);
    const longDiff = (kaabaLong - longitude) * (Math.PI / 180);
    
    const y = Math.sin(longDiff);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(longDiff);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    
    return (qibla + 360) % 360;
}

function updateCompass(heading) {
    const compassInner = document.querySelector('.compass-inner');
    const qiblaIndicator = document.querySelector('.qibla-indicator');
    
    if (compassInner && qiblaIndicator) {
        compassInner.style.transform = `rotate(${-heading}deg)`;
        qiblaIndicator.style.transform = `rotate(${qiblaAngle}deg)`;
        
        // Add smooth transition
        compassInner.style.transition = 'transform 0.2s ease';
        qiblaIndicator.style.transition = 'transform 0.2s ease';
    }
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
    const calibrateBtn = document.querySelector('.calibrate-button');
    if (!calibrateBtn) return;
    
    calibrateBtn.addEventListener('click', async () => {
        if (DeviceOrientationEvent.requestPermission) {
            try {
                const originalContent = calibrateBtn.innerHTML;
                calibrateBtn.innerHTML = `
                    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    Calibrating...
                `;
                
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    calibrateBtn.innerHTML = originalContent;
                    alert('Please rotate your device in a figure-8 pattern to calibrate the compass.');
                }
            } catch (error) {
                console.error('Error requesting permission:', error);
                calibrateBtn.innerHTML = originalContent;
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.textContent = 'Failed to access compass. Please try again.';
                calibrateBtn.parentNode.appendChild(errorDiv);
            }
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
            alert('Please rotate your device in a figure-8 pattern to calibrate the compass.');
        }
    });
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Calculate Qibla direction
            qiblaAngle = calculateQiblaDirection(latitude, longitude);
            const qiblaDegreeElement = document.getElementById('qibla-degree');
            if (qiblaDegreeElement) {
                qiblaDegreeElement.textContent = `${qiblaAngle.toFixed(1)}° ${qiblaAngle > 180 ? 'NW' : 'NE'}`;
            }
            
            // Get location name
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`);
                const data = await response.json();
                const locationElement = document.querySelector('.location-text h2');
                if (locationElement) {
                    locationElement.textContent = `${data.city}${data.countryName ? `, ${data.countryName}` : ''}`;
                }
            } catch (error) {
                console.error('Error getting location name:', error);
                const locationElement = document.querySelector('.location-text h2');
                if (locationElement) {
                    locationElement.textContent = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
                }
            }
            
            // Initialize orientation tracking
            if (window.DeviceOrientationEvent) {
                if (DeviceOrientationEvent.requestPermission) {
                    // iOS 13+ devices - show calibrate button
                    if (calibrateBtn) calibrateBtn.style.display = 'flex';
                } else {
                    // Other devices - auto start
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    if (calibrateBtn) calibrateBtn.style.display = 'none';
                }
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.textContent = 'Device orientation not supported on this device.';
                if (calibrateBtn) {
                    calibrateBtn.style.display = 'none';
                    calibrateBtn.parentNode.appendChild(errorDiv);
                }
            }
        }, (error) => {
            console.error('Error getting location:', error);
            const locationElement = document.querySelector('.location-text h2');
            if (locationElement) {
                locationElement.textContent = 'Location access denied';
            }
            if (calibrateBtn) calibrateBtn.style.display = 'none';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = 'Please enable location services to use the Qibla compass.';
            if (calibrateBtn) {
                calibrateBtn.parentNode.appendChild(errorDiv);
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initQibla);

// Cleanup on page unload
window.addEventListener('unload', () => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
});