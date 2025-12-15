# AutoArxiv Downloader

A Chrome Extension that automatically downloads PDFs from ArXiv paper pages.

## Features
- **Auto-Download**: Automatically detects ArXiv Abstract or PDF pages and saves the PDF.
- **Silent Mode**: Downloads in the background without asking (requires configuration).
- **Smart Naming**: Can rename files to the Paper Title (e.g., `Attention Is All You Need.pdf`) instead of the ID.
- **Duplicate Prevention**: Remembers what you've downloaded and skips it next time.
- **Download History**: View and clear your download history in Settings.

## Installation

1.  Clone or download this folder.
2.  Open Chrome and go to `chrome://extensions`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked**.
5.  Select this `autoarxiv` folder.

## Configuration

Click the extension icon to see the popup menu:

-   **Auto-Download**: Toggle ON/OFF to enable or pause the extension globally.
-   **Silent Download**: Toggle ON to attempt downloads without the "Save As" dialog.
-   **Settings**: Click "Open Settings" to configure:
    -   **Destination Folder**: Subdirectory inside your Downloads folder (Default: `ArxivPapers`).
    -   **Naming Convention**: Choose between `ArXiv ID` or `Paper Title`.
    -   **Clear History**: Reset the database of downloaded papers.

## Troubleshooting

### "Save As" Dialog Keeps Popping Up?
If you have enabled "Silent Download" but Chrome still asks you where to save every file, you need to change a browser setting:
1.  Go to `chrome://settings/downloads`.
2.  Turn **OFF** the switch: *"Ask where to save each file before downloading"*.

### Failed to Load Extension?
Ensure you are selecting the folder creating the `manifest.json` file, usually named `autoarxiv`.
