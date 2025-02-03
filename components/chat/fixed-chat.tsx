"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNovaAgent } from "@/lib/agents/nova.agent";

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.75 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : 500,
            }}
            exit={{ opacity: 0, y: 50, scale: 0.75 }}
            className="mb-2"
          >
            <Card className="w-[380px] shadow-xl border-primary/10">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/nova-avatar.png" />
                    <AvatarFallback>N</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">Nova Chat</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!isMinimized && (
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${
                            msg.role === "assistant"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${
                              msg.role === "assistant"
                                ? "flex-row"
                                : "flex-row-reverse"
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  msg.role === "assistant"
                                    ? "/nova-avatar.png"
                                    : "/user-avatar.png"
                                }
                              />
                              <AvatarFallback>
                                {msg.role === "assistant" ? "N" : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg p-3 ${
                                msg.role === "assistant"
                                  ? "bg-primary/10"
                                  : "bg-primary"
                              }`}
                            >
                              <p
                                className={
                                  msg.role === "assistant"
                                    ? "text-foreground"
                                    : "text-primary-foreground"
                                }
                              >
                                {msg.content}
                              </p>
                              <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit">Send</Button>
                    </form>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
