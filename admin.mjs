import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
const store = getStore({ name: 'sales-system-leads', consistency: 'strong' });
const PASSWORD = () => process.env.ADMIN_PASSWORD || 'ziiraxx12345678919982026';
const json = (statusCode, body, headers = {}) => ({ statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }, body: JSON.stringify(body) });
const token = () => { const p = Buffer.from(JSON.stringify({ exp: Date.now() + 8*60*60*1000, n: crypto.randomBytes(16).toString('hex') })).toString('base64url'); const s = crypto.createHmac('sha256', PASSWORD()).update(p).digest('base64url'); return `${p}.${s}`; };
const valid = (event) => { const c = event.headers.cookie || event.headers.Cookie || ''; const m = c.match(/(?:^|;\s*)sales_admin=([^;]+)/); if (!m) return false; const [p,s] = decodeURIComponent(m[1]).split('.'); if (!p || !s) return false; const e = crypto.createHmac('sha256', PASSWORD()).update(p).digest('base64url'); if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return false; try { return JSON.parse(Buffer.from(p,'base64url').toString()).exp > Date.now(); } catch { return false; } };
export const handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      let b={}; try { b=JSON.parse(event.body||'{}'); } catch {}
      if (b.password !== PASSWORD()) return json(401,{ok:false,error:'Incorrect admin password.'});
      return json(200,{ok:true},{'Set-Cookie':`sales_admin=${encodeURIComponent(token())}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`});
    }
    if (event.httpMethod === 'GET') {
      if (!valid(event)) return json(401,{ok:false,error:'Unauthorized.'});
      const listing = await store.list({ prefix:'leads/' });
      const leads=[];
      for (const item of (listing.blobs||[])) { const lead=await store.get(item.key,{type:'json'}); if(lead) leads.push(lead); }
      leads.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      return json(200,{ok:true,leads});
    }
    return json(405,{ok:false,error:'Method not allowed.'});
  } catch (e) { console.error('ADMIN_FUNCTION_ERROR',e); return json(500,{ok:false,error:'Admin service is temporarily unavailable.'}); }
};
