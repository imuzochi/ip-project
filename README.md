# IP Address Tracker

A responsive IP address and domain lookup app. Search for an IP address or domain to see its location, timezone, internet service provider, and position on an interactive map.

## Features

- Shows the visitor's public IP location when the page first loads.
- Searches IPv4/IPv6 addresses and domain names with the IPify Geolocation API.
- Displays the IP address, city/region, postal code, UTC offset, and ISP.
- Moves a Leaflet map marker to the returned coordinates.
- Includes responsive layouts, keyboard-accessible search, and visible loading/error messages.
- Keeps the IPify API key on the local server instead of exposing it in browser JavaScript.

Try a search with an IP address such as `8.8.8.8` or a domain such as `example.com`.

## Requirements

- Node.js 18 or newer
- An IPify API key
- Internet access for the IPify API, Leaflet CDN, and OpenStreetMap tiles

## Run locally

1. Add your IPify key to the existing `.env` file:

   ```text
   API_KEY=your_ipify_api_key
   ```

2. In a terminal, change to this project folder and start the server:

   ```sh
   node server.js
   ```

3. Open [http://localhost:3000](http://localhost:3000).

To stop the server, press **Control + C** in the terminal where it is running.

The app needs to be opened through the local server, not by opening `index.html` directly as a file. The `.env` file is ignored by Git; do not commit or share your API key.

## Built with

- HTML, CSS, and browser JavaScript
- Node.js built-in HTTP server for the private API-key proxy
- [IPify IP Geolocation API](https://geo.ipify.org/)
- [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/)
- Rubik typeface

## Notes

OpenStreetMap tiles require attribution, which is included on the map. The local Node.js server is intended for development and is not a production hosting setup. If deploying the app, host the API proxy on a server and store the key in that host's environment variables.
