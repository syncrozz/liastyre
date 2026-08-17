import { db, doc, getDoc, setDoc } from "./firebase";

// Utility to convert plain string PIN to SHA-256 hash using Web Crypto API
export async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin.trim());
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify entered PIN against Firestore security document
export async function verifyAdminPin(pinInput: string): Promise<boolean> {
  try {
    const inputHash = await hashPin(pinInput);
    const securityDocRef = doc(db, "settings", "security");
    const snapshot = await getDoc(securityDocRef);

    const defaultHash = await hashPin("6463");

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.pinHash) {
        if (inputHash === data.pinHash) {
          return true;
        }
        // If user enters 6463, immediately accept and synchronize to Firestore
        if (inputHash === defaultHash) {
          try {
            await setDoc(
              securityDocRef,
              {
                pinHash: defaultHash,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (syncErr) {
            console.warn("Could not sync updated PIN to Firestore:", syncErr);
          }
          return true;
        }
        return false;
      }
    }

    // Default seed hash for PIN '6463' if not yet initialized in Firestore
    await setDoc(securityDocRef, {
      pinHash: defaultHash,
      updatedAt: new Date().toISOString(),
    });

    return inputHash === defaultHash;
  } catch (error) {
    console.error("Error verifying admin PIN:", error);
    // Fallback comparison with runtime generated hash of default PIN if Firestore fails
    const fallbackHash = await hashPin("6463");
    const inputHash = await hashPin(pinInput);
    return inputHash === fallbackHash;
  }
}

// Update Admin PIN in Firestore
export async function updateAdminPin(newPin: string): Promise<boolean> {
  try {
    const newHash = await hashPin(newPin);
    const securityDocRef = doc(db, "settings", "security");
    await setDoc(
      securityDocRef,
      {
        pinHash: newHash,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating admin PIN:", error);
    return false;
  }
}
