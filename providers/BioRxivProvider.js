import Provider from './Provider.js';

export default class BioRxivProvider extends Provider {
    getName() {
        return 'BioRxiv';
    }

    matches(url) {
        return url.includes('biorxiv.org') && !!this.getId(url);
    }

    getId(url) {
        // Matches /content/DOI/IDvVERSION
        // e.g. https://www.biorxiv.org/content/10.1101/2023.05.07.539762v1
        // or https://www.biorxiv.org/content/10.1101/833400v1
        const regex = /biorxiv\.org\/content\/(10\.1101\/[^/?#]+)/;
        const match = url.match(regex);
        if (match) {
            let id = match[1];
            // Clean up suffixes
            const suffixes = ['.full.pdf', '.full', '.article-info', '.supplementary-material', '.short', '.extract', '.abstract'];
            for (const suffix of suffixes) {
                if (id.endsWith(suffix)) {
                    id = id.slice(0, -suffix.length);
                    // We only strip one suffix (e.g. .full.pdf takes precedence if listed first or we break)
                    // Actually, if we have .full.pdf, we strip it. If we have .full, we strip it.
                    // Let's break after first match to avoid stripping .full twice if we had .full.full (unlikely)
                    break;
                }
            }
            return id;
        }
        return null;
    }

    async getMetadata(paperId) {
        try {
            const response = await fetch(`https://www.biorxiv.org/content/${paperId}`);
            const text = await response.text();

            // BioRxiv metadata
            const metaTitleMatch = text.match(/<meta name="DC.Title" content="(.*?)"/);
            if (metaTitleMatch) {
                return { title: metaTitleMatch[1] };
            }

            const titleMatch = text.match(/<h1[^>]*id="page-title"[^>]*>(.*?)<\/h1>/);
            return { title: titleMatch ? titleMatch[1] : paperId };
        } catch (e) {
            console.error("Failed to fetch title:", e);
            return { title: paperId };
        }
    }

    getDownloadUrl(paperId) {
        return `https://www.biorxiv.org/content/${paperId}.full.pdf`;
    }
}
