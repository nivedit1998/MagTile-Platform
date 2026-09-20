const REDIS_KEY = "magtile:layout";

const EMPTY_LAYOUT = {
  version: 1,
  orientation: "landscape",
  elements: [],
  updatedAt: null,
};

function getHeader(request, name) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function getRedisConfig() {
  // Vercel Marketplace Redis integrations may use either naming convention.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  return url && token ? { url, token } : null;
}

async function redisCommand(command) {
  const config = getRedisConfig();
  if (!config) {
    const error = new Error(
      "Redis storage is not configured. Connect a Vercel Marketplace Redis integration and redeploy."
    );
    error.statusCode = 503;
    throw error;
  }

  const redisResponse = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const payload = await redisResponse.json();
  if (!redisResponse.ok || payload.error) {
    throw new Error(payload.error || "Redis request failed");
  }

  return payload.result;
}

function readBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return {};
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateLayout(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("The request body must be a layout object.");
  }

  const orientation =
    body.orientation === "portrait"
      ? "portrait"
      : body.orientation === "landscape"
        ? "landscape"
        : null;

  if (!orientation) {
    throw new Error("orientation must be portrait or landscape.");
  }

  if (!Array.isArray(body.elements) || body.elements.length > 40) {
    throw new Error("elements must be an array with at most 40 items.");
  }

  const elements = body.elements.map((element) => {
    if (!element || element.type !== "text") {
      throw new Error("Only text elements are supported right now.");
    }

    const text = String(element.text ?? "").trim();
    const x = Number(element.x);
    const y = Number(element.y);
    const width = Number(element.width ?? 0.8);
    const height = Number(element.height ?? 0.2);
    const fontSize = Number(element.fontSize ?? 2);

    if (!text || text.length > 120) {
      throw new Error("Text must contain between 1 and 120 characters.");
    }
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      x > 1 ||
      y < 0 ||
      y > 1 ||
      !Number.isFinite(width) ||
      width <= 0 ||
      width > 1 ||
      !Number.isFinite(height) ||
      height <= 0 ||
      height > 1 ||
      x + width > 1 ||
      y + height > 1
    ) {
      throw new Error("Text boxes must fit inside the normalized canvas.");
    }
    if (!Number.isFinite(fontSize)) {
      throw new Error("fontSize must be a number.");
    }

    return {
      type: "text",
      text,
      x,
      y,
      width,
      height,
      fontSize: Math.round(clamp(fontSize, 1, 4)),
    };
  });

  return {
    version: 1,
    orientation,
    elements,
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  const configuredKey = process.env.MagTileKey;
  const suppliedKey = getHeader(request, "x-magtile-key");

  response.setHeader("Cache-Control", "no-store");

  if (!configuredKey) {
    response.status(500).json({
      error: "MagTileKey is not configured on the Vercel deployment.",
    });
    return;
  }

  if (!suppliedKey || suppliedKey !== configuredKey) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    if (request.method === "GET") {
      const storedLayout = await redisCommand(["GET", REDIS_KEY]);
      const layout = storedLayout ? JSON.parse(storedLayout) : EMPTY_LAYOUT;
      response.status(200).json(layout);
      return;
    }

    if (request.method === "POST") {
      const layout = validateLayout(readBody(request));
      await redisCommand(["SET", REDIS_KEY, JSON.stringify(layout)]);
      response.status(200).json(layout);
      return;
    }

    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    const statusCode =
      error.statusCode || (error instanceof SyntaxError ? 400 : 500);
    response.status(statusCode).json({ error: error.message || "Request failed" });
  }
}
