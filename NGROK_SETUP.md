# Ngrok Setup for Nodify

## Overview

Ngrok allows you to expose your local Nodify development server to the internet, making it accessible remotely for testing webhooks, form submissions, and sharing your work.

## Installation

✅ Ngrok is already installed globally.

## Setup

### 1. Get Your Auth Token (Optional but Recommended)

1. Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Sign up for a free account
3. Copy your auth token from [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

### 2. Configure Auth Token

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Benefits of using auth token:**
- Longer session duration
- More connections per minute
- Custom subdomains (paid plans)
- Access to ngrok dashboard

### 3. Start Your Development Server

Make sure Nodify is running:

```bash
npm run dev
```

Your server should be running on `http://localhost:9003`

### 4. Start Ngrok

#### Option A: Using npm script (Recommended)

```bash
npm run ngrok
```

#### Option B: Direct command

```bash
ngrok http 9003
```

#### Option C: With custom subdomain (requires paid plan)

```bash
ngrok http 9003 --subdomain=mynodify
```

### 5. Access Your Public URL

Ngrok will display a public URL like:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:9003
```

Now you can access your Nodify instance from anywhere using that URL!

## Usage Examples

### Testing Webhooks

Use your ngrok URL for webhook endpoints:

```
https://abc123.ngrok-free.app/api/webhook/your-webhook-id
```

### Sharing Forms

Share form submission URLs:

```
https://abc123.ngrok-free.app/api/form/prod/your-form-id
```

### Testing on Mobile Devices

Access your Nodify instance from your phone or tablet using the ngrok URL.

## Important Notes

### 1. Ngrok Warning Page

Free ngrok URLs show a warning page before forwarding. Users need to click "Visit Site" to proceed. This is normal for free accounts.

### 2. URL Changes

Every time you restart ngrok, you get a new random URL (unless you have a paid plan with custom subdomains).

### 3. Session Limits

Free plan limits:
- 1 concurrent ngrok process
- 40 connections/minute
- Session timeout after 2 hours (with auth token)

### 4. Security

- Don't share ngrok URLs with untrusted parties
- Remember that your local server is exposed to the internet
- Use auth tokens to secure your ngrok tunnels

## Advanced Configuration

### Ngrok Config File

Create `ngrok.yml` in your home directory (`~/.ngrok2/ngrok.yml`):

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN

tunnels:
  nodify:
    proto: http
    addr: 9003
    inspect: true

  nodify-secure:
    proto: http
    addr: 9003
    inspect: true
    host_header: rewrite
```

Start named tunnel:

```bash
ngrok start nodify
```

### Using with Firebase Auth

If you're using Firebase Authentication, you may need to add your ngrok URL to authorized domains:

1. Go to Firebase Console → Authentication → Settings
2. Add your ngrok URL to "Authorized domains"
3. Example: `abc123.ngrok-free.app`

## Troubleshooting

### Connection Refused

Make sure your dev server is running:
```bash
npm run dev
```

### Port Already in Use

If port 9003 is busy, check what's using it:
```bash
netstat -ano | findstr :9003
```

### Ngrok Not Found

Reinstall globally:
```bash
npm install -g ngrok
```

## Monitoring

View ngrok web interface at:
```
http://localhost:4040
```

This shows:
- Real-time requests
- Request/response details
- Status and metrics
- Replay requests

## Stopping Ngrok

Press `Ctrl+C` in the terminal where ngrok is running.

## Alternative Services

If you need more features:
- **Cloudflare Tunnel** (free, no limits)
- **LocalTunnel** (free, simpler)
- **Serveo** (free, SSH-based)
- **PageKite** (paid)
