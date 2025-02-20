import { ethers } from "ethers";
// import TherapyConsent from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";
import TherapyConsent from "../../artifacts/contracts/TherapyConsent.sol/TherapyConsent.json";
import { PinataSDK } from "pinata-web3";
import { eq } from "drizzle-orm";
import { therapySessions } from "@/lib/db/schema";
import { db } from "@/lib/db/dbConfig";

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

    // Generate a numeric session ID using timestamp and random component
    const timestamp = BigInt(Date.now());
    const random = BigInt(Math.floor(Math.random() * 1000));
    const sessionId = timestamp * BigInt(1000) + random;

    // Create database session first to get UUID
    const dbSession = await db
      .insert(therapySessions)
      .values({
        userId: await signer.getAddress(),
        type: "text",
        status: "in_progress",
        scheduledTime: new Date(),
        title: `New Session - ${new Date().toLocaleString()}`,
      })
      .returning();

    const uuid = dbSession[0].id;

    console.log("Creating session with numeric ID and UUID:", {
      numericId: sessionId.toString(),
      uuid,
    });

    // Create session in smart contract with both IDs
    const tx = await contract.createTherapySession(
      await signer.getAddress(),
      sessionId,
      uuid,
      topics
    );
    await tx.wait();

    return uuid;
  } catch (error) {
    console.error("Error creating therapy session:", error);
    throw new Error(
      `Failed to create therapy session: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export async function completeTherapySession(
  signer: ethers.Signer,
  sessionId: string,
  summary: string,
  duration: number,
  moodScore: number,
  achievements: string[]
) {
  try {
    console.log("Starting session completion with UUID:", sessionId);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      TherapyConsent.abi,
      signer
    );

    // Create session in contract if it doesn't exist
    const timestamp = BigInt(Date.now());
    const random = BigInt(Math.floor(Math.random() * 1000));
    const newNumericId = timestamp * BigInt(1000) + random;

    console.log(
      "Creating session in contract with numeric ID:",
      newNumericId.toString()
    );

    let numericId = newNumericId;
    try {
      const createTx = await contract.createTherapySession(
        await signer.getAddress(),
        newNumericId,
        sessionId,
        [] // empty topics
      );
      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.events?.find(
        (e: any) => e.event === "TherapySessionCreated"
      );
      if (createEvent) {
        numericId = createEvent.args.sessionId;
        console.log(
          "Session created in contract with ID:",
          numericId.toString()
        );
      }
    } catch (error) {
      console.log(
        "Session might already exist in contract, continuing...",
        error
      );
    }

    // First update the session in the database
    await db
      .update(therapySessions)
      .set({
        status: "completed",
        summary,
        updatedAt: new Date(),
      })
      .where(eq(therapySessions.id, sessionId))
      .returning();

    console.log("Database updated, completing session in contract...");

    // Complete the session in the smart contract
    const tx = await contract.completeTherapySession(
      sessionId,
      summary,
      duration,
      moodScore,
      achievements
    );

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    console.log("Transaction confirmed, events:", receipt.events);

    // Try to find the completion event
    const event = receipt.events?.find(
      (e: any) => e.event === "TherapySessionCompleted"
    );

    // If no event, use the numeric ID we got from creation
    const sessionNumericId = event?.args.sessionId || numericId;
    console.log("Using session numeric ID:", sessionNumericId.toString());

    console.log("Session completed, generating NFT...");

    // Generate and upload session image
    const image = await generateSessionImage({
      sessionId: sessionNumericId.toString(),
      timestamp: Date.now(),
      summary,
      topics: [],
      duration,
      moodScore,
      achievements,
      completed: true,
    });

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageUri = await uploadSessionImage(imageBuffer);

    console.log("Image uploaded to IPFS:", imageUri);

    // Create and upload metadata
    const metadata = {
      name: `Therapy Session #${sessionNumericId.toString()}`,
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
    console.log("Metadata uploaded to IPFS:", metadataUri);

    // Mint the NFT
    console.log("Minting NFT...");
    const mintTx = await contract.mintSessionNFT(
      await signer.getAddress(),
      metadataUri,
      {
        sessionId: sessionNumericId,
        timestamp: Math.floor(Date.now() / 1000),
        summary,
        topics: [],
        duration,
        moodScore,
        achievements,
        completed: true,
      }
    );

    const mintReceipt = await mintTx.wait();
    console.log("NFT minted successfully");

    // Get the NFT minting event
    const mintEvent = mintReceipt.events?.find(
      (e: any) => e.event === "SessionNFTMinted"
    );

    return {
      sessionId: sessionNumericId.toString(),
      uuid: sessionId,
      imageUri: `ipfs://${imageUri}`,
      metadataUri: `ipfs://${metadataUri}`,
      tokenId: mintEvent?.args.tokenId?.toString(),
    };
  } catch (error) {
    console.error("Error completing therapy session:", error);
    throw new Error(
      `Failed to complete therapy session: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Add helper function to get numeric ID from UUID
export async function getNumericIdFromUUID(
  provider: ethers.Provider,
  uuid: string
): Promise<string> {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS!,
    TherapyConsent.abi,
    provider
  );
  const numericId = await contract.getNumericId(uuid);
  return numericId.toString();
}

// Add helper function to get UUID from numeric ID
export async function getUUIDFromNumericId(
  provider: ethers.Provider,
  numericId: string
): Promise<string> {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS!,
    TherapyConsent.abi,
    provider
  );
  return await contract.getUuid(numericId);
}

export const getUserSessions = async (
  provider: ethers.Provider,
  userAddress: string
) => {
  try {
    console.log("Getting sessions for address:", userAddress);
    console.log("Using contract address:", CONTRACT_ADDRESS);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS!,
      TherapyConsent.abi,
      provider
    );

    // First get the balance of NFTs for the user
    const balance = await contract.balanceOf(userAddress);
    console.log("User NFT balance:", balance.toString());

    if (balance.toString() === "0") {
      console.log("User has no NFTs");
      return [];
    }

    // Get all NFTs owned by the user
    const sessions = [];
    for (let i = 0; i < balance.toNumber(); i++) {
      try {
        // Get token ID for each NFT
        const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
        console.log("Found token ID:", tokenId.toString());

        // Get token URI
        const tokenUri = await contract.tokenURI(tokenId);
        console.log("Token URI:", tokenUri);

        // Get session details
        const sessionDetails = await contract.getSessionDetails(tokenId);
        console.log("Session details:", sessionDetails);

        // Fetch metadata from IPFS
        const metadataResponse = await fetch(
          `https://gateway.pinata.cloud/ipfs/${tokenUri.replace("ipfs://", "")}`
        );
        const metadata = await metadataResponse.json();
        console.log("Metadata:", metadata);

        sessions.push({
          sessionId: tokenId.toString(),
          imageUri: metadata.image,
          metadata: {
            name: metadata.name,
            description: metadata.description,
            attributes: metadata.attributes,
          },
        });
      } catch (error) {
        console.error("Error fetching NFT details:", error);
        // Continue to next NFT if one fails
        continue;
      }
    }

    console.log("Found sessions:", sessions);
    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw new Error(
      `Failed to get user sessions: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
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
