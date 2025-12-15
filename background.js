// background.js

function getArxivId(url) {
    // Matches /abs/ID or /pdf/ID or /pdf/ID.pdf
    const regex = /arxiv\.org\/(?:abs|pdf)\/([0-9]+\.[0-9]+)(?:v[0-9]+)?/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function fetchTitleFromAbstract(arxivId) {
    try {
        const response = await fetch(`https://arxiv.org/abs/${arxivId}`);
        const text = await response.text();
        // Simple regex to find title. Title is usually in <title>...</title> but contains "Service Name > Title"
        // Or better, look for meta tag: <meta name="citation_title" content="..." />
        const metaTitleMatch = text.match(/<meta name="citation_title" content="(.*?)"/);
        if (metaTitleMatch) {
            return metaTitleMatch[1];
        }
        // Fallback
        const titleMatch = text.match(/<title>\[.*?\] (.*?)<\/title>/);
        return titleMatch ? titleMatch[1] : arxivId;
    } catch (e) {
        console.error("Failed to fetch title:", e);
        return arxivId;
    }
}

function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
}

const downloadIdMap = {}; // Maps downloadId -> arxivId

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('arxiv.org')) {

        // Check if enabled
        const settings = await chrome.storage.local.get(['enabled', 'namingConvention', 'downloadFolder', 'downloadedPapers', 'silentMode']);
        if (settings.enabled === false) return; // Default is true if undefined, but let's be strict if explicitly false

        const arxivId = getArxivId(tab.url);
        if (!arxivId) return;

        // Check duplicate
        const downloadedPapers = settings.downloadedPapers || {};
        if (downloadedPapers[arxivId]) {
            console.log(`Already downloaded: ${arxivId}`);
            return;
        }

        // Determine Logic
        const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;

        // Fetch Title if needed
        let filename = `${arxivId}.pdf`;
        if (settings.namingConvention === 'title') {
            const title = await fetchTitleFromAbstract(arxivId);
            filename = `${sanitizeFilename(title)}.pdf`;
        }

        // Handle Directory
        const folder = settings.downloadFolder || 'ArxivPapers';
        const finalPath = folder ? `${folder}/${filename}` : filename;

        console.log(`Starting download for ${arxivId}`);

        // Default silentMode to TRUE if not set
        const isSilent = settings.silentMode !== false;

        chrome.downloads.download({
            url: pdfUrl,
            filename: finalPath,
            conflictAction: 'uniquify',
            saveAs: !isSilent // If silent is true, saveAs is false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Download failed to start:", chrome.runtime.lastError);
            } else {
                // Track this download
                downloadIdMap[downloadId] = arxivId;
            }
        });

    }
});

// Listen for download completion to mark as "Downloaded"
chrome.downloads.onChanged.addListener(async (delta) => {
    if (delta.state && delta.state.current === 'complete') {
        const arxivId = downloadIdMap[delta.id];
        if (arxivId) {
            console.log(`Download complete for ${arxivId}`);
            const settings = await chrome.storage.local.get(['downloadedPapers']);
            const downloadedPapers = settings.downloadedPapers || {};

            downloadedPapers[arxivId] = Date.now();
            await chrome.storage.local.set({ downloadedPapers });

            delete downloadIdMap[delta.id]; // Cleanup
        }
    } else if (delta.state && delta.state.current === 'interrupted') {
        // If failed/cancelled, remove from tracking so we can try again next time
        if (downloadIdMap[delta.id]) {
            console.log(`Download interrupted/cancelled for ${downloadIdMap[delta.id]}`);
            delete downloadIdMap[delta.id];
        }
    }
});
