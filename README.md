# MagTile Platform

The lightweight Vercel platform for MagTile.

## UI designer

Open `/designer.html` on the deployed site. Enter the same private key used by the ESP32, choose portrait or landscape, add text, drag it into position, and select **Save to MagTile**.

The ESP32 polls `/api/magtile` every minute. The saved layout is returned as JSON using normalized `x`, `y`, `width`, and `height` values, so the editor and device share the same logical 416×240 landscape or 240×416 portrait canvas. Text uses the same FreeSans Bold font system on the editor and ESP32 at 6pt, 12pt, 24pt, or 48pt, and wraps inside its saved box.

## Vercel environment variables

Create this variable in the Vercel project settings:

```text
Name:  MagTileKey
Value: your-private-device-key
```

The API also needs durable Redis storage for the Save button. From the Vercel project, add a Redis integration through the Vercel Marketplace and redeploy. The API supports the environment variable names used by the common integrations:

```text
KV_REST_API_URL
KV_REST_API_TOKEN
```

It also accepts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if those are the names supplied by the integration.

Add the variables to the deployment environments you use. The variable names are case-sensitive.

## API

The device-facing endpoint is:

```text
/api/magtile
```

It requires the `X-MagTile-Key` request header. Test it from PowerShell with:

```powershell
curl.exe -H "X-MagTile-Key: your-private-device-key" https://YOUR-VERCEL-DOMAIN.vercel.app/api/magtile
```

Each commit pushed to the connected Git repository can trigger a deployment.
