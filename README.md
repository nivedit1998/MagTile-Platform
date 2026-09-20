# MagTile Platform

The lightweight Vercel platform for MagTile.

## Current state

The homepage is intentionally empty apart from a placeholder. The first device-facing endpoint is available at:

```text
/api/magtile
```

It currently returns an empty content payload:

```json
{
  "version": 1,
  "title": "",
  "message": "",
  "quote": "",
  "updatedAt": null
}
```

The ESP32 can use this endpoint later to fetch personal content and render it on the eInk display.

## Vercel

Import this repository into Vercel. No build command or environment variables are required for the initial version. Each commit pushed to the connected Git repository can then trigger a deployment.
