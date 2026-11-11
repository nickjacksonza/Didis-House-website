/*
  Office hours for phone calls: Monday to Friday, 09:00 to 17:00, Johannesburg time (SAST, UTC+2, no daylight saving).

  Elements marked data-office-only are shown only during office hours (they start hidden in the HTML, so the number stays hidden without JavaScript).
  Elements marked data-after-hours are shown only outside office hours.
  A .callback element gets a day and time picker that opens WhatsApp with a call-back request.
  Elements marked data-hours-status get a short open/closed line.

  To preview either state, add ?hours=open or ?hours=closed to the page URL.
*/
(function () {
  'use strict';

  var WA_NUMBER = '27823052664';
  var OPEN_HOUR = 9, CLOSE_HOUR = 17;          // 09:00 to 17:00
  var SLOT_MINUTES = 30;                       // call-back times every 30 minutes
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var override = (location.search.match(/[?&]hours=(open|closed)\b/) || [])[1];

  // Current Johannesburg wall-clock time, read with getUTC* methods.
  function nowSast() { return new Date(Date.now() + 2 * 3600 * 1000); }
  function isWeekday(d) { var w = d.getUTCDay(); return w >= 1 && w <= 5; }
  function minutesOf(d) { return d.getUTCHours() * 60 + d.getUTCMinutes(); }

  function isOpen(d) {
    if (override) return override === 'open';
    var m = minutesOf(d);
    return isWeekday(d) && m >= OPEN_HOUR * 60 && m < CLOSE_HOUR * 60;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function timeLabel(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function dayLabel(d) { return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; }

  // Call-back slots still available on day d (all of them, unless d is today).
  function slotsFor(d, now) {
    var slots = [];
    var sameDay = d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
    var earliest = sameDay ? minutesOf(now) + 60 : 0;   // at least an hour's notice today
    for (var m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += SLOT_MINUTES) {
      if (m >= earliest) slots.push(m);
    }
    return slots;
  }

  // The next five weekdays that still have a slot.
  function businessDays(now) {
    var days = [];
    var d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    while (days.length < 5) {
      if (isWeekday(d) && slotsFor(d, now).length) days.push(new Date(d));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return days;
  }

  function nextOpening(now) {
    var d = businessDays(now)[0];
    var sameDay = d.getUTCDate() === now.getUTCDate() && d.getUTCMonth() === now.getUTCMonth();
    var tomorrow = new Date(now); tomorrow.setUTCDate(now.getUTCDate() + 1);
    var isTomorrow = d.getUTCDate() === tomorrow.getUTCDate() && d.getUTCMonth() === tomorrow.getUTCMonth();
    return (sameDay ? 'today' : isTomorrow ? 'tomorrow' : DAYS[d.getUTCDay()]) + ' at 9am';
  }

  function injectStyles() {
    if (document.getElementById('hours-css')) return;
    var css =
      '.callback{margin-top:22px;text-align:left;max-width:520px;margin-left:auto;margin-right:auto}' +
      '.callback p{margin:0 0 12px}' +
      '.callback .cb-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}' +
      '.callback label{display:flex;flex-direction:column;gap:6px;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--cream-faint,#bbb);flex:1 1 150px;margin:0}' +
      '.callback select{font:inherit;font-size:15px;letter-spacing:normal;text-transform:none;color:var(--cream,#f2ead9);background:rgba(255,255,255,.04);border:1px solid var(--line,#444);border-radius:4px;padding:11px 12px;width:100%}' +
      '.callback select option{color:#111}' +
      '.callback a.cb-send.btn{flex:1 1 100%;text-align:center;margin-top:4px;color:#1d130a;font-size:11px}' +
      '.callback .cb-alt{margin-top:12px;font-size:14px;color:var(--cream-faint,#bbb)}' +
      '.callback .cb-alt a{text-decoration:underline}';
    var s = document.createElement('style');
    s.id = 'hours-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildPicker(box) {
    if (box.dataset.built) return;
    box.dataset.built = '1';
    var formLink = box.getAttribute('data-form-link');
    box.innerHTML =
      '<p>Prefer a call? Pick a weekday time and I&rsquo;ll call you back.</p>' +
      '<div class="cb-row">' +
      '<label>Day<select class="cb-day"></select></label>' +
      '<label>Time<select class="cb-time"></select></label>' +
      '<a class="btn btn-fill cb-send" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + WA_NUMBER + '">Request a call back on WhatsApp</a>' +
      '</div>' +
      (formLink ? '<p class="cb-alt">Or <a href="' + formLink + '">send a message with the contact form</a>.</p>' : '');

    var daySel = box.querySelector('.cb-day');
    var timeSel = box.querySelector('.cb-time');
    var send = box.querySelector('.cb-send');

    function fillDays() {
      var now = nowSast();
      var prev = daySel.value;
      daySel.innerHTML = '';
      businessDays(now).forEach(function (d) {
        var o = document.createElement('option');
        o.value = d.toISOString();
        o.textContent = dayLabel(d);
        daySel.appendChild(o);
      });
      if (prev && daySel.querySelector('option[value="' + prev + '"]')) daySel.value = prev;
      fillTimes();
    }
    function fillTimes() {
      var prev = timeSel.value;
      timeSel.innerHTML = '';
      slotsFor(new Date(daySel.value), nowSast()).forEach(function (m) {
        var o = document.createElement('option');
        o.value = timeLabel(m);
        o.textContent = timeLabel(m);
        timeSel.appendChild(o);
      });
      if (prev && timeSel.querySelector('option[value="' + prev + '"]')) timeSel.value = prev;
      updateLink();
    }
    function updateLink() {
      var day = daySel.options[daySel.selectedIndex].textContent;
      var text = "Hi Didi's House! Please call me back on " + day + ' at ' + timeSel.value +
        ' (Johannesburg time). It\'s about: ';
      send.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
    }

    daySel.addEventListener('change', fillTimes);
    timeSel.addEventListener('change', updateLink);
    box._refresh = fillDays;
    fillDays();
  }

  function apply() {
    var now = nowSast();
    var open = isOpen(now);
    document.documentElement.classList.toggle('office-open', open);
    document.querySelectorAll('[data-office-only]').forEach(function (el) { el.hidden = !open; });
    document.querySelectorAll('[data-after-hours]').forEach(function (el) { el.hidden = open; });
    document.querySelectorAll('[data-hours-status]').forEach(function (el) {
      el.textContent = open
        ? 'Open now. Calls are welcome until 5pm.'
        : 'Closed now. Calls resume ' + nextOpening(now) + '.';
    });
    if (!open) {
      injectStyles();
      document.querySelectorAll('.callback').forEach(function (box) {
        if (box.dataset.built && box._refresh) box._refresh(); else buildPicker(box);
      });
    }
  }

  function start() {
    apply();
    // Re-check each minute so an open page switches at 9am and 5pm.
    // Skipped while a picker has focus, so a visitor's choice isn't reset under them.
    setInterval(function () {
      if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.callback')) return;
      apply();
    }, 60 * 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
