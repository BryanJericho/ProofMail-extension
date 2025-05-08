// === Inject Phantom connector ===
const script = document.createElement("script");
script.src = chrome.runtime.getURL("scripts/injector.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);

// === Tombol SIGN saat compose ===
const composeInterval = setInterval(() => {
  const toolbar = document.querySelector(".aeJ");
  if (toolbar && !document.querySelector("#verifsol-sign-btn")) {
    const btn = document.createElement("button");
    btn.innerText = "🔏 VerifSol Sign Email";
    btn.id = "verifsol-sign-btn";
    btn.style = "margin:8px;padding:6px 12px;border:none;background:#4bde7f;color:#fff;font-weight:bold;border-radius:6px;cursor:pointer;";
    toolbar.prepend(btn);

    btn.onclick = () => {
      const emailBodyEl = document.querySelector('.Am.Al.editable');
      if (!emailBodyEl) {
        alert("Email body not found");
        return;
      }

      const message = emailBodyEl.innerText;

      window.postMessage({
        type: "VERIFSOLSIGN",
        message: message
      }, "*");

      window.addEventListener("message", (event) => {
        if (event.data.type === "VERIFSOLSIGNED") {
          const sig = event.data.signature;
          const pubKey = event.data.publicKey;

          const signatureBlock = `\n\n---\n${message}\nSigned by: ${pubKey}\nSignature: ${sig}\n---`;
          emailBodyEl.innerText += signatureBlock;

          alert("✅ Email signed and footer added!");
        }
      });
    };

    clearInterval(composeInterval);
  }
}, 1000);

// === Trusted public keys map ===
const trustedSenders = {
  "DaB55UmS5wTrGCko7FxVpRmZhUgVRVWfGf1xkcm9AXzi": {
    name: "Bryan Jericho"
  }
};

// === Fungsi verifikasi & tampilkan badge ===
async function verifyAndBadge(message, signature, pubKey, container) {
  const msgBytes = new TextEncoder().encode(message);
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

  const bs58 = await import("https://cdn.jsdelivr.net/npm/bs58/+esm");
  const pubKeyBytes = bs58.default.decode(pubKey);

  const nacl = await import('https://cdn.jsdelivr.net/npm/tweetnacl/+esm');
  const isValid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);

  const senderInfo = trustedSenders[pubKey];
  const senderName = senderInfo ? senderInfo.name : pubKey.slice(0, 10) + "...";

  const oldBadge = document.querySelector("#verifsol-verify-badge");
  if (oldBadge) oldBadge.remove();

  const badge = document.createElement("div");
  badge.id = "verifsol-verify-badge";
  badge.innerHTML = isValid
    ? `<div style="font-weight:bold;padding:8px;background:#22c55e;color:white;border-radius:6px;margin-bottom:10px;">
        ✅ VerifSol: Verified sender — <strong>${senderName}</strong><br>
        🔗 Wallet: ${pubKey.slice(0, 20)}...
       </div>`
    : `<div style="font-weight:bold;padding:8px;background:#ef4444;color:white;border-radius:6px;margin-bottom:10px;">
        ❌ VerifSol: Invalid Signature
       </div>`;

  container.prepend(badge);
}

// === Verifikasi otomatis saat email dibuka ===
const emailCheckInterval = setInterval(() => {
  const emailView = document.querySelector('.a3s');
  if (emailView && !document.querySelector('#verifsol-verify-badge')) {
    const emailText = emailView.innerText;

    const signatureMatch = emailText.match(/Signature: (.+)/);
    const pubkeyMatch = emailText.match(/Signed by: (.+)/);
    const messageMatch = emailText.match(/---\n([\s\S]+?)\nSigned by:/);

    if (signatureMatch && pubkeyMatch && messageMatch) {
      const signature = signatureMatch[1].trim();
      const pubKey = pubkeyMatch[1].trim();
      const message = messageMatch[1].trim();

      verifyAndBadge(message, signature, pubKey, emailView);
      clearInterval(emailCheckInterval);
    }
  }
}, 2000);

// === Verifikasi manual dari popup ===
window.verifsolManualCheck = async function () {
  const emailView = document.querySelector('.a3s');
  if (!emailView) return alert("❌ Tidak menemukan isi email.");

  const emailText = emailView.innerText;

  const signatureMatch = emailText.match(/Signature: (.+)/);
  const pubkeyMatch = emailText.match(/Signed by: (.+)/);
  const messageMatch = emailText.match(/---\n([\s\S]+?)\nSigned by:/);

  if (!signatureMatch || !pubkeyMatch || !messageMatch) {
    return alert("❌ Tanda tangan tidak ditemukan.");
  }

  const signature = signatureMatch[1].trim();
  const pubKey = pubkeyMatch[1].trim();
  const message = messageMatch[1].trim();

  verifyAndBadge(message, signature, pubKey, emailView);
};
