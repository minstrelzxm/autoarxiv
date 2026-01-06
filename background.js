// background.js is now a module
import ArxivProvider from './providers/ArxivProvider.js';
import BioRxivProvider from './providers/BioRxivProvider.js';
import GenericPdfProvider from './providers/GenericPdfProvider.js';

const providers = [
    new ArxivProvider(),
    new BioRxivProvider(),
    new GenericPdfProvider()
];

function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
}

const downloadIdMap = {}; // Maps downloadId -> paperId

const activeDownloads = new Set();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {

        // Find matching provider (Async for content check)
        let provider = null;
        for (const p of providers) {
            if (await p.matches(tab.url, tabId)) {
                provider = p;
                break;
            }
        }

        if (!provider) return;

        // Check if enabled
        const settings = await chrome.storage.local.get(['enabled', 'namingConvention', 'downloadFolder', 'downloadedPapers', 'silentMode']);
        if (settings.enabled === false) return;

        const paperId = provider.getId(tab.url);
        if (!paperId) return;

        // Check duplicate (Completed or In-Progress)
        const downloadedPapers = settings.downloadedPapers || {};
        if (downloadedPapers[paperId] || activeDownloads.has(paperId)) {
            console.log(`Already downloaded or in progress: ${paperId} from ${provider.getName()}`);
            return;
        }

        // Add to active set immediately
        activeDownloads.add(paperId);

        const pdfUrl = provider.getDownloadUrl(paperId);

        console.log(`Detected paper [${provider.getName()}]: ${paperId}`);

        // Fetch Title if needed
        let filename = `${sanitizeFilename(paperId)}.pdf`;
        if (settings.namingConvention === 'title') {
            const metadata = await provider.getMetadata(paperId);
            if (metadata && metadata.title) {
                filename = `${sanitizeFilename(metadata.title)}.pdf`;
            }
        }

        // Handle Directory
        const folder = settings.downloadFolder || 'ArxivPapers'; // Keep default name for backward compat, or change to 'Papers'
        const finalPath = folder ? `${folder}/${filename}` : filename;

        console.log(`Starting download for ${paperId}`);

        const isSilent = settings.silentMode !== false;

        chrome.downloads.download({
            url: pdfUrl,
            filename: finalPath,
            conflictAction: 'uniquify',
            saveAs: !isSilent
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Download failed to start:", chrome.runtime.lastError);
            } else {
                downloadIdMap[downloadId] = paperId;
            }
        });
    }
});

// Listen for download completion
chrome.downloads.onChanged.addListener(async (delta) => {
    if (delta.state && delta.state.current === 'complete') {
        const paperId = downloadIdMap[delta.id];
        if (paperId) {
            console.log(`Download complete for ${paperId}`);
            const settings = await chrome.storage.local.get(['downloadedPapers']);
            const downloadedPapers = settings.downloadedPapers || {};

            downloadedPapers[paperId] = Date.now();
            await chrome.storage.local.set({ downloadedPapers });

            delete downloadIdMap[delta.id];
            activeDownloads.delete(paperId);
        }
    } else if (delta.state && delta.state.current === 'interrupted') {
        const paperId = downloadIdMap[delta.id];
        if (paperId) {
            console.log(`Download interrupted/cancelled for ${paperId}`);
            delete downloadIdMap[delta.id];
            activeDownloads.delete(paperId);
        }
    }
});
