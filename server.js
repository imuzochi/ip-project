const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { isIP } = require("node:net");

const projectFolder = __dirname;
const port = process.env.PORT || 3000;

function getApiKey() {
  const environmentKey = process.env.API_KEY?.trim();
  if (environmentKey) {
    return environmentKey;
  }

  const envPath = path.join(projectFolder, ".env");
  if (!fs.existsSync(envPath)) {
    return "";
  }

  const envFile = fs.readFileSync(envPath, "utf8");
  const keyLine = envFile
    .split(/\r?\n/)
    .find((line) => /^\s*API_KEY\s*=/.test(line));

  return keyLine
    ? keyLine
        .replace(/^\s*API_KEY\s*=/, "")
        .trim()
        .replace(/^["']|["']$/g, "")
    : "";
}

const apiKey = getApiKey();

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function isValidDomain(value) {
  const domainPattern =
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

  return domainPattern.test(value);
}

async function handleLocationRequest(requestUrl, response) {
  const searchValue = (requestUrl.searchParams.get("search") || "").trim();
  const parameters = new URLSearchParams({ apiKey });

  if (searchValue) {
    if (isIP(searchValue)) {
      parameters.set("ipAddress", searchValue);
    } else if (isValidDomain(searchValue)) {
      parameters.set("domain", searchValue);
    } else {
      sendJson(response, 400, {
        error: "Enter a valid IP address or domain name.",
      });
      return;
    }
  }

  if (!apiKey) {
    sendJson(response, 500, {
      error: "Add your IPify API key to the API_KEY setting in .env.",
    });
    return;
  }

  try {
    const apiResponse = await fetch(
      `https://geo.ipify.org/api/v2/country,city?${parameters.toString()}`
    );
    const data = await apiResponse.json();
    sendJson(response, apiResponse.status, data);
  } catch (error) {
    console.error("The IPify request failed:", error);
    sendJson(response, 502, {
      error: "Could not connect to IPify. Please try again.",
    });
  }
}

const staticFiles = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/ip.js": ["ip.js", "text/javascript; charset=utf-8"],
};

async function sendProjectFile(requestPath, response) {
  let fileDetails = staticFiles[requestPath];

  if (!fileDetails && requestPath.startsWith("/images/")) {
    const fileName = requestPath.slice("/images/".length);
    if (/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      const extension = path.extname(fileName).toLowerCase();
      const contentTypes = {
        ".png": "image/png",
        ".svg": "image/svg+xml",
      };

      if (contentTypes[extension]) {
        fileDetails = [
          path.join("images", fileName),
          contentTypes[extension],
        ];
      }
    }
  }

  if (!fileDetails) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  try {
    const filePath = path.join(projectFolder, fileDetails[0]);
    const fileContents = await fs.promises.readFile(filePath);
    response.writeHead(200, { "Content-Type": fileDetails[1] });
    response.end(fileContents);
  } catch (error) {
    console.error("Could not read a project file:", error);
    response.writeHead(500);
    response.end("Could not load the requested file.");
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/location") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Use GET to search for a location." });
      return;
    }

    await handleLocationRequest(requestUrl, response);
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405);
    response.end("Use GET to load project files.");
    return;
  }

  await sendProjectFile(requestUrl.pathname, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`IP Address Tracker is running at http://localhost:${port}`);
});
