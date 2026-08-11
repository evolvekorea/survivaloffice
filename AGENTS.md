# Survival Office Project Instructions

## New HTML page requirements

- Apply the rules in this section to every new HTML page created in this repository.
- Do not retrofit or modify existing pages solely to add these snippets unless the user explicitly requests it.
- If an equivalent snippet is already present in a new page or template, do not add a duplicate.
- Keep the publisher ID, Analytics measurement ID, and ad slot ID exactly as written below.

## Public page registration

- Whenever a new public page is created, register it in the repository root `index.html`.
- Also register it in the relevant section index, such as `rest/index.html`, `test/index.html`, or `work/index.html`.
- Add its canonical public URL to the repository root `sitemap.xml` in the same task.
- Use the page's creation or update date for `<lastmod>` and do not create duplicate entries.

### Google AdSense loader

Place this code in the document `<head>`:

```html
<!-- Google Adsense 코드 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4957586937754537"
crossorigin="anonymous"></script>
<meta name="google-adsense-account" content="ca-pub-4957586937754537">
```

### Google Analytics

Place this code in the document `<head>`:

```html
<!-- Google Analytics 코드 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-G4TPWGLYLY"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-G4TPWGLYLY');
</script>
```

### Bottom AdSense unit

Place this ad unit at the bottom of the page content:

```html
<!-- 애드센스 광고 -->
<div class="ad-container">
    <ins class="adsbygoogle"
        style="display:block; min-height: 90px;"
        data-ad-client="ca-pub-4957586937754537"
        data-ad-slot="9240598215"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
</div>
```
