import { ethers } from "ethers";
import TherapyConsentABI from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";

// Contract configuration
const CONTRACT_ADDRESS = "0xd1C14349664831a670cB5DCB030E012BB40cCd1f";
const CONTRACT_ABI = TherapyConsentABI.abi;

// Types based on your smart contract
export interface Consent {
  aiInterventions: boolean;
  emergencyContact: boolean;
  dataSharing: boolean;
  lastUpdated: number;
}

export interface AuditLog {
  interventionType: string;
  timestamp: number;
  outcome: string;
}

export class TherapyConsentService {
  private contract: ethers.BaseContract & {
    [key: string]: any;
  };
  private provider: ethers.Provider;
  private signer: ethers.Signer | null;

  constructor() {
    // Initialize with provider (read-only access)
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC
    );
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.provider
    );
    this.signer = null;
  }

  // Connect wallet for write operations
  async connectWallet(provider: any) {
    try {
      const web3Provider = new ethers.BrowserProvider(provider);
      this.signer = await web3Provider.getSigner();
      this.contract = this.contract.connect(this.signer);
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return false;
    }
  }

  // Update user consent settings
  async updateConsent(
    aiInterventions: boolean,
    emergencyContact: boolean,
    dataSharing: boolean
  ): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("Wallet not connected");

      const tx = await this.contract.updateConsent(
        aiInterventions,
        emergencyContact,
        dataSharing
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error updating consent:", error);
      return false;
    }
  }

  // Log an AI intervention
  async logIntervention(
    interventionType: string,
    outcome: string
  ): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("Wallet not connected");

      const address = await this.signer.getAddress();
      const tx = await this.contract.logIntervention(
        address,
        interventionType,
        outcome
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error logging intervention:", error);
      return false;
    }
  }

  // Get user's consent settings
  async getConsent(address: string): Promise<Consent | null> {
    try {
      const consent = await this.contract.getConsent(address);
      return {
        aiInterventions: consent.aiInterventions,
        emergencyContact: consent.emergencyContact,
        dataSharing: consent.dataSharing,
        lastUpdated: Number(consent.lastUpdated),
      };
    } catch (error) {
      console.error("Error getting consent:", error);
      return null;
    }
  }

  // Get user's audit logs
  async getAuditLogs(address: string): Promise<AuditLog[]> {
    try {
      const logs = await this.contract.getAuditLogs(address);
      return logs.map((log: any) => ({
        interventionType: log.interventionType,
        timestamp: Number(log.timestamp),
        outcome: log.outcome,
      }));
    } catch (error) {
      console.error("Error getting audit logs:", error);
      return [];
    }
  }

  // Listen to consent updates
  onConsentUpdated(
    callback: (user: string, consentType: string, value: boolean) => void
  ) {
    this.contract.on("ConsentUpdated", (user, consentType, value) => {
      callback(user, consentType, value);
    });
  }

  // Listen to intervention logs
  onInterventionLogged(
    callback: (user: string, interventionType: string, outcome: string) => void
  ) {
    this.contract.on(
      "InterventionLogged",
      (user, interventionType, outcome) => {
        callback(user, interventionType, outcome);
      }
    );
  }

  // Helper method to check if wallet is connected
  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  // Get current connected address
  async getConnectedAddress(): Promise<string | null> {
    try {
      if (!this.signer) return null;
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const therapyConsentService = new TherapyConsentService();
