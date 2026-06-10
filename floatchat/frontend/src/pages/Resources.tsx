import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Video, 
  FileText, 
  ExternalLink, 
  Download,
  Users,
  HelpCircle,
  Code,
  Database,
  Waves,
  BarChart3,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

interface Tutorial {
  title: string;
  description: string;
  type: string;
  duration: string;
  difficulty: string;
  videoSrc?: string;
}

const Resources = () => {
  const tutorials: Tutorial[] = [
    {
      title: "Getting Started with FloatChat",
      description: "Learn the basics of querying ocean data using natural language",
      type: "Video",
      duration: "5 min",
      difficulty: "Beginner",
      videoSrc: "/videos/intro.mp4",
    },
    {
      title: "Advanced Query Techniques", 
      description: "Master complex queries for specific research needs",
      type: "Article",
      duration: "10 min",
      difficulty: "Intermediate",
      videoSrc: "/videos/intro1.mp4",
    },
    {
      title: "Data Visualization Guide",
      description: "Create compelling visualizations from your ocean data queries",
      type: "Tutorial",
      duration: "15 min",
      difficulty: "Intermediate",
      videoSrc: "/videos/intro2.mp4",
    }
  ];

  const documentation = [
    {
      title: "API Reference",
      description: "Complete API documentation for developers",
      icon: Code
    },
    {
      title: "Data Schema",
      description: "Understanding ARGO float data structure and formats",
      icon: Database
    },
    {
      title: "Query Syntax",
      description: "Natural language patterns and advanced query options",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-600 to-blue-700 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400 opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-white">
            Learn Ocean Data Analysis
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Comprehensive guides, tutorials, and documentation to help you master 
            oceanographic data exploration with <span className="font-semibold text-white">FloatChat</span>.
          </p>
        </div>
      </div>

      {/* What is ARGO Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white mb-4">Ocean Science</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">What is ARGO?</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The ARGO program is a global network of autonomous profiling floats that drift with ocean currents, 
                collecting temperature and salinity measurements from the surface to 2000 meters depth every 10 days.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Global Coverage</h3>
                    <p className="text-gray-600">Over 4,000 floats provide real-time ocean measurements worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Autonomous Operation</h3>
                    <p className="text-gray-600">Floats operate independently for 3-5 years, transmitting data via satellite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quality Control</h3>
                    <p className="text-gray-600">Rigorous data validation ensures research-grade accuracy</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mr-4">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit ARGO Website
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Factsheet
              </Button>
            </div>
            
            <Card className="bg-white border-gray-200 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                      <Waves className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">4,000+</p>
                    <p className="text-gray-600">Active Floats</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-blue-500 mb-4">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">365</p>
                    <p className="text-gray-600">Days/Year</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-cyan-500 mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">2000m</p>
                    <p className="text-gray-600">Max Depth</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-gray-200 mb-4">
                      <Database className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">10</p>
                    <p className="text-gray-600">Day Cycle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tutorials Section */}
      <div className="py-20 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tutorials & Guides</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Step-by-step tutorials to help you get the most out of FloatChat and ocean data analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {tutorial.type === 'Video' && <Video className="w-5 h-5 text-blue-600" />}
                      {tutorial.type === 'Article' && <FileText className="w-5 h-5 text-cyan-600" />}
                      {tutorial.type === 'Tutorial' && <Book className="w-5 h-5 text-emerald-600" />}
                      <Badge variant="outline" className="text-xs">{tutorial.type}</Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">{tutorial.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{tutorial.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {tutorial.videoSrc && (
                    <video
                      src={tutorial.videoSrc}
                      className="w-full h-48 object-cover mb-4 rounded-md"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls={false}
                    />
                  )}
                  <p className="text-gray-600">{tutorial.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">{tutorial.duration}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white"
                    >
                      Start <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Section */}
       <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">API & Documentation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Technical documentation for developers and advanced users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {documentation.map((doc, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 mb-6 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                    <doc.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{doc.title}</h3>
                  <p className="text-gray-600 mb-4">{doc.description}</p>
                  <Button variant="outline" size="sm">
                    View Documentation <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-gray-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our community and support team are here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
                <Link to="/contact">
                  <Button variant="outline">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="py-20 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Reference</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Query Examples", desc: "Common queries and their syntax", icon: FileText },
              { title: "Data Types", desc: "Available parameters and measurements", icon: Database },
              { title: "Export Formats", desc: "Supported file formats for data export", icon: Download },
              { title: "FAQ", desc: "Frequently asked questions and answers", icon: HelpCircle }
            ].map((item, index) => (
              <Card key={index} className="bg-card border-border shadow-ocean hover:shadow-float transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-gray-100 mb-4">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {/* ... Keep your existing Documentation, Quick Links sections as they are ... */}

    </div>
  );
};

export default Resources;
