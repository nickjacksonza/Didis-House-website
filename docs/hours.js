/*
  Shows the phone number only during office hours: Monday to Friday,
  09:00 to 17:00, Johannesburg time (SAST, UTC+2, no daylight saving).

  data-office-only  shown only during office hours (hidden in the HTML,
                    so the number stays hidden without JavaScript)
  data-after-hours  shown only outside office hours (visible in the HTML)

  To preview either state, add ?hours=open or ?hours=closed to the URL.
*/
(function () {
  'use strict';

  var OPEN_HOUR = 9, CLOSE_HOUR = 17;
  var override = (location.search.match(/[?&]hours=(open|closed)\b/) || [])[1];

  function isOpen() {
    if (override) return override === 'open';
    var d = new Date(Date.now() + 2 * 3600 * 1000);   // Johannesburg wall-clock time, read with getUTC*
    var day = d.getUTCDay(), h = d.getUTCHours();
    return day >= 1 && day <= 5 && h >= OPEN_HOUR && h < CLOSE_HOUR;
  }

  function apply() {
    var open = isOpen();
    document.querySelectorAll('[data-office-only]').forEach(function (el) { el.hidden = !open; });
    document.querySelectorAll('[data-after-hours]').forEach(function (el) { el.hidden = open; });
  }

  function start() {
    apply();
    setInterval(apply, 60 * 1000);   // so an open page switches at 9am and 5pm
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
