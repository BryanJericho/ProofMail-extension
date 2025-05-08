window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (event.data.type === "VERIFSOLSIGN") {
      const msg = event.data.message;
  
      try {
        await window.solana.connect();
        const signed = await window.solana.signMessage(
          new TextEncoder().encode(msg),
          "utf8"
        );
  
        window.postMessage({
          type: "VERIFSOLSIGNED",
          signature: btoa(String.fromCharCode(...signed.signature)),
          publicKey: signed.publicKey.toString()
        }, "*");
      } catch (err) {
        console.error("Signature failed", err);
      }
    }
  });
  