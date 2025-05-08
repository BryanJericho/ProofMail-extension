window.verifySignature = async function (message, signature, pubKey) {
    const msgUint8 = new TextEncoder().encode(message);
    const sigUint8 = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const pubKeyUint8 = Uint8Array.from(atob(pubKey), c => c.charCodeAt(0));
  
    const naclReady = await import('https://cdn.jsdelivr.net/npm/tweetnacl/+esm');
    return naclReady.sign.detached.verify(msgUint8, sigUint8, pubKeyUint8);
  };
  