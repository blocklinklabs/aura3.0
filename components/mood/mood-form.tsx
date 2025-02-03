"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { useNovaAgent } from "@/lib/agents/nova.agent";

const emotions = [
  { value: 0, label: "😔 Down", color: "from-blue-500/50" },
  { value: 25, label: "😊 Content", color: "from-green-500/50" },
  { value: 50, label: "😌 Peaceful", color: "from-purple-500/50" },
  { value: 75, label: "🤗 Happy", color: "from-yellow-500/50" },
  { value: 100, label: "✨ Excited", color: "from-pink-500/50" },
];

export function MoodForm() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(50);
  const [note, setNote] = useState("");
  const nova = useNovaAgent();

  const currentEmotion =
    emotions.find((em) => Math.abs(mood - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {
    // Trigger AI analysis
    await nova.analyzeMood(mood, note);

    // Handle high-risk situations
    if (mood < 20) {
      await nova.handleCrisis();
    }

    // Get AI suggestions
    const suggestions = nova.suggestions;
    if (suggestions.length > 0) {
      // Implement suggestion UI (could be a toast notification)
      console.log("AI Suggestions:", suggestions);
    }

    setOpen(false);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Mood Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              {emotions.map((em) => (
                <div
                  key={em.value}
                  className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 ${
                    Math.abs(mood - em.value) < 15
                      ? "opacity-100 scale-110"
                      : "opacity-50 scale-100"
                  }`}
                  onClick={() => setMood(em.value)}
                >
                  <div className="text-2xl">{em.label.split(" ")[0]}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {em.label.split(" ")[1]}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative px-2">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-20 blur-2xl -z-10`}
              />
              <Slider
                value={[mood]}
                onValueChange={(value) => setMood(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Would you like to add a note?
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="h-32"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Save Entry</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
