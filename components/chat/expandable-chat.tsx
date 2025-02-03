"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNovaAgent } from "@/lib/agents/nova.agent";

export function ExpandableChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const nova = useNovaAgent();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm Nova. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    await nova.analyzeMood(50, message);
    const suggestions = nova.suggestions;
    const latestSuggestion = suggestions[suggestions.length - 1];

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
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={false}
        animate={{
          position: isExpanded ? "fixed" : "relative",
          top: isExpanded ? 0 : "auto",
          left: isExpanded ? 0 : "auto",
          right: isExpanded ? 0 : "auto",
          bottom: isExpanded ? 0 : "auto",
          width: isExpanded ? "100%" : "auto",
          height: isExpanded ? "100vh" : "auto",
          zIndex: isExpanded ? 50 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="bg-background"
      >
        <Card
          className={`${
            isExpanded ? "h-full rounded-none" : "border-primary/10"
          }`}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/nova-avatar.png" />
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Nova Chat</CardTitle>
                  <CardDescription>Your AI therapy companion</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={`flex flex-col ${
                isExpanded ? "h-[calc(100vh-8rem)]" : "h-[400px]"
              }`}
            >
              <ScrollArea className="flex-1 p-4">
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
              <div className="p-4 border-t mt-auto">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
