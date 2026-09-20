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

The endpoint is protected by the `X-MagTile-Key` request header. The ESP32 sends this header when it fetches personal content.

## Vercel

Import this repository into Vercel. Create this environment variable in the Vercel project settings:

```text
Name:  MagTileKey
Value: your-private-device-key
```

Add it to the deployment environments you use, then redeploy. The variable name is case-sensitive.

The homepage remains public, but `/api/magtile` returns `401 Unauthorized` unless the request includes the matching header. Test it from PowerShell with:

```powershell
curl.exe -H "X-MagTile-Key: your-private-device-key" https://YOUR-VERCEL-DOMAIN.vercel.app/api/magtile
```

Each commit pushed to the connected Git repository can then trigger a deployment.
