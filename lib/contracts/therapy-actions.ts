import { ethers } from "ethers";
import TherapyConsent from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";
import { createIPFSClient } from "../utils/ipfs";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_THERAPY_CONSENT_ADDRESS;

export interface TherapySession {
  sessionId: string;
  timestamp: number;
  summary: string;
  topics: string[];
  duration: number;
  moodScore: number;
  achievements: string[];
  completed: boolean;
}

export interface SessionMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

export const createTherapySession = async (
  signer: ethers.Signer,
  topics: string[]
) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      TherapyConsent.abi,
      signer
    );

    const sessionId = ethers.utils.id(Date.now().toString());
    const tx = await contract.createTherapySession(
      await signer.getAddress(),
      sessionId,
      topics
    );
    await tx.wait();

    return sessionId;
  } catch (error) {
    console.error("Error creating therapy session:", error);
    throw error;
  }
};

export const completeTherapySession = async (
  signer: ethers.Signer,
  sessionId: string,
  summary: string,
  duration: number,
  moodScore: number,
  achievements: string[]
) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      TherapyConsent.abi,
      signer
    );

    const tx = await contract.completeTherapySession(
      sessionId,
      summary,
      duration,
      moodScore,
      achievements
    );
    await tx.wait();

    // Generate and upload metadata to IPFS
    const metadata = await generateSessionMetadata({
      sessionId,
      timestamp: Date.now(),
      summary,
      topics: [],
      duration,
      moodScore,
      achievements,
      completed: true,
    });

    // Mint NFT
    const metadataURI = await uploadMetadataToIPFS(metadata);
    const mintTx = await contract.mintSessionNFT(
      await signer.getAddress(),
      metadataURI,
      {
        sessionId,
        timestamp: Date.now(),
        summary,
        topics: [],
        duration,
        moodScore,
        achievements,
        completed: true,
      }
    );
    await mintTx.wait();
  } catch (error) {
    console.error("Error completing therapy session:", error);
    throw error;
  }
};

export const getUserSessions = async (
  provider: ethers.providers.Provider,
  userAddress: string
) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      TherapyConsent.abi,
      provider
    );

    const sessions = await contract.getUserSessions(userAddress);
    return Promise.all(
      sessions.map(async (sessionId: string) =>
        contract.getSessionDetails(sessionId)
      )
    );
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

const generateSessionMetadata = async (
  session: TherapySession
): Promise<SessionMetadata> => {
  return {
    name: `Therapy Session #${session.sessionId}`,
    description: `AI Therapy Session Summary: ${session.summary}`,
    image: "ipfs://your-default-image-hash", // You'll need to upload and set a default image
    attributes: [
      {
        trait_type: "Duration",
        value: session.duration,
      },
      {
        trait_type: "Mood Score",
        value: session.moodScore,
      },
      {
        trait_type: "Achievements",
        value: session.achievements.length,
      },
      {
        trait_type: "Date",
        value: new Date(session.timestamp).toISOString(),
      },
    ],
  };
};

const uploadMetadataToIPFS = async (
  metadata: SessionMetadata
): Promise<string> => {
  try {
    const ipfs = await createIPFSClient();
    const result = await ipfs.add(JSON.stringify(metadata));
    return `ipfs://${result.path}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};
