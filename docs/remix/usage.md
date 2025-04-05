# How to Use the Plugin

This guide walks you through the steps to connect the plugin, compile Noir projects, deploy contracts, and interact with them using the Aztec Remix Plugin.

---

## Connect

Click the **"Connect to Aztec Sandbox"** button in the **Environment** section.  
This connects to your locally running Aztec Sandbox and automatically imports the three default accounts.

> ⚠️ Make sure your local Sandbox is running — refer to the [Sandbox setup guide](https://docs.aztec.network/developers/getting_started#install-and-run-the-sandbox) if needed.

<img src="/img/remix/use-connect.png" alt="Connect" width="300" />

---

## Compile
Your project must follow the structure below under the aztec/ directory:

```bash
aztec/ 
  └─ my_project/ 
      ├─ src/ 
      │   └─ main.nr 
      └─ Nargo.toml
```

You can create your own Noir project or import one of the example projects provided in the plugin.

<img src="/img/remix/use-compile.png" alt="Compile" width="300" />

To compile:

1. Select your **Target Project**
2. Click **Compile**
3. The compilation will generate `.json` artifacts under the `target/` folder

> ✅ Ensure that the `aztec-nargo` version shown in the Environment tab matches the version used in your local Sandbox.

---

## Deploy

After successful compilation:

1. Select the desired `.json` contract artifact from the **Select Artifact** dropdown
2. If your contract requires constructor arguments, fill them in
3. Click **Deploy**

<img src="/img/remix/use-deploy.png" alt="Deploy" width="300" />

Once deployed, the contract address will be saved for use in the Interact section.

---

## Interact

All deployed contracts are listed under **Contract Instance** in the **Interact** section.

You can also load a previously deployed contract by:

- Placing a `.json` artifact in the `aztec/` folder
- Entering the deployed contract address
- Clicking **"At Address"**

<img src="/img/remix/use-interact.png" alt="Interact" width="300" />

Once connected:

- Select a function from the contract ABI
- Enter the required input parameters
- Click:
  - **Simulate** for read-only functions
  - **Send** to execute write functions

> For private functions requiring `AuthWitness`, refer to the [AuthWit tutorial](/docs/tutorial/authwit).
