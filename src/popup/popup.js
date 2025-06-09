document.addEventListener("DOMContentLoaded", () => {
  const signButton = document.getElementById("sign-mode");
  const verifyButton = document.getElementById("verify-mode");

  if (signButton) {
    signButton.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const userIdMatch = /\/u\/(\d+)\//.exec(tab.url);
      const userId = userIdMatch ? userIdMatch[1] : "0";

      chrome.tabs.create({
        url: `https://mail.google.com/mail/u/${userId}/#inbox?compose=new`
      });
    });
  }

  if (verifyButton) {
    verifyButton.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.proofmailManualCheck) {
            window.proofmailManualCheck();
          } else {
            console.error("proofmailManualCheck is not defined");
          }
        }
      });
    });
  }
});
