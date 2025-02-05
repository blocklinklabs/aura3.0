"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNovaAgent } from "@/lib/agents/nova.agent";
import { useRouter } from "next/navigation";

export function FixedChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm Nova. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);

  const nova = useNovaAgent();
  const router = useRouter();

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // AI agent analysis
    await nova.analyzeMood(50, message); // You could use sentiment analysis here

    // Get AI suggestions
    const suggestions = nova.suggestions;
    const latestSuggestion = suggestions[suggestions.length - 1];

    // Autonomous response based on analysis
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            latestSuggestion?.content ||
            "I understand. Would you like to explore that further?",
          timestamp: new Date(),
        },
      ]);

      // Proactive environment adjustment if needed
      if (latestSuggestion?.type === "environment") {
        nova.adjustEnvironment();
      }
    }, 1000);
  };

  // Proactive check-ins
  useEffect(() => {
    const checkInInterval = setInterval(() => {
      const lastInteraction = nova.currentContext.lastInteraction;
      const hoursSinceLastInteraction =
        (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastInteraction > 4 && !isOpen) {
        setIsOpen(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Hi! I noticed you've been away for a while. How are you feeling now?",
            timestamp: new Date(),
          },
        ]);
      }
    }, 1000 * 60 * 30); // Check every 30 minutes

    return () => clearInterval(checkInInterval);
  }, []);

  const handleClick = () => {
    router.push("/therapy/new");
  };

  return (
    <div className="fixed bottom-6 right-6">
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        onClick={handleClick}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
