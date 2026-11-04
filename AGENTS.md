# Survival Office Project Instructions

## Commit and push confirmation

- After completing requested changes and verification, do not commit or push automatically.
- Summarize the completed changes and checks, then ask the user: `커밋하고 푸시할까요?`
- Commit and push only after the user explicitly approves.

## New HTML page requirements

- Apply the rules in this section to every new HTML page created anywhere in this repository, including but not limited to `rest`, `work`, `test`, and any future section.
- Every new public page must contain the bottom AdSense unit near the end of `<main>` or the page's main content, immediately before the footer when possible, and must initialize that unit so it can request an ad.
- Do not retrofit or modify existing pages solely to add these snippets unless the user explicitly requests it.
- If an equivalent snippet is already present in a new page or template, do not add a duplicate.
- Keep the publisher ID, Analytics measurement ID, and ad slot ID exactly as written below.

## New personality tests
- Omit standalone test introduction and explanation sections. Keep the title, start button, question count, result interpretation, and search/share metadata.
- Provide a dedicated KakaoTalk result sharing button using the existing site configuration.
- Match the existing Candy personality test monetization layout: top AdSense slot 9705708704, bottom AdSense slot 6135096954, and the bottom Coupang Partners carousel with an affiliate disclosure. Initialize each ad once.

## Search and sharing checks for new content
- Pick a primary search phrase and closely related terms that accurately describe the content. Put the primary phrase naturally in the unique page title, main heading and catalog link text. Use related terms where useful in the meta description and actual questions, results or game text.
- Do not add meta keywords, hidden keyword text, repeated variants, or an extra introduction to satisfy SEO.
- Verify the public canonical URL matches Open Graph and sitemap, the page is discoverable through home and category links, robots rules permit crawling, and the share image and local assets resolve. Use an accurate image alt and page-specific sharing metadata.
- Use test/commute-layer/ as the reference for the illustrated test flow, separate KakaoTalk sharing, top and bottom AdSense, and the bottom Coupang widget with disclosure.

## Public page registration

- Whenever a new public page is created, register it in the repository root `index.html`.
- Also register it in the relevant section index, such as `rest/index.html`, `test/index.html`, or `work/index.html`.
- Add its canonical public URL to the repository root `sitemap.xml` in the same task.
- Whenever an existing public page receives a substantial content, design, or feature update, refresh its `<lastmod>` date in `sitemap.xml` in the same task.
- Keep each sitemap `<loc>` identical to the page's canonical URL, including its trailing slash, and do not create duplicate entries.
- Use the page's creation or update date for `<lastmod>` and do not create duplicate entries.

### Google AdSense loader

Place this code in the document `<head>`:

```html
<!-- Google Adsense 코드 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6532882266109488"
crossorigin="anonymous"></script>
<meta name="google-adsense-account" content="ca-pub-6532882266109488">
```

### Google Analytics

Place this code in the document `<head>`:

```html
<!-- Google Analytics 코드 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-83W9F71F10"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-83W9F71F10');
</script>
```

### Bottom AdSense unit

Place this ad unit at the bottom of the page content:

```html
<!-- 애드센스 광고 -->
<div class="ad-container">
    <ins class="adsbygoogle"
        style="display:block; min-height: 90px;"
        data-ad-client="ca-pub-6532882266109488"
        data-ad-slot="6135096954"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
</div>
<script>
    try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
    } catch (error) {
        console.warn('AdSense initialization deferred.', error);
    }
</script>
```
