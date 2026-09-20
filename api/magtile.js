export default function handler(request, response) {
  const configuredKey = process.env.MagTileKey;
  const requestHeader = request.headers["x-magtile-key"];
  const suppliedKey = Array.isArray(requestHeader)
    ? requestHeader[0]
    : requestHeader;

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

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({
    version: 1,
    title: "",
    message: "",
    quote: "",
    updatedAt: null,
  });
}
