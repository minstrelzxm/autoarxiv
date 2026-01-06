import Provider from './Provider.js';

export default class GenericPdfProvider extends Provider {
    getName() {
        return 'Generic PDF';
    }

    async matches(url, tabId) {
        // Fast path: Extension check
        const cleanUrl = url.toLowerCase().split('?')[0];
        if (cleanUrl.endsWith('.pdf')) {
            return true;
        }

        // Slow path: Check Content-Type via script injection
        // This handles cases like Nature where the URL doesn't end in .pdf
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.contentType
            });

            if (results && results[0] && results[0].result === 'application/pdf') {
                return true;
            }
        } catch (e) {
            // Script injection might fail on restricted pages (chrome://) or if tab is closed
            // That's fine, we just assume no match
            // console.debug('Script injection failed:', e);
        }

        return false;
    }

    getId(url) {
        // For generic PDFs, the ID is just the URL itself or the filename
        // We returns the full URL as ID to ensure uniqueness in our tracking map
        return url;
    }

    async getMetadata(paperId) {
        // paperId is the URL.
        // Try to extract filename from URL
        const urlObj = new URL(paperId);
        const pathname = urlObj.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

        // Remove .pdf extension for title if present
        let title = filename;
        if (title.toLowerCase().endsWith('.pdf')) {
            title = title.slice(0, -4);
        }

        return { title: decodeURIComponent(title) };
    }

    getDownloadUrl(paperId) {
        return paperId;
    }
}
