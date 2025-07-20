/* continuous-corner.loader.js
 * — loads the Houdini worklet when possible
 * — otherwise places border-radius values instead of the continuous corners
 *   and puts .continuous-rounding--fallback on <html> for styling error messages
 */


(function () {
  const WORKLET = new URL('./continuous-corner.worklet.js', import.meta.url).href;
  const root = document.documentElement;
  const SEL = '.continuous-rounding,[style*="--continuous-rounding"]';
  const CORNERS = [
    '--continuous-rounding-top-left',
    '--continuous-rounding-top-right',
    '--continuous-rounding-bottom-right',
    '--continuous-rounding-bottom-left'
  ];

  function fallback() {
    if (root.classList.contains('continuous-rounding--fallback')) return;

    root.classList.add('continuous-rounding--fallback');
    patchExisting();
    observeNewNodes();
  }

  /* patch everything already in the DOM */
  function patchExisting() {
    document.querySelectorAll(SEL).forEach(applyRadius);
  }

  /* watch the DOM so HTMX/React/etc. also get patched */
  function observeNewNodes() {
    new MutationObserver(ms =>
      ms.forEach(m =>
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches(SEL)) applyRadius(n);
          if (n.querySelectorAll) n.querySelectorAll(SEL).forEach(applyRadius);
        })
      )
    ).observe(document.body, { childList: true, subtree: true });
  }

  /* copy uniform value into missing corners, then write longhands */
  function applyRadius(el) {
    const cs      = getComputedStyle(el);
    const uniform = trim(cs.getPropertyValue('--continuous-rounding'));

    const finals = CORNERS.map(p => {
      const v = trim(cs.getPropertyValue(p));
      return v && v !== 'none' ? v : uniform || '0px';
    });

    el.style.borderTopLeftRadius     = finals[0];
    el.style.borderTopRightRadius    = finals[1];
    el.style.borderBottomRightRadius = finals[2];
    el.style.borderBottomLeftRadius  = finals[3];
  }

  function trim(s) {
    return (s || '').trim();
  }

  /* ------ main ------ */

  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule(WORKLET)
      .then(() => {      // parsed & registerPaint ran
        root.classList.add('continuous-rounding--enabled');
        if (CSS.supports('mask-image', 'paint(continuous-corner)')) return;
        fallback();            // registerPaint failed (flag off, CSP…)
      })
      .catch(fallback);        // 404, network, syntax error …
  } else {
    fallback();                // API missing (Firefox/Safari today)
  }
})();
