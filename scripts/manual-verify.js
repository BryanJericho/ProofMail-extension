(async () => {
  // 1. Data trusted
  const trustedWallets = {
    "bryanpanggalo@gmail.com": {
      wallet: "DaB55UmS5wTrGCrko7FxVpRmZhUgVRVWGf1xkcm9AXzi",
      name: "Bryan Jericho"
    }
  };

  // 2. Ambil isi email
  const emailBodyElem = document.querySelector("div[role='listitem'], div[aria-label='Message Body']");
  if (!emailBodyElem) {
    alert("❌ Tidak menemukan isi email.");
    return;
  }

  const emailText = emailBodyElem.innerText || emailBodyElem.textContent;
  const pubKeyMatch = emailText.match(/Signed by:\s*(.+)/);

  if (!pubKeyMatch) {
    alert("❌ Tidak menemukan baris 'Signed by:' di email.");
    return;
  }

  const pubKey = pubKeyMatch[1].trim();

  // 3. Ambil pengirim email dari Gmail DOM
  const senderElem = document.querySelector("span[email]");
  const senderEmail = senderElem?.getAttribute("email")?.toLowerCase();

  if (!senderEmail) {
    alert("❌ Tidak bisa menemukan alamat email pengirim.");
    return;
  }

  const trusted = trustedWallets[senderEmail];

  if (trusted && trusted.wallet === pubKey) {
    // 4. Verified
    alert(`✅ Verified!\nPengirim: ${trusted.name} (${senderEmail})\nWallet: ${pubKey}`);

    // 5. Badge hijau
    const badge = document.createElement("div");
    badge.textContent = `✅ VerifSol: Pengirim ${trusted.name} (${senderEmail}) terverifikasi`;
    badge.style.background = "#d4edda";
    badge.style.color = "#155724";
    badge.style.border = "1px solid #c3e6cb";
    badge.style.padding = "10px";
    badge.style.marginTop = "10px";
    badge.style.fontWeight = "bold";
    badge.style.borderRadius = "5px";
    badge.style.fontSize = "14px";
    emailBodyElem.prepend(badge);
  } else {
    // ❌ Tidak terverifikasi
    alert("❌ Pengirim tidak terverifikasi. Email atau wallet tidak cocok.");

    const badge = document.createElement("div");
    badge.textContent = `❌ VerifSol: Pengirim tidak terverifikasi`;
    badge.style.background = "#f8d7da";
    badge.style.color = "#721c24";
    badge.style.border = "1px solid #f5c6cb";
    badge.style.padding = "10px";
    badge.style.marginTop = "10px";
    badge.style.fontWeight = "bold";
    badge.style.borderRadius = "5px";
    badge.style.fontSize = "14px";
    emailBodyElem.prepend(badge);
  }
})();
