import Provider from './Provider.js';

export default class ArxivProvider extends Provider {
    getName() {
        return 'ArXiv';
    }

    matches(url) {
        return url.includes('arxiv.org') && !!this.getId(url);
    }

    getId(url) {
        // Matches /abs/ID or /pdf/ID or /pdf/ID.pdf
        const regex = /arxiv\.org\/(?:abs|pdf)\/([0-9]+\.[0-9]+)(?:v[0-9]+)?/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async getMetadata(paperId) {
        try {
            const response = await fetch(`https://arxiv.org/abs/${paperId}`);
            const text = await response.text();
            // Look for meta tag: <meta name="citation_title" content="..." />
            const metaTitleMatch = text.match(/<meta name="citation_title" content="(.*?)"/);
            if (metaTitleMatch) {
                return { title: metaTitleMatch[1] };
            }
            // Fallback
            const titleMatch = text.match(/<title>\[.*?\] (.*?)<\/title>/);
            return { title: titleMatch ? titleMatch[1] : paperId };
        } catch (e) {
            console.error("Failed to fetch title:", e);
            return { title: paperId };
        }
    }

    getDownloadUrl(paperId) {
        return `https://arxiv.org/pdf/${paperId}.pdf`;
    }
}
