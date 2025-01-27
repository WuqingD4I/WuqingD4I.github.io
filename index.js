// Initialize the map
const map = L.map('map').setView([51.5074, -0.1278], 13); // Centered in London

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

const markers = []

// Points A and B
const pointA = [51.514504, -0.144078]; // Oxford Street
const pointB = [51.515905, -0.135145]; // Another point on Oxford Street

// Routing between A and B
const control = L.Routing.control({
    waypoints: [
        L.latLng(pointA),
        L.latLng(pointB)
    ],
    router: L.Routing.osrmv1({ // Use OSRM for routing
        serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    createMarker: () => null, // Disable default markers
    lineOptions: {
        styles: [{ color: 'red', weight: 4, opacity: 0.7 }] // Line style
    },
    draggableWaypoints: true, // Disable dragging of waypoints
    addWaypoints: false
}).addTo(map);

// Add blue dots along the way
control.on('routesfound', function (e) {
    const route = e.routes[0]; // Get the first route
    const coordinates = route.coordinates;

    // Add blue dots every 100 meters (or any interval you prefer)
    const interval = 25; // meters
    let distance = 0;

    for (let i = 1; i < coordinates.length; i++) {
        // Calculate distance between consecutive points
        const prev = L.latLng(coordinates[i - 1]);
        const curr = L.latLng(coordinates[i]);
        distance += prev.distanceTo(curr);

        // Add a blue dot if interval is met
        if (distance >= interval) {
            const marker = L.circleMarker([curr.lat, curr.lng], {
                radius: 5,
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 1
            }).addTo(map);

            markers.push(marker);

            // Bind a popup with the coordinates
            marker.bindPopup(`Coordinates: ${curr.lat.toFixed(5)}, ${curr.lng.toFixed(5)}`);

            // Add a custom click event
            marker.on('click', function () {
                console.log(`You clicked on: ${curr.lat.toFixed(5)}, ${curr.lng.toFixed(5)}`);
                // Add your custom logic here
            });

            marker.on('mouseover', function () {
                console.log(`Mouse over: ${curr.lat}, ${curr.lng}`);
            });

            distance = 0; // Reset distance
        }
    }
});

function openPopupsSequentially() {
    let index = 0;

    const intervalTime = 2000; // Time between popups (in ms)

    // Use setInterval to open popups sequentially
    const interval = setInterval(() => {
        if (index < markers.length) {
            markers[index].openPopup(); // Open popup for the current marker
            index++; // Move to the next marker
        } else {
            clearInterval(interval); // Stop the interval when all markers have opened
        }
    }, intervalTime);
}

// Call the function after 3 seconds to open popups with a timer
setTimeout(openPopupsSequentially, 3000);