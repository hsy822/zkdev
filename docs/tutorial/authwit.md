---
id: authwit
title: Using AuthWitness
---

## What is an Authentication Witness (AuthWit)?

Authentication Witness, or **AuthWit**, is Aztec's solution for securely authorizing third parties (like other users or protocols) to perform specific actions on your behalf — without relying on unlimited token approvals or opaque signature mechanisms.

This concept stems from the need to improve user safety, transparency, and smart contract compatibility, especially in privacy-preserving systems like Aztec where traditional approval methods fall short.

AuthWits work by having the user generate a **witness (proof)** that authorizes a specific action. This witness is then passed along with a contract call, either in **private** (executed client-side through PXE) or **public** (stored on-chain via account contracts).

### Key Benefits

- **Explicit Authorization:** Users define *exactly* what is allowed — which function, what parameters, and who can call it.
- **Single Transaction:** No need for an approval-then-action flow; it's all done at once.
- **Smart Contract Wallet Support:** Works with contracts like Gnosis Safe, thanks to proof-based (not signature-based) design.
- **Replay Protection:** AuthWits are one-time-use by default — optionally replayable with a nonce.

> In private execution, AuthWits are verified inside the user's PXE client.  
> In public, the account contract verifies them on-chain using `setPublicAuthWit`.

In this tutorial, we will learn exactly how it works through a hands-on walkthrough.

---

## Using AuthWit with the Aztec Remix Plugin

In this tutorial, we'll use the **Aztec Remix plugin** to compile and deploy a **Noir-based Token contract using AuthWit**, and simulate a real-world flow where multiple accounts interact with the contract using **authentication witnesses (AuthWit)**.

👉 For connection and usage of the plugin, refer to the following docs:  
- [Connect](/docs/remix/connect)
- [Usage](/docs/remix/usage)

---

### Step 1. Compile & Deploy the Contract

1. Open `Token.nr` in the Aztec Remix plugin and compile it.
2. Once compiled, check the generated `.json` artifact and deploy the contract using **`Account 1`**.

    <img src="/img/authwit/1-1.png" alt="screenshot" width="700" />

3. Set the `Owner` to Account 1's address, and provide the token name, symbol, etc., then click **Deploy**.

    <img src="/img/authwit/1-2.png" alt="screenshot" width="700" />

---

### Step 2. Try `transfer_in_private` without AuthWit → Fail

1. Switch to `Account 1` and call `mint_to_private(from, to, amount)` to mint 1000 tokens.

    <img src="/img/authwit/2-1.png" alt="screenshot" width="700" />

2. Check the private balance using `balance_of_private(owner)`.

    <img src="/img/authwit/2-2.png" alt="screenshot" width="700" />

3. Switch to **`Account 2`**.

    <img src="/img/authwit/2-3.png" alt="screenshot" width="300" />

4. Try calling `transfer_in_private(Account 1 → Account 2, amount: 1000, nonce: 123)`.  
   It will **fail** because of the `assert_current_call_valid_authwit(&mut context, from)` logic:

    ```rust
    if (!from.eq(context.msg_sender())) {
        assert_current_call_valid_authwit(&mut context, from);
    } else {
        assert(nonce == 0, "invalid nonce");
    }
    ```

    <img src="/img/authwit/2-4.png" alt="screenshot" width="300" />

---

### Step 3. Generate AuthWit

1. Switch back to `Account 1`.

    <img src="/img/authwit/3-1.png" alt="screenshot" width="300" />

2. Input the following:
   - `selector`: `transfer_in_private`
   - `args`: `Account 1, Account 2, 100, 123`
   - `caller`: `Account 2`

3. Go to the `AuthWit` tab or InteractCard and generate a witness.

    <img src="/img/authwit/3-2.png" alt="screenshot" width="700" />

4. Enter an alias and click to generate AuthWit → File `aztec/authwit/atob.txt` will be created.

    <img src="/img/authwit/3-3.png" alt="screenshot" width="700" />

---

### Step 4. Call the Function with AuthWit → Success

1. Switch to `Account 2`.

    <img src="/img/authwit/4-1.png" alt="screenshot" width="300" />

2. Call `transfer_in_private(Account 1 → Account 2, 100, 123)` again.
3. Set `useAuthWit: true` and choose `atob.txt` from the dropdown.
4. Submit the transaction → It should now **succeed**.

    <img src="/img/authwit/4-2.png" alt="screenshot" width="700" />

---

### Step 5. Register AuthWit for Public Functions (On-chain)

1. For public functions like `transfer_in_public`, you must **register the AuthWit on-chain** before use.
2. From `Account 1`, call `setPublicAuthWit(...)` with:
   - `caller`: Account 2
   - `action`: `transfer_in_public(Account 1 → Account 2, 100, 12)`

    <img src="/img/authwit/5-1.png" alt="screenshot" width="700" />

3. Once registered, `Account 2` can now call the public function using the stored AuthWit.

    <img src="/img/authwit/5-2.png" alt="screenshot" width="700" />

---

### Final Thoughts

- In this tutorial, we walked through a full cycle of using **AuthWit**:
  - From a failed private transfer due to missing AuthWit,
  - To generating and using AuthWit successfully,
  - And even registering it on-chain for public function use.
- AuthWit provides a **secure and precise alternative** to traditional `approve`-based permissions.
- The Aztec Remix plugin enables users to create, manage, and apply AuthWits intuitively within the browser environment.

---

## References

- [Advenced Concepts - Authentication Witness (Authwit)](https://docs.aztec.network/aztec/concepts/advanced/authwit)
- [Writing Contracts - Authentication Witness](https://docs.aztec.network/developers/guides/smart_contracts/writing_contracts/authwit)
- [Aztec.js - How to use authentication witnesses (authwit)](https://docs.aztec.network/developers/guides/js_apps/authwit)