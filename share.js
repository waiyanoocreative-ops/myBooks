export default async function handler(req, res) {
  const { book } = req.query;
  const SUPABASE_URL = 'https://ksgxlvrojzawvkkvsbyi.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_BcZTWsRcRYEJ_dtSAg1VnA_VWNE9FSg';

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  let title = 'စာ — ဒစ်ဂျစ်တယ် စာကြည့်တိုက်';
  let description = 'မြန်မာစာအုပ်ကောင်းများကို တစ်နေရာတည်းတွင် အခမဲ့ ဖတ်ရှုနိုင်သော ဒစ်ဂျစ်တယ် စာကြည့်တိုက်';
  let imageUrl = `${origin}/icon.png`;
  const targetUrl = book ? `${origin}/?book=${encodeURIComponent(book)}` : `${origin}/`;

  if (book) {
    try {
      const apiRes = await fetch(
        `${SUPABASE_URL}/rest/v1/books?id=eq.${encodeURIComponent(book)}&select=title,author,description,cover_url,page_count`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      const data = await apiRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const b = data[0];
        title = `${b.title} — ✍️ ${b.author || 'အမည်မသိ'}`;
        description = b.description
          ? b.description.slice(0, 180)
          : `📄 စာမျက်နှာ (${b.page_count || 1}) မျက်နှာ • "စာ" ဒစ်ဂျစ်တယ် စာကြည့်တိုက်တွင် အခမဲ့ ဝင်ရောက်ဖတ်ရှုနိုင်ပါပြီ။`;
        if (b.cover_url) {
          imageUrl = `https://wsrv.nl/?url=${encodeURIComponent(b.cover_url)}&w=600&q=85&output=jpg`;
        }
      }
    } catch (e) {}
  }

  const safeTitle = title.replace(/"/g, '&quot;');
  const safeDesc = description.replace(/"/g, '&quot;');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  res.status(200).send(`<!DOCTYPE html>
<html lang="my">
<head>
  <meta charset="UTF-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta property="og:type" content="book" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${targetUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
  <script>window.location.replace("${targetUrl}");</script>
</head>
<body style="background:#0D0F14;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>စာအုပ်သို့ ပို့ဆောင်နေပါသည်...</p>
</body>
</html>`);
}
