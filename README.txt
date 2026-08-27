SALES SYSTEM — PRODUCTION TRIAL LEAD CAPTURE

Flow:
7-day trial form -> Netlify Function -> Netlify Blobs -> Admin dashboard.
If RESEND_API_KEY is configured, a lead notification is also sent to LEAD_NOTIFICATION_EMAIL (default: dominionehappy@gmail.com).

Admin password fallback:
ziiraxx12345678919982026
For production, set ADMIN_PASSWORD in Netlify Environment Variables.

Required deployment:
Deploy this folder as the Netlify site root. Netlify must detect netlify/functions and install package.json dependencies.

Email setup:
Set RESEND_API_KEY in Netlify Environment Variables.
Optional: LEAD_NOTIFICATION_EMAIL=dominionehappy@gmail.com
Optional: LEAD_FROM_EMAIL=Sales System <verified-sender@yourdomain.com>

Netlify Forms is also enabled on the trial form as a secondary capture mechanism. After the first deployment, Netlify will recognize the trial-lead form. Configure a Netlify Forms email notification to dominionehappy@gmail.com if you want Netlify itself to send a notification independent of Resend.
