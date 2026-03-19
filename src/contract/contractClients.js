/**
 * Contract Clients - Shared viem client initialization
 * 
 * viemのclient初期化とコントラクトインスタンスの共通設定を一元管理。
 * 各モジュールからimportして利用する。
 */
import { createPublicClient, createWalletClient, http, getContract, custom } from "viem";
import token_contract from "./token_abi.json";
import quiz_contract from "./quiz_abi.json";
import { quiz_address, token_address } from "./config";
import { amoy } from "./network";

/* eslint-disable no-restricted-globals */

const ethereum = window.ethereum || null;

/* ── Wallet Client (MetaMask) ── */
const walletClient = ethereum
    ? createWalletClient({
          chain: amoy,
          transport: custom(ethereum),
      })
    : null;

/* ── Public Client (RPC) ── */
const publicClient = createPublicClient({
    chain: amoy,
    transport: http(),
});

/* ── ABI ── */
const token_abi = token_contract.abi;
const quiz_abi = quiz_contract.abi;

/* ── Contract Instances ── */
const clientConfig = walletClient
    ? { walletClient, publicClient }
    : { publicClient };

const tokenContract = getContract({
    address: token_address,
    abi: token_abi,
    ...clientConfig,
});

const quizContract = getContract({
    address: quiz_address,
    abi: quiz_abi,
    ...clientConfig,
});

/* ── Chain Event Listeners ── */
if (window.ethereum) {
    window.ethereum.on("chainChanged", () => {
        window.location.reload();
    });
    window.ethereum.on("accountsChanged", () => {
        window.location.reload();
    });
}

/* ── Utility Functions ── */

/** 配列を指定サイズで分割 */
const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length)
        .fill()
        .map((_, i) => array.slice(i * number, (i + 1) * number));
};

/** 全角数字→半角数字 変換 */
const convertFullWidthNumbersToHalf = (() => {
    const diff = "０".charCodeAt(0) - "0".charCodeAt(0);
    return (text) =>
        text.replace(/[０-９]/g, (m) =>
            String.fromCharCode(m.charCodeAt(0) - diff)
        );
})();

/** MetaMaskのアドレスを取得 */
async function getAddress() {
    try {
        if (ethereum) {
            return (await walletClient.requestAddresses())[0];
        } else {
            console.log("Ethereum object does not exist");
        }
    } catch (err) {
        console.log(err);
    }
}

export {
    ethereum,
    walletClient,
    publicClient,
    token_abi,
    quiz_abi,
    token_address,
    quiz_address,
    tokenContract,
    quizContract,
    amoy,
    sliceByNumber,
    convertFullWidthNumbersToHalf,
    getAddress,
};
