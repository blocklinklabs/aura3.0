import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  uniswapActionProvider,
  aaveActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

export class TherapyAgent {
  private static instance: TherapyAgent;
  private agent: any;
  private initialized = false;

  private constructor() {}

  static getInstance() {
    if (!TherapyAgent.instance) {
      TherapyAgent.instance = new TherapyAgent();
    }
    return TherapyAgent.instance;
  }

  async initialize() {
    if (this.initialized) return;

    const llm = new ChatOpenAI({ model: "gpt-4" });
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
      networkId: "base-sepolia",
    });

    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        erc20ActionProvider(),
        uniswapActionProvider(),
        aaveActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME!,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME!,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);

    this.agent = createReactAgent({
      llm,
      tools,
      messageModifier: `
        You are an innovative AI therapy financial manager that:
        1. Creates personalized DeFi strategies based on therapy goals and progress
        2. Manages a therapy rewards pool that incentivizes consistent attendance
        3. Enables community-driven mental health initiatives through token governance
        4. Provides automated crisis fund management
        5. Facilitates peer-to-peer therapy credit trading
      `,
    });

    this.initialized = true;
  }

  // Innovative DeFi-powered therapy reward system
  async manageTherapyRewards(userId: string, sessionMetrics: any) {
    const response = await this.agent.invoke({
      messages: [
        new HumanMessage(`
          Optimize therapy rewards for user ${userId} based on:
          - Session attendance: ${sessionMetrics.attendance}
          - Progress markers: ${sessionMetrics.progress}
          - Community contribution: ${sessionMetrics.contribution}
          
          Actions:
          1. Mint reward tokens based on progress
          2. Stake rewards in yield-generating protocols
          3. Update user's therapy credit score
        `),
      ],
    });
    return response;
  }

  // Crisis fund management
  async manageCrisisFund(userAddress: string, riskLevel: number) {
    const response = await this.agent.invoke({
      messages: [
        new HumanMessage(`
          Manage crisis fund for user ${userAddress} with risk level ${riskLevel}:
          1. Allocate emergency response funds
          2. Adjust insurance coverage
          3. Update crisis response smart contracts
          4. Notify support network if needed
        `),
      ],
    });
    return response;
  }

  // Community-driven mental health initiatives
  async proposeInitiative(initiative: any) {
    const response = await this.agent.invoke({
      messages: [
        new HumanMessage(`
          Process community initiative:
          - Title: ${initiative.title}
          - Budget: ${initiative.budget}
          - Expected Impact: ${initiative.impact}
          
          Actions:
          1. Create proposal smart contract
          2. Allocate matching funds from treasury
          3. Setup reward distribution
          4. Enable community voting
        `),
      ],
    });
    return response;
  }

  // Peer-to-peer therapy credit trading
  async facilitateCreditTrade(
    fromUser: string,
    toUser: string,
    amount: string,
    terms: any
  ) {
    const response = await this.agent.invoke({
      messages: [
        new HumanMessage(`
          Process P2P therapy credit trade:
          - From: ${fromUser}
          - To: ${toUser}
          - Amount: ${amount}
          - Terms: ${JSON.stringify(terms)}
          
          Actions:
          1. Verify credit scores
          2. Execute atomic swap
          3. Update reputation systems
          4. Record impact metrics
        `),
      ],
    });
    return response;
  }

  // Dynamic therapy pricing based on user engagement
  async calculateSessionPrice(userMetrics: any) {
    const response = await this.agent.invoke({
      messages: [
        new HumanMessage(`
          Calculate personalized session price based on:
          - Attendance history: ${userMetrics.attendance}
          - Progress score: ${userMetrics.progress}
          - Community contribution: ${userMetrics.contribution}
          - Financial capacity: ${userMetrics.capacity}
          
          Actions:
          1. Apply reward multipliers
          2. Check community support eligibility
          3. Calculate final subsidized price
        `),
      ],
    });
    return response;
  }
}
