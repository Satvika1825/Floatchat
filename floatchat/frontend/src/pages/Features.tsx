import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  BarChart3, 
  Globe, 
  Download, 
  Bot, 
  Zap, 
  Shield, 
  Clock,
  Target,
  Database,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const mainFeatures = [
    {
      icon: Waves,
      title: "Natural Language Queries",
      description: "Ask questions in plain English like 'Show me temperature profiles in the Pacific Ocean'",
      benefits: ["No complex syntax", "Intuitive interaction", "Instant understanding"]
    },
    {
      icon: BarChart3,
      title: "Auto-Visualization",
      description: "Automatically generate charts, graphs, and plots from your data queries",
      benefits: ["Dynamic charts", "Export capabilities", "Multiple formats"]
    },
    {
      icon: Globe,
      title: "Interactive Maps",
      description: "Explore ocean data on interactive maps with real-time float positions",
      benefits: ["Global coverage", "Zoom & filter", "Real-time updates"]
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Download filtered datasets and visualizations for your research",
      benefits: ["CSV/JSON export", "High-res images", "Batch downloads"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Bot,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze patterns and trends"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Get instant results with our optimized data processing pipeline"
    },
    {
      icon: Shield,
      title: "Reliable Data",
      description: "Quality-controlled ARGO float data from the international network"
    },
    {
      icon: Clock,
      title: "Historical Archive",
      description: "Access decades of ocean measurements for trend analysis"
    },
    {
      icon: Target,
      title: "Precise Filtering",
      description: "Filter by region, depth, parameter, and time with precision"
    },
    {
      icon: Database,
      title: "Massive Dataset",
      description: "Access millions of ocean measurements from thousands of floats"
    }
  ];

  return (
    <div className="min-h-screen bg-depth">
      {/* Hero Section */}
      <div className="bg-ocean py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 mb-4">
            Features Overview
          </Badge>
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Powerful Features for
            <span className="block text-transparent bg-gradient-to-r from-accent to-primary-glow bg-clip-text">
              Ocean Research
            </span>
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            FloatChat combines cutting-edge AI technology with comprehensive ocean datasets 
            to deliver an unparalleled research experience.
          </p>
          <Link to="/explorer">
            <Button variant="secondary" size="lg" className="px-8 py-6 text-lg">
              Try Features Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Features */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Core Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to explore, analyze, and understand ocean data through conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="bg-card border-border shadow-ocean hover:shadow-float transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-ocean group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                      <p className="text-muted-foreground text-lg">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Features Grid */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Advanced Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with the latest technologies to deliver professional-grade ocean data analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="bg-card border-border shadow-ocean hover:shadow-float transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-muted mb-6 group-hover:bg-ocean group-hover:text-primary-foreground transition-all">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built on Cutting-Edge Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              FloatChat leverages the most advanced AI and data processing technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-ocean text-center">
              <CardContent className="p-8">
                <Badge className="bg-ocean text-primary-foreground mb-4">AI Engine</Badge>
                <h3 className="text-xl font-semibold text-foreground mb-4">Google ADK</h3>
                <p className="text-muted-foreground">
                  Advanced Agent Development Kit for natural language understanding and response generation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-ocean text-center">
              <CardContent className="p-8">
                <Badge className="bg-accent text-accent-foreground mb-4">Data Source</Badge>
                <h3 className="text-xl font-semibold text-foreground mb-4">ARGO Network</h3>
                <p className="text-muted-foreground">
                  International network of autonomous floats providing real-time ocean measurements.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-ocean text-center">
              <CardContent className="p-8">
                <Badge className="bg-secondary text-secondary-foreground mb-4">Architecture</Badge>
                <h3 className="text-xl font-semibold text-foreground mb-4">RAG System</h3>
                <p className="text-muted-foreground">
                  Retrieval-Augmented Generation for accurate, contextual responses from vast datasets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary/90 to-accent/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Experience These Features Today
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of researchers already using FloatChat to accelerate their ocean science discoveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explorer">
              <Button variant="secondary" size="lg" className="px-8 py-6 text-lg">
                Start Using FloatChat <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;