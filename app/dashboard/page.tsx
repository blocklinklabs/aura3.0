"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  LineChart,
  MessageCircle,
  Activity,
  Sun,
  Moon,
  Cloud,
  Timer,
  BookOpen,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Pill,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Settings,
  Wand2,
  Wifi,
  Thermometer,
  Music,
  Lamp,
  BrainCircuit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FixedChat } from "@/components/chat/fixed-chat";
import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import { ExpandableChat } from "@/components/chat/expandable-chat";
import { MoodTracker } from "@/components/mood/mood-tracker";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // New states for crisis management and interventions
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [interventions, setInterventions] = useState([
    {
      type: "meditation",
      title: "Breathing Exercise",
      duration: "5 mins",
      completed: false,
    },
    {
      type: "activity",
      title: "Evening Walk",
      duration: "20 mins",
      completed: true,
    },
  ]);

  // Crisis resources
  const emergencyContacts = [
    { name: "Crisis Hotline", number: "1-800-273-8255" },
    { name: "Therapist", number: "Dr. Smith - (555) 123-4567" },
  ];

  // Medication tracking
  const medications = [
    {
      name: "Sertraline",
      dosage: "50mg",
      time: "9:00 AM",
      taken: true,
    },
    {
      name: "Vitamin D",
      dosage: "1000 IU",
      time: "9:00 AM",
      taken: false,
    },
  ];

  // AI Insights
  const aiInsights = [
    {
      title: "Sleep Pattern Improvement",
      description:
        "Your sleep quality has improved by 15% this week. Keep maintaining your bedtime routine!",
      icon: Moon,
    },
    {
      title: "Mood Pattern Detected",
      description:
        "I notice your mood tends to dip in the evenings. Would you like to schedule an evening check-in?",
      icon: Brain,
    },
  ];

  // New states for chat and IoT
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi Sarah, how are you feeling today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      role: "user",
      content: "I'm feeling a bit anxious about my presentation tomorrow.",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      role: "assistant",
      content:
        "I understand presentations can be stressful. Would you like to try a quick breathing exercise together?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ]);

  const [smartEnvironment, setSmartEnvironment] = useState({
    lights: {
      brightness: 80,
      color: "warm",
      isOn: true,
    },
    temperature: 72,
    music: {
      isPlaying: false,
      volume: 40,
      playlist: "Calm Focus",
    },
  });

  // Wearable data
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 72,
    steps: 8432,
    sleepHours: 7.5,
    stressLevel: "medium",
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const moodHistory = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 75 },
    { day: "Wed", value: 85 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 85 },
  ];

  const upcomingSessions = [
    {
      title: "Therapy Session",
      time: "2:00 PM",
      date: "Today",
      type: "Video Call",
    },
    {
      title: "Meditation",
      time: "9:00 AM",
      date: "Tomorrow",
      type: "Group Session",
    },
  ];

  const wellnessStats = [
    {
      title: "Mood Score",
      value: "85%",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Sleep Quality",
      value: "7.5hrs",
      icon: Moon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Mindfulness",
      value: "12 days",
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Goals Met",
      value: "8/10",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-20 pb-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, Sarah
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Add MoodForm near the top */}
        <div className="flex justify-end">
          <MoodForm />
        </div>

        {/* Crisis Alert - Shows based on risk assessment */}
        {showCrisisAlert && (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Support Available</AlertTitle>
            <AlertDescription>
              We've noticed you might be having a difficult time. Help is
              available 24/7.
              <div className="mt-2">
                <Button variant="secondary" className="mr-2" onClick={() => {}}>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call Crisis Line
                </Button>
                <Button variant="outline" onClick={() => {}}>
                  Message Therapist
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Start Therapy Session
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            AI Check-in
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Adjust Environment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wellnessStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Anxiety Games */}
        <AnxietyGames />

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Chat and Mood */}
          <div className="space-y-4">
            <ExpandableChat />
            <MoodTracker />
          </div>

          {/* Middle Column - Smart Environment */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Smart Environment
              </CardTitle>
              <CardDescription>
                Optimize your space for well-being
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lighting Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Lamp className="h-4 w-4 text-primary" />
                    <span>Lighting</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {smartEnvironment.lights.isOn ? "On" : "Off"}
                  </Button>
                </div>
                <Progress value={smartEnvironment.lights.brightness} />
              </div>

              {/* Temperature Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    <span>Temperature</span>
                  </div>
                  <span>{smartEnvironment.temperature}°F</span>
                </div>
                <Progress value={smartEnvironment.temperature} max={100} />
              </div>

              {/* Music Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span>Ambient Music</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {smartEnvironment.music.isPlaying ? "Playing" : "Play"}
                  </Button>
                </div>
                <Progress value={smartEnvironment.music.volume} />
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Medication Tracking */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Medication Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            med.taken ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-foreground">
                            {med.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} at {med.time}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {med.taken ? "Taken" : "Take Now"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Activities */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Today's Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interventions.map((intervention, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <Timer className="w-4 h-4 text-primary" />
                        <div>
                          <h4 className="font-medium text-foreground">
                            {intervention.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {intervention.duration}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {intervention.completed ? "Completed" : "Start"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wearable Integration */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-primary/5">
                      <p className="text-sm text-muted-foreground">
                        Heart Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {healthMetrics.heartRate}
                      </p>
                      <p className="text-xs text-muted-foreground">BPM</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5">
                      <p className="text-sm text-muted-foreground">Steps</p>
                      <p className="text-2xl font-bold">
                        {healthMetrics.steps}
                      </p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

      {/* Fixed Chat Component */}
      <FixedChat />
    </div>
  );
}
