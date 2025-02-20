import { ethers } from "ethers";
// import TherapyConsent from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";
import TherapyConsent from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";
import { PinataSDK } from "pinata-web3";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_THERAPY_CONSENT_ADDRESS;

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud",
});

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

export interface SessionImage {
  file: File;
  preview: string;
}

// Function to upload session image to IPFS
export const uploadSessionImage = async (image: Buffer): Promise<string> => {
  try {
    const file = new File([image], `therapy-session-${Date.now()}.png`, {
      type: "image/png",
    });

    const upload = await pinata.upload.file(file);
    return upload.IpfsHash;
  } catch (error) {
    console.error("Error uploading session image:", error);
    throw error;
  }
};

// Function to upload session metadata to IPFS
export const uploadSessionMetadata = async (metadata: any): Promise<string> => {
  try {
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const file = new File([metadataBuffer], `metadata-${Date.now()}.json`, {
      type: "application/json",
    });

    const upload = await pinata.upload.file(file);
    return upload.IpfsHash;
  } catch (error) {
    console.error("Error uploading session metadata:", error);
    throw error;
  }
};

// Generate session visualization image
export const generateSessionImage = async (
  session: TherapySession
): Promise<File> => {
  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 800;
  canvas.height = 600;

  // Set background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add session details
  ctx.fillStyle = "#000000";
  ctx.font = "24px Arial";
  ctx.fillText(`Therapy Session #${session.sessionId}`, 40, 40);
  ctx.fillText(`Mood Score: ${session.moodScore}/10`, 40, 80);
  ctx.fillText(`Duration: ${session.duration} minutes`, 40, 120);

  // Add achievements
  ctx.fillText("Achievements:", 40, 180);
  session.achievements.forEach((achievement, index) => {
    ctx.fillText(`• ${achievement}`, 60, 220 + index * 40);
  });

  // Convert canvas to file
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!))
  );
  return new File([blob], `session-${session.sessionId}.png`, {
    type: "image/png",
  });
};

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

    // Generate a numeric session ID
    const sessionId = BigInt(Date.now());

    const tx = await contract.createTherapySession(
      await signer.getAddress(),
      sessionId,
      topics
    );
    await tx.wait();

    return sessionId.toString();
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

    // Convert sessionId to BigInt
    const sessionBigInt = BigInt(parseInt(sessionId.replace(/\D/g, "")));

    // First complete the session
    const completeTx = await contract.completeTherapySession(
      sessionBigInt,
      summary,
      duration,
      moodScore,
      achievements
    );
    await completeTx.wait();

    // Generate and upload session image
    const image = await generateSessionImage({
      sessionId,
      timestamp: Date.now(),
      summary,
      topics: [],
      duration,
      moodScore,
      achievements,
      completed: true,
    });
    const imageUri = await uploadSessionImage(
      Buffer.from(await image.arrayBuffer())
    );

    // Create and upload metadata
    const metadata = {
      name: `Therapy Session #${sessionId}`,
      description: summary,
      image: `ipfs://${imageUri}`,
      attributes: [
        {
          trait_type: "Duration",
          value: duration,
        },
        {
          trait_type: "Mood Score",
          value: moodScore,
        },
        {
          trait_type: "Achievements",
          value: achievements.length,
        },
      ],
    };

    const metadataUri = await uploadSessionMetadata(metadata);

    // Mint NFT
    const mintTx = await contract.mintSessionNFT(
      await signer.getAddress(),
      metadataUri,
      {
        sessionId: sessionBigInt,
        timestamp: Math.floor(Date.now() / 1000),
        summary,
        topics: [],
        duration,
        moodScore,
        achievements,
        completed: true,
      }
    );

    await mintTx.wait();

    return {
      sessionId,
      imageUri: `ipfs://${imageUri}`,
      metadataUri: `ipfs://${metadataUri}`,
    };
  } catch (error) {
    console.error("Error completing therapy session:", error);
    throw error;
  }
};

export const getUserSessions = async (
  provider: ethers.Provider,
  userAddress: string
) => {
  try {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
      TherapyConsent.abi,
      provider
    );

    const sessions = await contract.getUserSessions(userAddress);
    const detailedSessions = await Promise.all(
      sessions.map(async (details: any) => {
        const tokenUri = details.metadataUri;
        const metadataResponse = await fetch(
          `https://gateway.pinata.cloud/ipfs/${tokenUri.replace("ipfs://", "")}`
        );
        const metadata = await metadataResponse.json();

        return {
          ...details,
          metadata,
        };
      })
    );

    return detailedSessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

// Function to get session image
export const getSessionImage = async (imageUri: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://gateway.pinata.cloud/ipfs/${imageUri.replace("ipfs://", "")}`
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching session image:", error);
    throw error;
  }
};
