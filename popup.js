// popup.js
// Handles the logic for the extension's popup interface.

document.getElementById('extractBtn').addEventListener('click', () => {
  const status = document.getElementById('status');
  const notionMode = document.getElementById('notionMode').checked;
  status.textContent = 'Extracting...';

  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tabs[0].id, { 
      action: "extractContent", 
      notionMode: notionMode 
    }, (response) => {
      // Handle the response from the content script
      if (chrome.runtime.lastError) {
        status.textContent = 'Error extracting.';
        console.error(chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.data) {
        const markdown = response.data;
        // Use the Clipboard API to write the markdown text
        navigator.clipboard.writeText(markdown).then(() => {
          status.textContent = 'Copied to clipboard!';
          setTimeout(() => { status.textContent = ''; }, 2000); // Clear status after 2s
        }).catch(err => {
          status.textContent = 'Failed to copy.';
          console.error('Failed to copy text: ', err);
        });
      } else {
        status.textContent = 'No content found.';
      }
    });
  });
});
