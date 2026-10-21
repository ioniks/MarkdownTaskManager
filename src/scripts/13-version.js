        // ===== Version & update check (issue #22) =====
        // APP_VERSION is injected by build.mjs from package.json. The update check is one GET to
        // the GitHub releases API — no board data is ever sent. It runs at most once a day, fails
        // silently when offline, and can be turned off in the About dialog.
        const APP_VERSION = '__APP_VERSION__';
        const RELEASES_URL = 'https://github.com/ioniks/MarkdownTaskManager/releases';
        const UPDATE_CHECK_URL = 'https://api.github.com/repos/ioniks/MarkdownTaskManager/releases/latest';
        const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;
        const UPDATE_PREFS_KEY = 'updateCheck';
        let updateCheckState = 'idle'; // 'idle' | 'checking' | 'failed'

        // { enabled, lastCheck, latestTag, latestUrl } persisted in localStorage
        function loadUpdatePrefs() {
            try {
                return { enabled: true, ...JSON.parse(localStorage.getItem(UPDATE_PREFS_KEY) || '{}') };
            } catch (e) {
                return { enabled: true };
            }
        }

        function saveUpdatePrefs(prefs) {
            try { localStorage.setItem(UPDATE_PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* storage blocked */ }
        }

        // Compare "2.0.0" / "V2.0" / "v1.02" style versions numerically: <0, 0, >0
        function compareVersions(a, b) {
            const parts = (v) => String(v).trim().replace(/^v/i, '').split(/[.-]/).map(p => parseInt(p, 10) || 0);
            const pa = parts(a), pb = parts(b);
            for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                const d = (pa[i] || 0) - (pb[i] || 0);
                if (d) return d;
            }
            return 0;
        }

        function isUpdateAvailable(prefs = loadUpdatePrefs()) {
            return !!prefs.latestTag && compareVersions(prefs.latestTag, APP_VERSION) > 0;
        }

        async function checkForUpdates(force = false) {
            const prefs = loadUpdatePrefs();
            if (!force && (!prefs.enabled || Date.now() - (prefs.lastCheck || 0) < UPDATE_CHECK_INTERVAL)) return;
            updateCheckState = 'checking';
            renderAboutBody();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            try {
                const res = await fetch(UPDATE_CHECK_URL, {
                    signal: controller.signal,
                    cache: 'no-store',
                    credentials: 'omit',
                    referrerPolicy: 'no-referrer'
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const release = await res.json();
                saveUpdatePrefs({ ...loadUpdatePrefs(), lastCheck: Date.now(), latestTag: release.tag_name, latestUrl: release.html_url });
                updateCheckState = 'idle';
            } catch (e) {
                // Offline, rate-limited or blocked: stay quiet, keep the last known result
                console.log('Update check failed:', e.message);
                updateCheckState = 'failed';
            } finally {
                clearTimeout(timeout);
            }
            renderVersionBadge();
            renderAboutBody();
        }

        // Header badge: "v2.0.0", highlighted with the new version when an update is known
        function renderVersionBadge() {
            const btn = document.getElementById('versionBtn');
            if (!btn) return;
            const prefs = loadUpdatePrefs();
            const update = isUpdateAvailable(prefs);
            btn.classList.toggle('update-available', update);
            btn.textContent = update ? `v${APP_VERSION} → ${prefs.latestTag}` : `v${APP_VERSION}`;
            btn.title = update ? t('about.updateAvailable', {version: prefs.latestTag}) : t('header.about');
        }

        function openAboutModal() {
            document.getElementById('aboutModalTitle').textContent = t('about.title');
            renderAboutBody();
            document.getElementById('aboutModal').classList.add('active');
        }

        function closeAboutModal() {
            document.getElementById('aboutModal').classList.remove('active');
        }

        function renderAboutBody() {
            const body = document.getElementById('aboutBody');
            if (!body) return;
            const prefs = loadUpdatePrefs();
            let status;
            if (updateCheckState === 'checking') {
                status = t('about.checking');
            } else if (isUpdateAvailable(prefs)) {
                status = `⬆️ ${escapeHtml(t('about.updateAvailable', {version: prefs.latestTag}))}
                    — <a href="${escapeHtml(prefs.latestUrl || RELEASES_URL)}" target="_blank" rel="noopener noreferrer">${t('about.viewRelease')}</a>`;
            } else if (updateCheckState === 'failed') {
                status = t('about.checkFailed');
            } else if (prefs.lastCheck) {
                status = `✅ ${t('about.upToDate')}`;
            } else {
                status = t('about.neverChecked');
            }
            const lastCheck = prefs.lastCheck
                ? t('about.lastChecked', {date: new Date(prefs.lastCheck).toLocaleString()})
                : '';

            body.innerHTML = `
                <p style="margin-bottom: 0.75rem;"><strong>${t('about.version')}</strong> ${escapeHtml(APP_VERSION)}</p>
                <p style="margin-bottom: 0.25rem;">${status}</p>
                <p style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(lastCheck)}</p>
                <button class="btn btn-primary" id="checkUpdatesBtn" ${updateCheckState === 'checking' ? 'disabled' : ''}>${t('about.checkNow')}</button>
                <label style="display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; cursor: pointer;">
                    <input type="checkbox" id="autoUpdateCheck" ${prefs.enabled ? 'checked' : ''}>
                    ${t('about.autoCheck')}
                </label>
                <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">${t('about.privacy')}</p>
                <p style="margin-top: 1rem; font-size: 0.85rem;"><a href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer">${t('about.allReleases')}</a></p>
            `;
            body.querySelector('#checkUpdatesBtn').addEventListener('click', () => checkForUpdates(true));
            body.querySelector('#autoUpdateCheck').addEventListener('change', (e) => {
                saveUpdatePrefs({ ...loadUpdatePrefs(), enabled: e.target.checked });
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderVersionBadge();
            // The badge title is translated; refresh it when the language changes
            document.getElementById('languageSelector').addEventListener('change', renderVersionBadge);
            checkForUpdates();
        });
