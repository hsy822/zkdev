---
id: authwit
title: Using AuthWitness
---

## 🔐 What is an Authentication Witness (AuthWit)?

Authentication Witness, or **AuthWit**, is Aztec's solution for securely authorizing third parties (like other users or protocols) to perform specific actions on your behalf — without relying on unlimited token approvals or opaque signature mechanisms.

This concept stems from the need to improve user safety, transparency, and smart contract compatibility, especially in privacy-preserving systems like Aztec where traditional approval methods fall short.

AuthWits work by having the user generate a **witness (proof)** that authorizes a specific action. This witness is then passed along with a contract call, either in **private** (executed client-side through PXE) or **public** (stored on-chain via account contracts).

### ✅ Key Benefits

- **Explicit Authorization:** Users define *exactly* what is allowed — which function, what parameters, and who can call it.
- **Single Transaction:** No need for an approval-then-action flow; it's all done at once.
- **Smart Contract Wallet Support:** Works with contracts like Gnosis Safe, thanks to proof-based (not signature-based) design.
- **Replay Protection:** AuthWits are one-time-use by default — optionally replayable with a nonce.

> In private execution, AuthWits are verified inside the user's PXE client.  
> In public, the account contract verifies them on-chain using `setPublicAuthWit`.

In this tutorial, we will learn exactly how it works through a hands-on walkthrough.

---

## 🧪 AuthWit Demo

_Coming soon..._

---

## 📖 References

- [Advenced Concepts - Authentication Witness (Authwit)](https://docs.aztec.network/aztec/concepts/advanced/authwit)
- [Writing Contracts - Authentication Witness](https://docs.aztec.network/developers/guides/smart_contracts/writing_contracts/authwit)
- [Aztec.js - How to use authentication witnesses (authwit)](https://docs.aztec.network/developers/guides/js_apps/authwit)