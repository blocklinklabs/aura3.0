"use client";

import { MessageSquare, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Session = {
  id: string;
  title: string;
  date: string;
  isActive?: boolean;
  lastMessage?: string;
};

const dummySessions: Session[] = [
  {
    id: "343",
    title: "Stress Management Discussion",
    date: "Today",
    lastMessage: "Let's focus on breathing exercises...",
    isActive: true,
  },
  {
    id: "342",
    title: "Anxiety and Work-Life Balance",
    date: "Yesterday",
    lastMessage: "How have you been managing your schedule?",
  },
  {
    id: "341",
    title: "Personal Growth Session",
    date: "2 days ago",
    lastMessage: "Your progress has been remarkable...",
  },
  {
    id: "340",
    title: "Relationship Counseling",
    date: "1 week ago",
    lastMessage: "Communication is key in relationships...",
  },
  // Add more dummy sessions as needed
];

export function SessionHistory() {
  return (
    <div className="flex flex-col h-full bg-muted/5">
      <div className="p-3 border-b">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Session History</span>
        </h2>
        <Button
          variant="default"
          className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary"
        >
          <MessageSquare className="w-4 h-4" />
          New Session
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-1.5">
        {dummySessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-1.5"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-3 h-auto flex-col items-start gap-0.5",
                "hover:bg-muted/50 rounded-lg my-0.5 transition-all duration-200",
                session.isActive && "bg-primary/5 hover:bg-primary/10"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {session.date}
                </span>
              </div>
              <span className="text-sm font-medium truncate w-full">
                {session.title}
              </span>
              {session.lastMessage && (
                <p className="text-xs text-muted-foreground line-clamp-1 text-left w-full">
                  {session.lastMessage}
                </p>
              )}
              {session.isActive && (
                <div className="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
