import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Waves,
  Database,
  MessageCircle,
  BarChart3,
  Bot,
  TrendingUp,
  Globe,
  Download,
  Users,
  Award,
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import oceanHero from "@/assets/ocean-hero.jpg";
import { useState, useEffect } from "react";

const Index = () => {
  // Stats, Why FloatChat, Features, Testimonials
  const stats = [
    { icon: Database, label: "Active Floats", value: "4,127", color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
    { icon: BarChart3, label: "Data Points", value: "2.3M", color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { icon: MessageCircle, label: "Queries Today", value: "156", color: "text-purple-400", bgColor: "bg-purple-500/10" },
    { icon: Users, label: "Active Researchers", value: "847", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  ];

  const whyFloatChat = [
    {
      title: "Complex Ocean Data",
      description: "Ocean data is scattered across thousands of ARGO floats, making it difficult for researchers to find relevant insights quickly.",
      icon: Database
    },
    {
      title: "AI-Powered Solution",
      description: "FloatChat uses natural language processing to make ocean data accessible through simple conversations.",
      icon: Bot
    },
    {
      title: "Instant Insights",
      description: "Get temperature profiles, salinity measurements, and trends in seconds instead of hours of manual analysis.",
      icon: TrendingUp
    }
  ];

  const features = [
    {
      title: "Chat with ARGO Data",
      description: "Ask natural language questions about ocean temperature, salinity, and currents",
      icon: Waves,
      color: "text-cyan-400"
    },
    {
      title: "Auto-visualization",
      description: "Automatically generate charts, graphs, and visualizations from your queries",
      icon: BarChart3,
      color: "text-blue-400"
    },
    {
      title: "Interactive Maps",
      description: "Explore ocean data on interactive maps with real-time float locations",
      icon: Globe,
      color: "text-emerald-400"
    },
    {
      title: "Download Data",
      description: "Export filtered datasets and visualizations for your research",
      icon: Download,
      color: "text-purple-400"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Marine Biologist, NOAA",
      content: "FloatChat has revolutionized how we access ocean data. What used to take hours now takes minutes."
    },
    {
      name: "Prof. James Miller",
      role: "Oceanographer, MIT",
      content: "The natural language interface makes complex ocean datasets accessible to students and researchers alike."
    }
  ];

  // Dynamic Typing tagline
  const taglineEndings = [
    "Clear Insights",
    "Smarter Decisions",
    "Global Solutions",
    "Climate Action",
    "Everyday Understanding",
  ];

  const [currentEndingIndex, setCurrentEndingIndex] = useState(0);
  const [displayedEnding, setDisplayedEnding] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentEnding = taglineEndings[currentEndingIndex];
    if (charIndex < currentEnding.length) {
      const timeout = setTimeout(() => {
        setDisplayedEnding((prev) => prev + currentEnding[charIndex]);
        setCharIndex(charIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const pause = setTimeout(() => {
        setDisplayedEnding("");
        setCharIndex(0);
        setCurrentEndingIndex((prev) => (prev + 1) % taglineEndings.length);
      }, 2000);
      return () => clearTimeout(pause);
    }
  }, [charIndex, currentEndingIndex]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] overflow-hidden flex items-center">
        <img
          src={oceanHero}
          alt="Underwater oceanographic research scene"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-teal-600/60 to-teal-600/20" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-red">
          <div className="max-w-4xl mx-auto">

            <h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
              style={{
                textShadow: `
      0 0 10px rgba(238, 237, 233, 0.9),
      0 0 20px rgba(244, 242, 239, 0.7),
      0 0 30px rgba(248, 246, 239, 0.5)
    `
              }}
            >
              Welcome to FloatChat
            </h1>




            <div className="h-10 md:h-12 relative overflow-hidden mb-10">
              <p className="text-xl md:text-2xl font-semibold text-white">
                From Deep Seas to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400">
                  {displayedEnding}
                </span>
                <span className="inline-block w-1 ml-1 animate-pulse bg-cyan-400 h-6 align-middle"></span>
              </p>
            </div>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Explore oceanographic insights through natural language. Ask
              questions about temperature, salinity, and ocean currents using
              ARGO float data from around the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/explorer">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-400 hover:to-cyan-400 text-white px-8 py-6 text-lg font-bold rounded-lg shadow-md hover:scale-105 transition-transform"
                >
                  Start Chat <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-lg border border-white text-white bg-transparent hover:bg-white/10 flex items-center gap-2 justify-center transition-colors duration-300 hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Rest of sections from first web app ---- */}

      {/* Why FloatChat Section */}
      <div className="py-16 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-600 bg-clip-text text-transparent drop-shadow-md">FloatChat</span>?
            </h2>
            <p className="text-l text-gray-600 max-w-3xl mx-auto">
              Ocean research shouldn't be limited by data accessibility. We bridge the gap between complex datasets and actionable insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyFloatChat.map((item, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-extrabold mb-4">
              <span className="text-gray-900">See </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-600 font-extrabold">
                FloatChat
              </span>
              <span className="text-gray-900"> in Action</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the power of conversational ocean data exploration
            </p>
          </div>
          <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-xl max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="aspect-video bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-lg text-gray-600">Interactive Demo Coming Soon</p>
                  <p className="text-sm text-gray-600 mt-2">Chat interface with live visualizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to explore, analyze, and understand ocean data through intuitive conversations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-full bg-gray-100 mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-cyan-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Explore Ocean Data?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your first conversation with ARGO float data and discover insights in minutes, not hours.
          </p>
          <Link to="/explorer">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Start Chatting Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
