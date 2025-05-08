---
id: validating-log
title: Happy Validating
---

# Happy Validating

<img src="/img/dappnode.png" alt="Dappnode" width="600" />


Version: `v0.85.0-alpha-testnet.5`

This document is based on my experience of configuring and operating an Aztec Sequencer node **locally via CLI**. It describes how to run both the L1 execution client and the L1 consensus client **on your own machine**, and serves as a reference for those who wish to set up a similar environment.

---

## System Information

- Machine: CLI-based Ubuntu 22.04
- CPU: Intel(R) Core(TM) Ultra 7 155H (22 threads)
- RAM: 62GB
- Disk: 3.6TB SSD
- OS Kernel: 6.8.0

---

## Components Installed and Why

- **Geth**: L1 Execution Client. Running directly on Sepolia  
  - https://geth.ethereum.org/docs/getting-started/installing-geth
- **(Important) Lighthouse**: L1 Consensus Client. Replacing Prysm due to lack of HTTP API support  
  - https://lighthouse-book.sigmaprime.io/installation_binaries.html
- **Aztec CLI**: To control Sequencer, Node, and Archiver directly  
  - https://docs.aztec.network/developers/getting_started#install-the-sandbox
- **tmux**: To run each process independently in the background

---

## Generate JWT File

Geth and Lighthouse must share the same JWT file for authenticated communication.

```bash
mkdir -p $HOME/eth-jwt
openssl rand -hex 32 > $HOME/eth-jwt/jwtsecret
```

---

## Start Geth in a tmux Session

```bash
tmux new -s geth
```

Run Geth:

```bash
geth --sepolia \
--syncmode full \
--authrpc.jwtsecret $HOME/eth-jwt/jwtsecret \
--http --http.addr 0.0.0.0 --http.port 8545 \
--http.api eth,net,web3,engine \
--datadir $HOME/.ethereum/sepolia \
--authrpc.addr 127.0.0.1 \
--authrpc.port 8551 \
--authrpc.vhosts=*
```

Detach the session using `Ctrl + b`, then `d`.

---

## Install and Run Lighthouse

### Run

Create a new `tmux` session:
```bash
tmux new -s lighthouse
```

Run Lighthouse:
```bash
lighthouse bn \
--network sepolia \
--execution-endpoint http://localhost:8551 \
--execution-jwt $HOME/eth-jwt/jwtsecret \
--checkpoint-sync-url https://sepolia.beaconstate.info \
--disable-deposit-contract-sync \
--http \
--http-address 0.0.0.0 \
--http-port 5052
```

Detach with `Ctrl + b`, then `d`.

---

## Run Aztec Sequencer

Create a new `tmux` session:
```bash
tmux new -s aztec
```

```bash
# Your account must have Sepolia ETH to cover gas fees for committing blobs.
export COINBASE=0xYourEthereumAddress
export PRIVATE_KEY=0xyourprivatekey
export IP=$(curl -s ifconfig.me)
```

Start the Aztec node:
```bash
aztec start \
--network alpha-testnet \
--l1-rpc-urls http://localhost:8545 \
--l1-consensus-host-urls http://localhost:5052 \
--sequencer.validatorPrivateKey $PRIVATE_KEY \
--p2p.p2pIp $IP \
--archiver \
--node \
--sequencer \
--port 8082
```

The default port is 8080, but we use 8082 here to avoid conflicts (e.g., with Prysm).

---

## Register as a Validator

Register your node as a validator on Aztec L1:
```bash
aztec add-l1-validator \
--private-key $PRIVATE_KEY \
--attester $COINBASE \
--proposer-eoa $COINBASE \
--l1-rpc-urls http://localhost:8545 \
--l1-chain-id 11155111 \
--staking-asset-handler 0xF739D03e98e23A7B65940848aBA8921fF3bAc4b2
```

---

## Port Forwarding Summary

- Required port: `40400` (both TCP and UDP)
- Must be forwarded from your router to the local machine’s IP

---

## tmux Command Reference

| Purpose         | Command                       |
|----------------|-------------------------------|
| Create session | `tmux new -s <name>`          |
| Attach session | `tmux attach -t <name>`       |
| Detach session | `Ctrl + b`, then `d`          |
| Kill session   | `tmux kill-session -t <name>` |

---

## Comparison to Aztec Recommended Specs

| Item  | Recommended Specs     | My Specs                     |
|-------|------------------------|------------------------------|
| CPU   | 8+ cores               | 22 threads (Ultra 7 155H)    |
| RAM   | 32GB+                  | 62GB                         |
| Disk  | 1TB+ SSD               | 3.6TB SSD                    |
| OS    | Linux                  | Ubuntu 22.04                 |

My setup exceeds the recommended specs, ensuring stable performance.

---

## Final Notes

This guide explains how to run all components locally on your own machine. It's tailored for those seeking an independent infrastructure setup.

If you're aiming for reliable participation in the Aztec Testnet, this approach—while more complex—gives you the most control and transparency.

For further questions, feel free to discuss with other operators on the Aztec Discord.

