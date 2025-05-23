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
    btn.innerText = "VerifSol Sign Email";
    btn.id = "verifsol-sign-btn";
    // --- START: Perubahan gaya tombol ---
    btn.style.cssText = `
      margin: 8px;
      padding: 8px 16px; /* Padding sedikit lebih besar */
      border: none;
      background: linear-gradient(45deg, #007BFF 0%, #0056b3 100%); /* Gradien biru yang sama dengan tombol utama di popup */
      color: white;
      font-weight: 600; /* Font weight yang konsisten */
      border-radius: 8px; /* Border radius yang konsisten */
      cursor: pointer;
      font-size: 14px; /* Ukuran font disesuaikan agar tidak terlalu besar di toolbar */
      letter-spacing: 0.5px; /* Sedikit spasi huruf */
      box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2); /* Bayangan dengan glow biru */
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Transisi mulus */
      /* Efek hover (bisa ditambahkan dengan event listener jika ingin lebih canggih) */
    `;

    // Menambahkan efek hover secara manual jika tidak menggunakan CSS file terpisah
    btn.onmouseover = () => {
        btn.style.background = 'linear-gradient(45deg, #0056b3 0%, #003F80 100%)';
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 6px 15px rgba(0, 123, 255, 0.4)';
    };
    btn.onmouseout = () => {
        btn.style.background = 'linear-gradient(45deg, #007BFF 0%, #0056b3 100%)';
        btn.style.transform = 'none';
        btn.style.boxShadow = '0 4px 10px rgba(0, 123, 255, 0.2)';
    };
    // --- END: Perubahan gaya tombol ---

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
  // --- START: Perubahan gaya badge verifikasi ---
  badge.innerHTML = isValid
    ? `<div style="
        font-weight:bold;
        padding:10px 15px; /* Padding lebih besar */
        background: linear-gradient(90deg, #22c55e 0%, #15803d 100%); /* Gradien hijau */
        color:white;
        border-radius:8px; /* Sudut membulat */
        margin-bottom:15px;
        box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4); /* Glow hijau */
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid rgba(34, 197, 94, 0.6);
        ">
        ✅ VerifSol: Verified sender — <strong>${senderName}</strong><br>
        🔗 Wallet: ${pubKey.slice(0, 20)}...
       </div>`
    : `<div style="
        font-weight:bold;
        padding:10px 15px;
        background: linear-gradient(90deg, #ef4444 0%, #b91c1c 100%); /* Gradien merah */
        color:white;
        border-radius:8px;
        margin-bottom:15px;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); /* Glow merah */
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid rgba(239, 68, 68, 0.6);
        ">
        ❌ VerifSol: Invalid Signature
       </div>`;
  // --- END: Perubahan gaya badge verifikasi ---

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