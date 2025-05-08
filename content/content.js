(async () => {
    const checkEmailInterval = setInterval(() => {
      const emailBody = document.querySelector('.a3s'); // Gmail email container
      if (emailBody && !document.querySelector('#verifsol-badge')) {
        const emailText = emailBody.innerText;
  
        const signatureLine = emailText.match(/Signature: (.+)/);
        const pubkeyLine = emailText.match(/Signed by: (.+)/);
        const messageLine = emailText.match(/---\n([\s\S]+?)\n---/); // between delimiter
  
        if (signatureLine && pubkeyLine && messageLine) {
          const signature = signatureLine[1].trim();
          const pubkey = pubkeyLine[1].trim();
          const message = messageLine[1].trim();
  
          verifyAndInjectBadge(message, signature, pubkey, emailBody);
          clearInterval(checkEmailInterval);
        }
      }
    }, 2000);
  
    async function verifyAndInjectBadge(message, signature, pubkey, container) {
      const isValid = await window.verifySignature(message, signature, pubkey);
      const badge = document.createElement('div');
      badge.id = 'verifsol-badge';
      badge.innerText = isValid
        ? '✅ VerifSol: Identity Verified'
        : '❌ VerifSol: Signature Invalid';
      badge.style = 'padding:8px;font-weight:bold;color:white;background:green;margin-bottom:10px;';
      container.prepend(badge);
    }
  })();
  