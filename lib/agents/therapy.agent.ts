import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { ethers } from "ethers";
import { OpenAI } from "openai";
import { TherapyServiceManager } from "../contracts/types";

interface SessionMetrics {
  attendance: number;
  progress: number;
  contribution: number;
}

interface UserMetrics extends SessionMetrics {
  capacity: number;
}

interface Initiative {
  title: string;
  budget: number;
  impact: string;
}

interface TradeTerms {
  duration: number;
  interestRate: number;
  collateral?: string;
}

export class TherapyAgent {
  private static instance: TherapyAgent | null = null;
  private agent: any;
  private initialized: boolean = false;
  private openai: OpenAI;
  private contract: TherapyServiceManager;
  private wallet: ethers.Wallet;

  private constructor(
    contract: TherapyServiceManager,
    wallet: ethers.Wallet,
    openaiKey: string
  ) {
    this.contract = contract;
    this.wallet = wallet;
    this.openai = new OpenAI({ apiKey: openaiKey });
  }

  static getInstance(
    contract?: TherapyServiceManager,
    wallet?: ethers.Wallet,
    openaiKey?: string
  ): TherapyAgent {
    if (!TherapyAgent.instance) {
      if (!contract || !wallet || !openaiKey) {
        throw new Error("Required parameters missing for initialization");
      }
      TherapyAgent.instance = new TherapyAgent(contract, wallet, openaiKey);
    }
    return TherapyAgent.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const llm = new ChatOpenAI({
        model: "gpt-4",
        temperature: 0.7,
      });

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
    } catch (error) {
      console.error("Failed to initialize TherapyAgent:", error);
      throw error;
    }
  }

  async manageTherapyRewards(userId: string, sessionMetrics: SessionMetrics) {
    await this.ensureInitialized();
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

  async manageCrisisFund(userAddress: string, riskLevel: number) {
    await this.ensureInitialized();
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

  async proposeInitiative(initiative: Initiative) {
    await this.ensureInitialized();
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

  async facilitateCreditTrade(
    fromUser: string,
    toUser: string,
    amount: string,
    terms: TradeTerms
  ) {
    await this.ensureInitialized();
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

  async calculateSessionPrice(userMetrics: UserMetrics) {
    await this.ensureInitialized();
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

  async monitorSessions(): Promise<void> {
    this.contract.on(
      "NewSessionStarted",
      async (sessionId: number, patient: string) => {
        console.log(
          `New therapy session started: ${sessionId} for patient ${patient}`
        );
        await this.handleSession(sessionId);
      }
    );

    this.contract.on(
      "EmergencyTriggered",
      async (sessionId: number, patient: string) => {
        console.log(`Emergency triggered for session ${sessionId}`);
        await this.handleEmergency(sessionId, patient);
      }
    );
  }

  private async handleSession(sessionId: number): Promise<void> {
    const session = await this.contract.sessions(sessionId);
    const decryptedConversation = this.decryptConversation(
      session.encryptedConversation
    );

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate AI therapist. Respond with empathy and professional insight.",
        },
        {
          role: "user",
          content: decryptedConversation,
        },
      ],
    });

    const encryptedResponse = this.encryptConversation(
      response.choices[0].message.content || ""
    );

    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "string"],
      [sessionId, encryptedResponse]
    );
    const signature = await this.wallet.signMessage(
      ethers.getBytes(messageHash)
    );

    await this.contract.updateSession(sessionId, encryptedResponse, signature);
  }

  private async handleEmergency(
    sessionId: number,
    patient: string
  ): Promise<void> {
    // Emergency protocols implementation
    console.log(
      `Handling emergency for session ${sessionId} and patient ${patient}`
    );
  }

  private encryptConversation(text: string): string {
    // Encryption implementation
    return text;
  }

  private decryptConversation(text: string): string {
    // Decryption implementation
    return text;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
