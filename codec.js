/* Encodes a greeting into a URL-safe string and back. This is encoding, NOT encryption. */
(function (g) {
  'use strict';
  const MAX = { n: 40, f: 40, m: 280 };
  const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });

  function text(v, max, multi) {
    let s = typeof v === 'string' ? v : '';
    s = multi
      ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
      : s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/ {2,}/g, ' ');
    return Array.from(s.trim()).slice(0, max).join('').trim();
  }
  function clean(o) {
    o = o && typeof o === 'object' ? o : {};
    return { n: text(o.n, MAX.n), f: text(o.f, MAX.f), m: text(o.m, MAX.m, true), l: o.l === 'hi' ? 'hi' : 'en' };
  }
  function encode(d) {
    const bytes = enc.encode(JSON.stringify(Object.assign({ v: 1 }, clean(d))));
    let s = '';
    bytes.forEach(b => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  // Returns a cleaned greeting object, or null for anything malformed.
  function decode(t) {
    try {
      if (typeof t !== 'string' || !/^[A-Za-z0-9_-]{1,4000}$/.test(t)) return null;
      const b64 = t.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - t.length % 4) % 4);
      const o = JSON.parse(dec.decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
      if (!o || o.v !== 1) return null;
      const d = clean(o);
      return d.m ? d : null;
    } catch (e) {
      return null;
    }
  }
  g.Codec = { encode, decode, clean, MAX };
  if (typeof module === 'object' && module.exports) module.exports = g.Codec;
})(typeof window !== 'undefined' ? window : globalThis);
