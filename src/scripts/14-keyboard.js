        // ===== Keyboard support =====
        // Esc closes the dialog on top (issue #23). Dialogs are .modal elements shown with .active.
        // Dialogs without an entry here are simply hidden.
        const modalClosers = {
            taskModal: () => closeModal(), // also brings back the archive if opened from there
            newTaskModal: () => {
                if (isTaskFormDirty() && !confirm(t('confirm.discardChanges'))) return;
                closeTaskModal();
            },
            columnsModal: () => closeColumnsModal(),
            archiveModal: () => closeArchiveModal()
        };

        // Dialogs share one z-index, so the DOM order (not the opening order) decided which one was
        // drawn on top. Record the opening order and raise each newly opened dialog above the
        // others, so the one drawn on top is also the one Esc closes.
        let modalOpenCounter = 0;
        const modalObserver = new MutationObserver(records => {
            records.forEach(({ target: modal }) => {
                if (modal.classList.contains('active')) {
                    if (!modal.dataset.openOrder) {
                        modal.dataset.openOrder = ++modalOpenCounter;
                        modal.style.zIndex = 1000 + modalOpenCounter;
                    }
                } else if (modal.dataset.openOrder) {
                    delete modal.dataset.openOrder;
                    modal.style.zIndex = '';
                }
            });
            if (!document.querySelector('.modal.active')) modalOpenCounter = 0;
        });
        document.querySelectorAll('.modal').forEach(modal =>
            modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] }));

        function topActiveModal() {
            const open = [...document.querySelectorAll('.modal.active')];
            open.sort((a, b) => (+a.dataset.openOrder || 0) - (+b.dataset.openOrder || 0));
            return open.length ? open[open.length - 1] : null;
        }

        function closeTopModal() {
            const modal = topActiveModal();
            if (!modal) return false;
            const closer = modalClosers[modal.id];
            if (closer) closer();
            else modal.classList.remove('active');
            return true;
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || e.isComposing || e.defaultPrevented) return;
            if (closeTopModal()) e.preventDefault();
        });
