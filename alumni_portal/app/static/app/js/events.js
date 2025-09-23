
        // ---------- Helpers ----------
        const qs = (s, el = document) => el.querySelector(s);
        const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
        const fmt2 = n => n.toString().padStart(2, '0');
        const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // ---------- Intersection observer (updated after rails rebuild) ----------
        let monthIO = null;
        function refreshMonthObserver() {
            if (monthIO) { monthIO.disconnect(); }
            const visibleAnchors = qsa('.month-block.anchor[data-month]').filter(b => b.style.display !== 'none');
            const railLinks = qsa('#railChips a');

            if ('IntersectionObserver' in window) {
                monthIO = new IntersectionObserver((entries) => {
                    // choose the entry nearest to top
                    entries.filter(e => e.isIntersecting)
                        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                        .forEach(e => {
                            const id = e.target.id;
                            railLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href').slice(1) === id));
                        });
                }, { rootMargin: '-140px 0px -70% 0px', threshold: [0, 1] });
                visibleAnchors.forEach(a => monthIO.observe(a));
            }
        }

        // ---------- Filters ----------
        const fType = qs('#fType');
        const fChapter = qs('#fChapter');
        const rangeChips = qsa('.switch .chip');
        const resetBtn = qs('#reset');
        let activeRange = ""; // "", "30", "90", "virtual"

        function withinRange(startISO) {
            if (!activeRange) return true;
            const now = new Date();
            const start = new Date(startISO);
            if (activeRange === 'virtual') return true; // handled separately
            const days = parseInt(activeRange, 10);
            const limit = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
            return start >= now && start <= limit;
        }

        function applyFilters() {
            const t = (fType?.value || '').toLowerCase();
            const c = (fChapter?.value || '').toLowerCase();
            const events = qsa('.event-row');

            events.forEach(ev => {
                const et = (ev.dataset.type || '').toLowerCase();
                const ec = (ev.dataset.chapter || '').toLowerCase();
                const mode = (ev.dataset.mode || '').toLowerCase();
                const isVirtual = mode.includes('virtual');
                const byType = !t || et === t;
                const byChap = !c || ec === c;
                const byRange = withinRange(ev.dataset.start);
                const byVirtual = (activeRange === 'virtual') ? isVirtual : true;
                const ok = byType && byChap && byRange && byVirtual;
                ev.style.display = ok ? '' : 'none';
            });

            updateMonthVisibilityAndRails();
        }

        // ---------- Rebuild rails + hide empty months ----------
        function monthShort(ym) { const m = parseInt((ym || '').split('-')[1] || '1', 10); return MONTHS_SHORT[m - 1] || ''; }

        function updateMonthVisibilityAndRails() {
            const monthBlocks = qsa('.month-block');
            let monthsWithEvents = [];

            monthBlocks.forEach(block => {
                const visibleCount = qsa('.event-row', block).filter(x => x.style.display !== 'none').length;
                const badge = qs('.month-head .badge', block);
                if (badge) {
                    if (block.dataset.month) {
                        badge.textContent = visibleCount ? `${visibleCount} ${visibleCount > 1 ? 'events' : 'event'}` : '0';
                    } else {
                        badge.textContent = String(visibleCount);
                    }
                }

                if (block.dataset.month) {
                    // Real month blocks participate in rail + visibility
                    block.style.display = visibleCount ? '' : 'none';
                    if (visibleCount) {
                        monthsWithEvents.push({ id: block.id, ym: block.dataset.month, short: monthShort(block.dataset.month) });
                    }
                } else {
                    // "Recent Past" or other misc sections
                    block.style.display = visibleCount ? '' : 'none';
                }
            });

            // Build month rail chips
            const rail = qs('#railChips');
            rail.innerHTML = monthsWithEvents.map(m => `<a href="#${m.id}">${m.short}</a>`).join('') || '';

            // Build hero quick months
            const heroMonths = qs('#quicknavMonths');
            heroMonths.innerHTML = monthsWithEvents.map(m => `<a class="chip" href="#${m.id}">${m.short}</a>`).join('');

            // Toggle no-results message
            const noEvents = qs('#noEvents');
            noEvents.style.display = monthsWithEvents.length ? 'none' : '';

            // Refresh active-state observer for the new chips/anchors
            refreshMonthObserver();
        }

        // Chip handlers
        rangeChips.forEach(ch => {
            ch.addEventListener('click', () => {
                rangeChips.forEach(x => x.classList.remove('active'));
                ch.classList.add('active');
                activeRange = ch.dataset.when || "";
                applyFilters();
            });
        });
        if (fType) fType.addEventListener('change', applyFilters);
        if (fChapter) fChapter.addEventListener('change', applyFilters);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (fType) fType.value = '';
                if (fChapter) fChapter.value = '';
                activeRange = '';
                rangeChips.forEach(x => x.classList.remove('active'));
                applyFilters();
            });
        }

        // ---------- Add-to-Calendar (.ics) ----------
        function toICSDate(dt) {
            const d = new Date(dt);
            const YYYY = d.getUTCFullYear();
            const MM = fmt2(d.getUTCMonth() + 1);
            const DD = fmt2(d.getUTCDate());
            const HH = fmt2(d.getUTCHours());
            const MI = fmt2(d.getUTCMinutes());
            const SS = fmt2(d.getUTCSeconds());
            return `${YYYY}${MM}${DD}T${HH}${MI}${SS}Z`;
        }
        function downloadICS(evt) {
            const card = evt.target.closest('.event-row');
            if (!card) return;
            const title = card.dataset.title || 'Event';
            const loc = card.dataset.location || '';
            const dtStart = toICSDate(card.dataset.start);
            const dtEnd = toICSDate(card.dataset.end || card.dataset.start);
            const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@knpcvs`;
            const ics =
                `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KNPCVS Alumni//Events//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICSDate(new Date().toISOString())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${title}
LOCATION:${loc}
END:VEVENT
END:VCALENDAR`;
            const blob = new Blob([ics], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${title.replace(/[^a-z0-9]+/gi, '_')}.ics`;
            document.body.appendChild(a); a.click();
            setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
        }
        qsa('.addCal').forEach(btn => btn.addEventListener('click', downloadICS));

        // ---------- Init ----------
        updateMonthVisibilityAndRails(); // builds rails from existing months
        refreshMonthObserver();         // sets active state tracking
        applyFilters();                 // apply default (no) filters once
    