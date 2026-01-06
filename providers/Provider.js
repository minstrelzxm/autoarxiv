/**
 * Base Provider Class
 * Interfaces for paper providers.
 */
export default class Provider {
    /**
     * @returns {string} Name of the provider
     */
    getName() {
        return 'Base';
    }

    /**
     * Checks if the URL matches this provider
     * @param {string} url 
     * @param {number} tabId
     * @returns {Promise<boolean>|boolean}
     */
    matches(url, tabId) {
        return false;
    }

    /**
     * Extract or generate a unique ID for the paper from the URL
     * @param {string} url 
     * @returns {string|null}
     */
    getId(url) {
        return null;
    }

    /**
     * Get title and other metadata
     * @param {string} paperId 
     * @returns {Promise<{title: string}>}
     */
    async getMetadata(paperId) {
        return { title: paperId };
    }

    /**
     * Get the download URL for the PDF
     * @param {string} paperId 
     * @returns {string}
     */
    getDownloadUrl(paperId) {
        return null;
    }
}
