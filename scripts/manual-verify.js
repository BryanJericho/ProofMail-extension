(async () => {
    const trustedWallets = {
      "DaB55UmS5wTrGCrko7FxVpRmZhUgVRVWGf1xkcm9AXzi": "Bryan Jericho"
    };
  
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
    const senderName = trustedWallets[pubKey];
  
    if (senderName) {
      alert(`✅ Verified!\nPengirim terverifikasi sebagai: ${senderName}\nWallet: ${pubKey}`);
    } else {
      alert("❌ Pengirim tidak terverifikasi. Wallet tidak dikenal.");
    }

    // Bikin elemen badge
const badge = document.createElement("div");
badge.textContent = `✅ VerifSol: Pengirim ${senderName} terverifikasi`;
badge.style.background = "#d4edda"; // Hijau lembut
badge.style.color = "#155724";
badge.style.border = "1px solid #c3e6cb";
badge.style.padding = "10px";
badge.style.marginTop = "10px";
badge.style.fontWeight = "bold";
badge.style.borderRadius = "5px";
badge.style.fontSize = "14px";

// Sisipkan di atas isi email
emailBodyElem.prepend(badge);

  })();
  