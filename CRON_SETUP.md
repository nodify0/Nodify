# Cron Job Setup for File Cleanup

## Overview

Nodify automatically cleans up expired files uploaded through forms:
- **Local files**: Expire after 12 hours
- **Firebase Storage files**: Expire after 24 hours

## Setup

### 1. Environment Variable

Add the following to your `.env` file:

```env
CRON_SECRET=your-secure-random-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Configure Cron Service

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-files",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour.

#### Option B: External Cron Service (EasyCron, cron-job.org, etc.)

1. Sign up for a cron service
2. Create a new cron job with:
   - **URL**: `https://your-domain.com/api/cron/cleanup-expired-files`
   - **Method**: GET
   - **Schedule**: Every hour (`0 * * * *`)
   - **Headers**:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

#### Option C: Server Cron (Linux/Unix)

Add to your crontab:

```bash
0 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/cleanup-expired-files
```

Edit crontab:
```bash
crontab -e
```

## Manual Trigger

You can manually trigger the cleanup:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/cleanup-expired-files
```

## Response

Successful response:

```json
{
  "success": true,
  "deleted": {
    "local": 5,
    "cloud": 3,
    "total": 8
  },
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

## Monitoring

Check server logs for cleanup activity:

```
[Cleanup] Starting expired files cleanup...
[Cleanup] Deleted expired file: /public/uploads/forms/abc123/file.pdf
[Cleanup] Deleted expired Firebase file: forms/abc123/file.pdf
[Cleanup] Cleanup complete. Local: 5, Cloud: 3
```

## Security

- The endpoint is protected with Bearer token authentication
- Only requests with the correct `CRON_SECRET` can trigger cleanup
- Unauthorized requests return 401
