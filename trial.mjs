import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const store = getStore({ name: 'sales-system-leads', consistency: 'strong' });
const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  body: JSON.stringify(body)
});
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' });
  try {
    if (!event.body) return json(400, { ok: false, error: 'No form data was received.' });
    let data;
    try { data = JSON.parse(event.body); } catch { return json(400, { ok: false, error: 'Invalid form data.' }); }

    const required = ['fullName','businessName','businessSells','whatsapp','product','traffic','goal'];
    const missing = required.find((field) => !clean(data[field]));
    if (missing) return json(400, { ok: false, error: `Please provide ${missing}.` });

    const lead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fullName: clean(data.fullName, 120),
      businessName: clean(data.businessName, 160),
      businessSells: clean(data.businessSells),
      whatsapp: clean(data.whatsapp, 80),
      website: clean(data.website, 300),
      social: clean(data.social, 300),
      product: clean(data.product),
      traffic: clean(data.traffic, 100),
      goal: clean(data.goal, 160),
      source: 'Sales System 7-Day Free Trial'
    };

    await store.setJSON(`leads/${lead.createdAt}-${lead.id}.json`, lead);

    // Optional email notification. Lead storage succeeds independently of email.
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      const recipient = process.env.LEAD_NOTIFICATION_EMAIL || 'dominionehappy@gmail.com';
      const from = process.env.LEAD_FROM_EMAIL || 'Sales System <onboarding@resend.dev>';
      const text = [
        'NEW 7-DAY FREE TRIAL LEAD', '',
        `Name: ${lead.fullName}`,
        `Business: ${lead.businessName}`,
        `Sells: ${lead.businessSells}`,
        `WhatsApp: ${lead.whatsapp}`,
        `Website: ${lead.website || 'Not provided'}`,
        `Social: ${lead.social || 'Not provided'}`,
        `Main offer: ${lead.product}`,
        `Traffic source: ${lead.traffic}`,
        `Goal: ${lead.goal}`,
        `Submitted: ${lead.createdAt}`
      ].join('\n');
      const mail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [recipient], subject: `New 7-Day Trial: ${lead.businessName}`, text })
      });
      emailSent = mail.ok;
      if (!mail.ok) console.error('Lead email failed:', await mail.text());
    }

    return json(201, { ok: true, saved: true, emailSent, message: 'Your 7-day free trial request has been received.' });
  } catch (error) {
    console.error('TRIAL_FUNCTION_ERROR', error);
    return json(500, { ok: false, error: 'We could not save your trial request. Please try again.' });
  }
};
