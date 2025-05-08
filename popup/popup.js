document.addEventListener("DOMContentLoaded", () => {
    const signBtn = document.getElementById("sign-mode");
    const verifyBtn = document.getElementById("verify-mode");
  
    if (signBtn) {
      signBtn.addEventListener("click", () => {
        chrome.tabs.create({
          url: "https://mail.google.com/mail/u/0/#inbox?compose=new"
        });
      });
    }
  
    if (verifyBtn) {
      verifyBtn.addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["scripts/manual-verify.js"]
        });
      });
    }
  });
  