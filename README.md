# ✍️ One Word Story (On-Chain)

A simple, collaborative storytelling project built on the Ethereum blockchain, where participants collectively build a narrative, one word at a time. This project focuses purely on the smart contract logic and command-line interaction, with no graphical user interface (UI).

---

## ✨ Features

* **Collaborative Storytelling:** Anyone can contribute to the story by adding the next word.
* **One Word Rule:** Ensures each contribution is a single, concise word (no spaces allowed).
* **Immutable History:** Every word added is permanently recorded on the blockchain, creating an unchangeable and transparent history of the story.
* **Event Logging:** Key actions, like adding a word, emit events that can be monitored off-chain.

---

## 🛠️ Technologies Used

* **Solidity:** The programming language for writing smart contracts on Ethereum.
* **Foundry:** A blazing fast, portable, and modular toolkit for Ethereum application development. This project primarily uses `forge` for testing and `cast` for interaction.

---

## 🚀 Getting Started

### Prerequisites

You'll need [Foundry](https://getfoundry.sh/) installed. Follow the instructions on their website to set it up.

```bash
curl -L [https://foundry.paradigm.xyz](https://foundry.paradigm.xyz) | bash
foundryup