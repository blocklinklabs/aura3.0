import { ethers } from "ethers";
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
export const uploadSessionImage = async (image: File): Promise<string> => {
  try {
    const upload = await pinata.upload.file(image, {
      pinataMetadata: {
        name: `therapy-session-${Date.now()}`,
      },
    });

    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
};

// Function to upload session metadata to IPFS
export const uploadSessionMetadata = async (
  metadata: SessionMetadata
): Promise<string> => {
  try {
    const metadataString = JSON.stringify(metadata);
    const metadataFile = new File([metadataString], "metadata.json", {
      type: "application/json",
    });

    const upload = await pinata.upload.file(metadataFile, {
      pinataMetadata: {
        name: `therapy-session-metadata-${Date.now()}`,
      },
    });

    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
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

    // First complete the session
    const completeTx = await contract.completeTherapySession(
      sessionId,
      summary,
      duration,
      moodScore,
      achievements
    );
    await completeTx.wait();

    // Generate and upload session image
    const sessionData = {
      sessionId,
      timestamp: Date.now(),
      summary,
      topics: [],
      duration,
      moodScore,
      achievements,
      completed: true,
    };

    const sessionImage = await generateSessionImage(sessionData);
    const imageUri = await uploadSessionImage(sessionImage);

    // Generate and upload metadata
    const metadata: SessionMetadata = {
      name: `Therapy Session #${sessionId}`,
      description: `AI Therapy Session Summary: ${summary}`,
      image: imageUri,
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
        {
          trait_type: "Date",
          value: new Date().toISOString(),
        },
      ],
    };

    const metadataUri = await uploadSessionMetadata(metadata);

    // Mint NFT
    const mintTx = await contract.mintSessionNFT(
      await signer.getAddress(),
      metadataUri,
      sessionData
    );
    await mintTx.wait();

    return { sessionId, imageUri, metadataUri };
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
      sessions.map(async (sessionId: string) => {
        const details = await contract.getSessionDetails(sessionId);
        const tokenUri = await contract.tokenURI(sessionId);

        // Fetch metadata from IPFS
        const metadataResponse = await pinata.gateways.get(
          tokenUri.replace("ipfs://", "")
        );
        const metadata = await metadataResponse.json();

        return {
          ...details,
          metadata,
        };
      })
    );
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

// Function to get session image
export const getSessionImage = async (imageUri: string): Promise<string> => {
  try {
    const response = await pinata.gateways.get(imageUri.replace("ipfs://", ""));
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    console.error("Error fetching session image:", error);
    throw error;
  }
};
