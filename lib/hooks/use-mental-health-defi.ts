import { useState, useCallback } from "react";
import { TherapyAgent } from "@/lib/agents/therapy.agent";
import { LitService } from "@/lib/services/lit.service";

export type SecurityStep = {
  id: string;
  label: string;
  icon: any;
  status: "pending" | "processing" | "completed" | "error";
};

export type TherapyMetrics = {
  attendance: number;
  progress: number;
  contribution: number;
  riskLevel?: number;
};

export type PaymentConfig = {
  sessionId: string;
  amount: string;
  userMetrics?: TherapyMetrics;
  enableCrisisFund?: boolean;
  communitySupport?: boolean;
};

export function useMentalHealthDeFi() {
  const [steps, setSteps] = useState<SecurityStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const therapyAgent = TherapyAgent.getInstance();
  const litService = LitService.getInstance();

  const updateStep = useCallback(
    (index: number, status: SecurityStep["status"]) => {
      setSteps((prev) =>
        prev.map((step, i) => (i === index ? { ...step, status } : step))
      );
    },
    []
  );

  const processTherapyPayment = useCallback(
    async (config: PaymentConfig) => {
      const { sessionId, amount, userMetrics, enableCrisisFund } = config;
      setIsProcessing(true);

      try {
        // Initialize security layers
        await litService.initialize();
        updateStep(0, "completed");

        // Verify credentials and generate auth
        const auth = await litService.generatePaymentAuthorization(
          sessionId,
          amount
        );
        updateStep(1, "completed");

        // Calculate dynamic pricing if metrics provided
        let finalAmount = amount;
        if (userMetrics) {
          const priceAdjustment = await therapyAgent.calculateSessionPrice(
            userMetrics
          );
          finalAmount = priceAdjustment.toString();
        }
        updateStep(2, "completed");

        // Process payment with both security layers
        await therapyAgent.processPayment(
          finalAmount,
          process.env.NEXT_PUBLIC_THERAPY_WALLET_ADDRESS!,
          auth
        );
        updateStep(3, "completed");

        // Setup crisis fund if enabled
        if (enableCrisisFund && userMetrics?.riskLevel) {
          await therapyAgent.manageCrisisFund(sessionId, userMetrics.riskLevel);
        }

        // Store encrypted session data
        await litService.storeSessionCredentials(sessionId, {
          paymentConfirmation: true,
          timestamp: new Date().toISOString(),
          amount: finalAmount,
          metrics: userMetrics,
        });
        updateStep(4, "completed");

        return { success: true, sessionId, amount: finalAmount };
      } catch (error) {
        console.error("Payment processing error:", error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [therapyAgent, litService, updateStep]
  );

  return {
    processTherapyPayment,
    steps,
    currentStep,
    isProcessing,
  };
}
