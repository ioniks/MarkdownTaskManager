        // ===== Auto-reload when kanban.md / archive.md change on disk (issue #25) =====
        // AI assistants, editors and `git pull` change the files behind the app's back. We remember
        // a stamp (lastModified + size) of each file whenever we read or write it, poll the handles
        // every few seconds (and react at once to a FileSystemObserver where the browser has one),
        // and reload the board when a stamp differs. Before every save the stamp is checked again,
        // so a stale board can no longer silently overwrite external edits.
        const FILE_WATCH_INTERVAL = 3000;
        const FILE_SETTLE_DELAY = 300; // let another program finish writing before we read
        const AUTO_RELOAD_KEY = 'autoReload';
        const fileStamps = { kanban: null, archive: null };
        let fileWriteQueue = Promise.resolve();
        let fileCheckRunning = false;
        let fileReloadRunning = false;
        let fileObserver = null;
        let observedDirectory = null;
        let dismissedChangeStamp = null;

        function fileStamp(file) {
            return `${file.lastModified}:${file.size}`;
        }

        function fileHandleFor(which) {
            return which === 'kanban' ? kanbanFileHandle : archiveFileHandle;
        }

        // Current stamp of a file on disk, or null if there is no handle / the file is missing
        async function readFileStamp(which) {
            const handle = fileHandleFor(which);
            if (!handle) return null;
            try {
                return fileStamp(await handle.getFile());
            } catch (e) {
                return null;
            }
        }

        async function rememberFileStamp(which) {
            fileStamps[which] = await readFileStamp(which);
        }

        // Run file writes one after another: overlapping saves would otherwise see each other's
        // fresh stamps as external changes.
        function withFileLock(fn) {
            const run = fileWriteQueue.then(fn, fn);
            fileWriteQueue = run.catch(() => {});
            return run;
        }

        // Called right before a save. Returns true when it is safe to write: the file is unchanged
        // since we last read/wrote it, or the user chose to overwrite the external change. On
        // "Cancel" the save is skipped and the board reloads from disk instead.
        async function confirmOverwriteIfChanged(which) {
            const known = fileStamps[which];
            const current = await readFileStamp(which);
            if (!known || !current || current === known) return true;
            const name = which === 'kanban' ? 'kanban.md' : 'archive.md';
            if (confirm(t('confirm.fileChangedOnDisk', {file: name}))) return true;
            setTimeout(() => reloadFromDisk(), 0);
            return false;
        }

        function autoReloadEnabled() {
            try { return localStorage.getItem(AUTO_RELOAD_KEY) !== 'off'; } catch (e) { return true; }
        }

        function toggleAutoReload() {
            const enable = !autoReloadEnabled();
            try { localStorage.setItem(AUTO_RELOAD_KEY, enable ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
            renderAutoReloadButton();
            showNotification(t(enable ? 'notif.autoReloadOn' : 'notif.autoReloadOff'), 'success');
            if (enable) checkFilesOnDisk();
            else hideReloadBanner();
        }

        function renderAutoReloadButton() {
            const btn = document.getElementById('autoReloadBtn');
            if (!btn) return;
            const on = autoReloadEnabled();
            btn.classList.toggle('is-off', !on);
            btn.title = t(on ? 'header.autoReloadOn' : 'header.autoReloadOff');
        }

        // Is the user in the middle of something a reload would yank away? (open dialog other than
        // the read-only archive list, or a drag in progress)
        function isUserBusy() {
            const dialogOpen = [...document.querySelectorAll('.modal.active')].some(m => m.id !== 'archiveModal');
            return dialogOpen || !!document.querySelector('.task-card.dragging');
        }

        async function diskStamps() {
            return { kanban: await readFileStamp('kanban'), archive: await readFileStamp('archive') };
        }

        // A file counts as changed when it exists and its stamp differs from the last known one.
        // A file that is (momentarily) missing — e.g. during a git checkout — is ignored.
        function changedFiles(stamps) {
            return ['kanban', 'archive'].filter(w => stamps[w] && fileStamps[w] && stamps[w] !== fileStamps[w]);
        }

        async function checkFilesOnDisk() {
            if (fileCheckRunning || fileReloadRunning || !kanbanFileHandle || !autoReloadEnabled() || document.hidden) return;
            fileCheckRunning = true;
            try {
                if (observedDirectory !== directoryHandle) observeDirectory();
                await fileWriteQueue; // never compare against one of our own writes in progress
                const first = await diskStamps();
                if (changedFiles(first).length === 0) return;
                // Another program may still be writing: only act once the stamps have settled
                await new Promise(r => setTimeout(r, FILE_SETTLE_DELAY));
                const second = await diskStamps();
                if (JSON.stringify(first) !== JSON.stringify(second) || changedFiles(second).length === 0) return;
                if (fileReloadRunning) return; // a reload started meanwhile (e.g. banner click)
                if (isUserBusy()) {
                    showReloadBanner(JSON.stringify(second));
                } else {
                    await reloadFromDisk();
                }
            } catch (e) {
                console.warn('File check failed:', e);
            } finally {
                fileCheckRunning = false;
            }
        }

        async function reloadFromDisk() {
            if (fileReloadRunning) return;
            fileReloadRunning = true;
            try {
                await reloadBoardFromDisk();
            } finally {
                fileReloadRunning = false;
            }
        }

        async function reloadBoardFromDisk() {
            await fileWriteQueue;
            hideReloadBanner();
            if (!kanbanFileHandle || !(await readFileStamp('kanban'))) {
                // Never let loadKanbanFile() recreate a default kanban.md over a missing file
                showNotification(t('notif.reloadFailed'), 'error');
                return;
            }
            const detailOpen = document.getElementById('taskModal').classList.contains('active');
            const openTaskId = detailOpen && !wasArchiveModalActive && currentDetailTask ? currentDetailTask.id : null;

            await loadKanbanFile(); // re-reads kanban.md and archive.md, re-renders the board

            if (document.getElementById('archiveModal').classList.contains('active')) {
                renderArchiveList(document.getElementById('archiveSearch').value);
            }
            // Keep an open task dialog in sync with the reloaded task (or close it if it is gone)
            if (openTaskId && document.getElementById('taskModal').classList.contains('active')) {
                const task = tasks.find(t => t.id === openTaskId);
                if (task) showTaskDetail(task);
                else closeModal();
            }
            showNotification(t('notif.reloadedFromDisk'), 'success');
        }

        function showReloadBanner(changeStamp) {
            if (changeStamp === dismissedChangeStamp) return;
            const banner = document.getElementById('reloadBanner');
            banner.dataset.changeStamp = changeStamp;
            document.getElementById('reloadBannerText').textContent = t('banner.fileChanged');
            document.getElementById('reloadBannerBtn').textContent = t('banner.reload');
            document.getElementById('reloadBannerDismiss').textContent = t('banner.dismiss');
            banner.classList.add('show');
        }

        function hideReloadBanner() {
            document.getElementById('reloadBanner').classList.remove('show');
        }

        function dismissReloadBanner() {
            dismissedChangeStamp = document.getElementById('reloadBanner').dataset.changeStamp || null;
            hideReloadBanner();
        }

        // FileSystemObserver (Chromium 129+) reports changes immediately; polling stays as the
        // fallback for browsers without it and for changes the observer misses.
        async function observeDirectory() {
            observedDirectory = directoryHandle;
            if (fileObserver) {
                fileObserver.disconnect();
                fileObserver = null;
            }
            if (!directoryHandle || !('FileSystemObserver' in window)) return;
            try {
                fileObserver = new FileSystemObserver(() => checkFilesOnDisk());
                await fileObserver.observe(directoryHandle);
            } catch (e) {
                console.log('FileSystemObserver unavailable, polling only:', e.message);
                fileObserver = null;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderAutoReloadButton();
            document.getElementById('languageSelector').addEventListener('change', renderAutoReloadButton);
            document.getElementById('reloadBannerBtn').addEventListener('click', () => reloadFromDisk());
            document.getElementById('reloadBannerDismiss').addEventListener('click', dismissReloadBanner);
            setInterval(checkFilesOnDisk, FILE_WATCH_INTERVAL);
            document.addEventListener('visibilitychange', () => { if (!document.hidden) checkFilesOnDisk(); });
            window.addEventListener('focus', checkFilesOnDisk);
        });
