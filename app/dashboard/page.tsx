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
  ArrowRight,
  X,
  XCircle,
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
import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FixedChat } from "@/components/chat/fixed-chat";
import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import { ExpandableChat } from "@/components/chat/expandable-chat";
import { MoodTracker } from "@/components/mood/mood-tracker";
import { FitbitConnect } from "@/components/wearables/fitbit-connect";
import { ActivityList } from "@/components/activities/activity-list";
import { ChatHistory } from "@/components/chat/chat-history";
import {
  getTodaysActivities,
  updateActivityStatus,
  getLatestHealthMetrics,
} from "@/lib/db/actions";
import { StartSessionModal } from "@/components/therapy/start-session-modal";
import { SessionHistory } from "@/components/therapy/session-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format, subDays } from "date-fns";
import { useAuth } from "@/lib/contexts/auth-context";
import Modal from "@/components/Modal";

// Add this type definition
type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

// Add this component for the contribution graph
const ContributionGraph = ({ data }: { data: DayActivity[] }) => {
  const getLevelColor = (level: ActivityLevel) => {
    switch (level) {
      case "high":
        return "bg-primary hover:bg-primary/90";
      case "medium":
        return "bg-primary/60 hover:bg-primary/70";
      case "low":
        return "bg-primary/30 hover:bg-primary/40";
      default:
        return "bg-muted hover:bg-muted/80";
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {data.map((day, i) => (
          <div key={i} className="group relative">
            <div
              className={cn(
                "w-full aspect-square rounded-sm cursor-pointer transition-colors",
                getLevelColor(day.level)
              )}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                <p className="font-medium">{format(day.date, "MMM d, yyyy")}</p>
                <p>{day.activities.length} activities</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { isLoading, user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

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

  // New states for activities and wearables
  // const [activities, setActivities] = useState([]);
  // const [wearableConnected, setWearableConnected] = useState(false);
  // const [healthMetrics, setHealthMetrics] = useState({...});

  // Also add userId for the function call
  // const userId = "current-user-id"; // Replace this with actual user ID from your auth system

  // New states for mood tracking
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);

  // In your Dashboard component, add this state
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>(() => {
    // Generate sample data for the last 28 days
    return Array.from({ length: 28 }, (_, i) => ({
      date: subDays(new Date(), 27 - i),
      level: ["none", "low", "medium", "high"][
        Math.floor(Math.random() * 4)
      ] as ActivityLevel,
      activities: Array.from(
        { length: Math.floor(Math.random() * 5) },
        (_, j) => ({
          type: ["meditation", "exercise", "therapy", "journaling"][
            Math.floor(Math.random() * 4)
          ],
          name: [
            "Morning Meditation",
            "Evening Walk",
            "Therapy Session",
            "Daily Journal",
          ][Math.floor(Math.random() * 4)],
          completed: Math.random() > 0.3,
          time: format(addDays(new Date(), j), "h:mm a"),
        })
      ),
    }));
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if we have a hash in the URL (contains access token after auth)
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        // Store the token securely
        localStorage.setItem("fitbit_token", accessToken);
        // Clear the URL
        router.replace("/dashboard");
        // Update state to show connected
        // setWearableConnected(true);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowModal(true);
      // Redirect after a short delay to allow modal to be shown
      const timeout = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isLoading, router]);

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

  // Fetch activities and health metrics
  // useEffect(() => {
  //   if (mounted) {
  //     fetchTodaysActivities();
  //     fetchHealthMetrics();
  //   }
  // }, [mounted]);

  // Add these action handlers
  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodEntry = () => {
    // You can either use a modal or redirect to a mood entry page
    setShowMoodModal(true);
  };

  const handleAICheckIn = () => {
    // This could open the chat with a specific AI check-in flow
    setShowCheckInChat(true);
  };

  // Function to fetch Fitbit data
  const fetchFitbitData = async () => {
    const token = localStorage.getItem("fitbit_token");
    if (!token) return;

    try {
      const response = await fetch(
        "https://api.fitbit.com/1/user/-/profile.json",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle the data
        console.log(data);
      } else {
        // Handle error or token expiration
        // setWearableConnected(false);
        localStorage.removeItem("fitbit_token");
      }
    } catch (error) {
      console.error("Failed to fetch Fitbit data:", error);
    }
  };

  // Use the fetchFitbitData function when needed
  useEffect(() => {
    if (mounted) {
      fetchFitbitData();
    }
  }, [mounted]);

  // Simple loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Debug auth state
  console.log("Auth state:", { isAuthenticated, user, isLoading });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please sign in to continue
          </h2>
          <p className="text-muted-foreground">
            You need to be authenticated to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-20 pb-8 space-y-6">
        {/* Header Section */}
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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Crisis Alert */}
        {showCrisisAlert && (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Support Available</AlertTitle>
            <AlertDescription>
              We've noticed you might be having a difficult time. Help is
              available 24/7.
              <div className="mt-2">
                <Button variant="secondary" className="mr-2">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call Crisis Line
                </Button>
                <Button variant="outline">Message Therapist</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Actions Card */}
            <Card className="border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quick Actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your wellness journey
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full justify-between items-center p-6 h-auto group/button",
                        "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90",
                        "transition-all duration-200 group-hover:translate-y-[-2px]"
                      )}
                      onClick={handleStartTherapy}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">
                            Start Therapy
                          </div>
                          <div className="text-xs text-white/80">
                            Begin a new session
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={handleMoodEntry}
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                          <Heart className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Track Mood</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            How are you feeling?
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={handleAICheckIn}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                          <BrainCircuit className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">AI Check-in</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Quick wellness check
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview Card */}
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Today's Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {wellnessStats.map((stat) => (
                      <div
                        key={stat.title}
                        className={cn(
                          "p-3 rounded-lg transition-all duration-200",
                          stat.bgColor,
                          "hover:scale-[1.02]"
                        )}
                      >
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">AI Insights</h3>
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-primary/5 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <insight.icon className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">{insight.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Spans 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Fitbit Connect Card */}
              <Card className="border-primary/10 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Left side - Icon */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-2 ring-primary/5">
                        <Wifi className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Middle - Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold mb-1">
                          Connect Your Fitbit
                        </h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track health metrics and get personalized insights
                      </p>
                    </div>

                    {/* Right side - Button */}
                    <div className="shrink-0">
                      <Button
                        className="bg-primary/20 hover:bg-primary/30 cursor-not-allowed"
                        disabled
                      >
                        Connect
                      </Button>
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    <span>Integration coming soon - Stay tuned!</span>
                  </div>
                </CardContent>
              </Card>

              {/* Anxiety Games - Now directly below Fitbit */}
              <AnxietyGames />
            </div>

            {/* Right Column - Activities */}
            <div>
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>Activity Overview</CardTitle>
                      <CardDescription>
                        Your wellness journey over time
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-sm bg-muted" />
                        <span>Less</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contribution Graph */}
                  <ContributionGraph data={activityHistory} />

                  {/* Recent Activities */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Recent Activities</h4>
                    <div className="space-y-2">
                      {activityHistory.slice(-3).flatMap((day) =>
                        day.activities.map((activity, i) => (
                          <div
                            key={`${format(day.date, "yyyy-MM-dd")}-${i}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  activity.completed
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                                )}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(day.date, "MMM d")}{" "}
                                  {activity.time && `at ${activity.time}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "text-xs",
                                activity.completed && "text-green-500"
                              )}
                            >
                              {activity.completed ? "Completed" : "Start"}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Fixed Chat */}
      <FixedChat />

      {/* Mood tracking modal */}
      {showMoodModal && (
        <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>How are you feeling?</DialogTitle>
              <DialogDescription>
                Track your mood to get personalized insights and support.
              </DialogDescription>
            </DialogHeader>
            <MoodForm onSubmit={() => setShowMoodModal(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* AI check-in chat */}
      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {/* Add your AI chat interface here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
