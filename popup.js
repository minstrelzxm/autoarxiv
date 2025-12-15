document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enableToggle');
    const silentToggle = document.getElementById('silentToggle');
    const openOptionsBtn = document.getElementById('openOptions');

    // Load saved settings
    chrome.storage.local.get(['enabled', 'silentMode'], (result) => {
        enableToggle.checked = result.enabled !== false; // Default true
        silentToggle.checked = result.silentMode !== false; // Default true
    });

    // Instant Save for Toggles
    enableToggle.addEventListener('change', () => {
        chrome.storage.local.set({ enabled: enableToggle.checked });
    });

    silentToggle.addEventListener('change', () => {
        chrome.storage.local.set({ silentMode: silentToggle.checked });
    });

    document.getElementById('chromeSettingsLink').addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://settings/downloads' });
    });

    // Open Options Page
    openOptionsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
});
