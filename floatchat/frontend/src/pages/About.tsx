import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  Award,
  Heart,
  Linkedin,
  Mail,
  ExternalLink,
  Waves,
  Globe,
  Zap,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {


  const values = [
    {
      icon: Waves,
      title: "Ocean First",
      description: "We're committed to advancing ocean science and making marine data accessible to everyone."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Our tools serve researchers worldwide, contributing to better understanding of our oceans."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We leverage cutting-edge AI to solve real problems in oceanographic research."
    },
    {
      icon: Shield,
      title: "Scientific Integrity",
      description: "We maintain the highest standards of data quality and scientific accuracy."
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
            About FloatChat
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Making Ocean Science
            <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
              Accessible to All
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            We believe that understanding our oceans shouldn't require years of specialized training.
            FloatChat democratizes access to ocean data through the power of conversational AI.
          </p>
          <Link to="/about">
            <Button variant="secondary" size="lg" className="px-8 py-6 text-lg">
              Get in Touch <Heart className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>


      {/* Mission & Vision */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-cyan-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To bridge the gap between complex oceanographic datasets and actionable insights
                  by making ocean data exploration as simple as having a conversation. We empower
                  researchers, students, and ocean enthusiasts to discover patterns and trends that
                  were previously hidden in vast datasets.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="w-6 h-6 text-blue-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A world where anyone can explore and understand ocean data, leading to better
                  climate science, marine conservation, and ocean policy decisions. We envision
                  FloatChat as the go-to platform for ocean data exploration, trusted by researchers
                  and educators worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at FloatChat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 mb-6 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Us in Ocean Discovery
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're a researcher, student, or ocean enthusiast, we'd love to hear from you
            and learn how FloatChat can support your work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Button variant="secondary" size="lg" className="px-8 py-6 text-lg">
              Contact Us <Mail className="ml-2 w-5 h-5" />
            </Button>

            <Link to="/explorer">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg">
                Try FloatChat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;