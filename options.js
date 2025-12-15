document.addEventListener('DOMContentLoaded', () => {
    const folderInput = document.getElementById('folderName');
    const namingSelect = document.getElementById('namingSelect');
    const saveBtn = document.getElementById('save');
    const status = document.getElementById('status');

    const clearBtn = document.getElementById('clearHistory');
    const clearStatus = document.getElementById('clearStatus');
    const historyList = document.getElementById('historyList');

    function renderHistory(downloadedPapers) {
        historyList.innerHTML = '';
        const ids = Object.keys(downloadedPapers || {});
        if (ids.length === 0) {
            historyList.innerHTML = '<div style="color: #999; font-style: italic;">No papers downloaded yet.</div>';
            return;
        }

        // Sort by date new to old? Date is value
        ids.sort((a, b) => downloadedPapers[b] - downloadedPapers[a]);

        ids.forEach(id => {
            const date = new Date(downloadedPapers[id]).toLocaleString();
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.style.borderBottom = '1px solid #eee';
            div.style.paddingBottom = '2px';
            div.innerHTML = `<strong>${id}</strong> <span style="color:#888; font-size:11px;">(${date})</span>`;
            historyList.appendChild(div);
        });
    }

    // Load
    chrome.storage.local.get(['downloadFolder', 'namingConvention', 'downloadedPapers'], (result) => {
        folderInput.value = result.downloadFolder || 'ArxivPapers';
        namingSelect.value = result.namingConvention || 'id';
        renderHistory(result.downloadedPapers);
    });

    // Save
    saveBtn.addEventListener('click', () => {
        const folder = folderInput.value.trim().replace(/[^a-zA-Z0-9_\-]/g, ''); // Simple sanitize
        const naming = namingSelect.value;

        chrome.storage.local.set({
            downloadFolder: folder,
            namingConvention: naming
        }, () => {
            status.textContent = "Settings Saved!";
            status.style.display = 'block';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
        });
    });

    // Clear History
    clearBtn.addEventListener('click', () => {
        // Removed confirm dialog to prevent blocking issues
        chrome.storage.local.set({ downloadedPapers: {} }, () => {
            clearStatus.textContent = "History Cleared.";
            renderHistory({});
            setTimeout(() => { clearStatus.textContent = ""; }, 2000);
        });
    });
});
