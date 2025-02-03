"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
export function PaymentButton({ walletId }: { walletId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const hash = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          amount: "0.01", // 0.01 ETH
          toAddress: "your-therapy-wallet-address",
        }),
      });

      toast({
        title: "Payment successful",
        description: "Your therapy session has been booked!",
      });
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? "Processing..." : "Book Session"}
    </Button>
  );
}
