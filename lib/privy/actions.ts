import { privyServer } from "./server";

export async function sendTokens(
  walletId: string,
  toAddress: `0x${string}`,
  amount: string
) {
  try {
    const response = await privyServer.walletApi.ethereum.sendTransaction({
      walletId,
      caip2: "eip155:84532", // Base Sepolia testnet
      transaction: {
        to: toAddress,
        value: `0x${BigInt(amount).toString(16)}`, // Convert to hex
        chainId: 84532,
      },
    });

    return response.hash; // Response directly contains hash
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}
