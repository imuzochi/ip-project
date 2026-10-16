const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#ip-address");
const searchButton = searchForm.querySelector("button");
const statusMessage = document.querySelector("#status-message");

const ipResult = document.querySelector("#ip-result");
const locationResult = document.querySelector("#location-result");
const timezoneResult = document.querySelector("#timezone-result");
const ispResult = document.querySelector("#isp-result");

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const locationIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
  iconSize: [46, 56],
  iconAnchor: [23, 56],
});

let locationMarker;

async function findLocation(searchValue = "") {
  statusMessage.textContent = "Searching for location...";
  searchButton.disabled = true;
  searchForm.setAttribute("aria-busy", "true");

  try {
    const search = searchValue
      ? `?search=${encodeURIComponent(searchValue)}`
      : "";
    const response = await fetch(`/api/location${search}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not find that IP address or domain.");
    }

    const place = data.location;
    if (
      !data.ip ||
      !place ||
      !Number.isFinite(Number(place.lat)) ||
      !Number.isFinite(Number(place.lng))
    ) {
      throw new Error("The location service returned incomplete information.");
    }

    const cityAndRegion = [place.city, place.region]
      .filter(Boolean)
      .join(", ");
    const fullLocation = [cityAndRegion, place.postalCode]
      .filter(Boolean)
      .join(" ");

    ipResult.textContent = data.ip;
    locationResult.textContent = fullLocation || place.country;
    timezoneResult.textContent = `UTC ${place.timezone}`;
    ispResult.textContent = data.isp || "Not available";

    const coordinates = [place.lat, place.lng];
    map.setView(coordinates, 13);

    if (locationMarker) {
      locationMarker.setLatLng(coordinates);
    } else {
      locationMarker = L.marker(coordinates, { icon: locationIcon }).addTo(map);
    }

    statusMessage.textContent = "";
  } catch (error) {
    statusMessage.textContent =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  } finally {
    searchButton.disabled = false;
    searchForm.removeAttribute("aria-busy");
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchValue = searchInput.value.trim();
  if (searchValue) {
    findLocation(searchValue);
  } else {
    statusMessage.textContent = "Enter an IP address or domain to search.";
    searchInput.focus();
  }
});

findLocation();