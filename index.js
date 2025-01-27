// Initialize the map
const map = L.map('map')//.setView([51.5074, -0.1278], 13); // Centered in London

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);


const markers = []

// Function to update the route based on input
function updateRoute() {
    const pointAInput = document.getElementById('pointA').value.split(',').map(Number);
    const pointBInput = document.getElementById('pointB').value.split(',').map(Number);
    const interval = parseInt(document.getElementById('interval').value, 10);
    const zoom = parseInt(document.getElementById('zoom').value, 10);

    function createMarker(lat, lng, id, description) {
        const marker = L.circleMarker([lat, lng], {
            radius: 10,
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 1
        }).addTo(map);

        // Bind a popup to the marker with custom information
        marker.bindPopup(`<b>${description}</b>`);

        // Store the marker with custom properties
        marker.customId = id;
        marker.customDescription = description;

        // Add marker to global markers array
        markers.push(marker);

        // Add a click event listener to the marker to highlight the corresponding row in the table
        marker.on('click', () => {
            // console.log("click target", e.target)
            // console.log("entrato mouse click event", new Date().toString())
            centerMapOnMarker(marker); // Directly handle the map centering and popup
            // selectTableRow(marker.customId); // Select the table row based on marker's customId
        });
    }

    function centerMapOnMarker(marker) {
        map.setView(marker.getLatLng(), zoom ?? 13); // Center map on marker's position
        // marker.openPopup(); // Optionally open the popup of the marker
        selectTableRow(marker.customId);
    }

    function selectTableRow(id) {
        const rows = document.querySelectorAll('#markersTable tbody tr');
        rows.forEach(row => {
            row.classList.remove('selected'); // Remove highlight from all rows
            if (row.dataset.id === id.toString()) {
                row.classList.add('selected'); // Add highlight to selected row
            }
        });
    }

    function populateTable() {
        const tbody = document.querySelector('#markersTable tbody');
        const fragment = document.createDocumentFragment(); // Create a document fragment to batch DOM updates

        markers.forEach(marker => {
            const row = document.createElement('tr');
            row.dataset.id = marker.customId; // Store marker id as data attribute on the row
            row.innerHTML = `
            <td>${marker.customId}</td>
            <td>${marker.customDescription}</td>
          `;
            fragment.appendChild(row);

            // Add a click event to the table row to center map on corresponding marker
            row.addEventListener('click', function () {
                marker.fire('click')
            });
        });

        tbody.innerHTML = ''; // Clear existing rows
        tbody.appendChild(fragment); // Append the new rows all at once
    }


    const pointA = L.latLng(pointAInput[0], pointAInput[1]);
    const pointB = L.latLng(pointBInput[0], pointBInput[1]);

    // Clear previous markers
    markers.forEach(marker => marker.remove());
    markers.length = 0;

    // Clear the previous route
    map.eachLayer(layer => {
        if (layer instanceof L.Routing.Line) {
            map.removeLayer(layer);
        }
    });

    // Routing between the new points
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
            styles: [{ color: 'blue', weight: 4, opacity: 0.5 }] // Line style
        },
        draggableWaypoints: false, // Disable dragging of waypoints
        addWaypoints: false
    }).addTo(map);

    // Add blue dots along the way
    control.on('routesfound', function (e) {
        const route = e.routes[0]; // Get the first route
        const coordinates = route.coordinates;

        // const interval = interval; // meters
        let distance = 0;
        let index = 0
        for (let i = 1; i < coordinates.length; i++) {
            // Calculate distance between consecutive points
            const prev = L.latLng(coordinates[i - 1]);
            const curr = L.latLng(coordinates[i]);
            distance += prev.distanceTo(curr);

            // Add a blue dot if interval is met
            if (distance >= interval) {
                createMarker(curr.lat, curr.lng, index + 1, `Marker ${index + 1} Description`);

                distance = 0;
                index++;
            }
        }
        populateTable();
    });
}

updateRoute()
// function openPopupsSequentially() {
//     let index = 0;

//     const intervalTime = 2000; // Time between popups (in ms)

//     // Use setInterval to open popups sequentially
//     const interval = setInterval(() => {
//         if (index < markers.length) {
//             markers[index].fire('click'); // Open popup for the current marker
//             index++; // Move to the next marker
//         } else {
//             clearInterval(interval); // Stop the interval when all markers have opened
//         }
//     }, intervalTime);
// }

// // Call the function after 3 seconds to open popups with a timer
// setTimeout(openPopupsSequentially, 3000);