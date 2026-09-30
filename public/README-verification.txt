Google Search Console verification
==================================

Two ways to verify this site. Pick ONE.

1) HTML meta tag (easiest if you cannot touch DNS)
   Search Console gives you a string like: abc123xyz...
   Build with it:   GSC_VERIFICATION=abc123xyz npm run build
   It renders <meta name="google-site-verification"> on every page.

2) HTML file upload
   Search Console gives you a file like: google1a2b3c4d5e.html
   Drop that file into this /public folder and rebuild.
   It will be served at https://raghavendrakulkarni.com/google1a2b3c4d5e.html

3) DNS TXT record (BEST — use this if you control the domain)
   Choose "Domain" property instead of "URL prefix" in Search Console.
   Add the TXT record they give you at your domain registrar.
   This covers http, https, www and non-www in one property.
