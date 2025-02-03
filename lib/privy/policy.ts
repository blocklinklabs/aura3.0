export const therapyWalletPolicy = {
  version: "1.0",
  name: "Therapy Session Payments",
  chain_type: "ethereum",
  method_rules: [
    {
      method: "eth_sendTransaction",
      rules: [
        {
          name: "Restrict therapy payments",
          conditions: [
            // Only allow sending to therapy service wallet
            {
              field_source: "ethereum_transaction",
              field: "to",
              operator: "eq",
              value: "0x123...YOUR_THERAPY_WALLET", // Your therapy service wallet
            },
            // Max payment of 0.1 ETH per transaction
            {
              field_source: "ethereum_transaction",
              field: "value",
              operator: "lte",
              value: "100000000000000000", // 0.1 ETH in wei
            },
            // Only on Base Sepolia testnet
            {
              field_source: "ethereum_transaction",
              field: "chain_id",
              operator: "eq",
              value: "84532",
            },
          ],
          action: "ALLOW",
        },
      ],
    },
  ],
  default_action: "DENY",
};
