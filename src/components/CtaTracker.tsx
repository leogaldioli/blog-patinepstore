import Script from "next/script";

export default function CtaTracker({ slug }: { slug: string }) {
  const code = `
(function() {
  var slug = ${JSON.stringify(slug)};
  function attach() {
    var links = document.querySelectorAll('.cta-box a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.__ctaTracked) continue;
      a.__ctaTracked = true;
      a.addEventListener('click', function(e) {
        var el = e.currentTarget;
        (window.dataLayer = window.dataLayer || []).push({
          event: 'cta_click',
          campaign: slug,
          link_url: el.href,
          link_text: (el.textContent || '').trim()
        });
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
`;
  return (
    <Script id={`cta-tracker-${slug}`} strategy="afterInteractive">
      {code}
    </Script>
  );
}
