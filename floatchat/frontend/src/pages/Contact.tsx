import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  HelpCircle,
  Users,
  ExternalLink,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    // Console output removed
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch for general inquiries",
      details: "hello@floatchat.ai",
      action: "Send Email"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      details: "Available 9 AM - 5 PM EST",
      action: "Start Chat"
    },
    {
      icon: Users,
      title: "Community",
      description: "Join our research community",
      details: "Discord & Forums",
      action: "Join Now"
    }
  ];

  const officeInfo = {
    address: "123 Ocean Science Drive\nCambridge, MA 02139\nUnited States",
    hours: "Monday - Friday\n9:00 AM - 6:00 PM EST",
    timezone: "Eastern Standard Time (EST)"
  };

  const faqs = [
    {
      question: "How accurate is the ARGO float data?",
      answer: "All ARGO data undergoes rigorous quality control processes. The data meets international oceanographic standards and is used by researchers worldwide."
    },
    {
      question: "Can I export data for my research?",
      answer: "Yes! FloatChat supports multiple export formats including CSV, JSON, and NetCDF for research use."
    },
    {
      question: "Is FloatChat free to use?",
      answer: "We offer a free tier for basic queries and visualizations. Advanced features and higher usage limits are available through our research plans."
    },
    {
      question: "How do I cite FloatChat in my research?",
      answer: "We provide proper citation formats in our documentation. Please include both FloatChat and the original ARGO data sources."
    }
  ];

  return (
    <div className="min-h-screen bg-depth">
      {/* Hero Section */}
      <div className="bg-ocean py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 mb-4">
            Contact Us
          </Badge>
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Get in Touch with
            <span className="block text-transparent bg-gradient-to-r from-accent to-primary-glow bg-clip-text">
              Our Team
            </span>
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            Have questions about FloatChat? Need support with your research? 
            We're here to help you make the most of ocean data exploration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="bg-card border-border shadow-float">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Send className="w-6 h-6 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What can we help you with?"
                      required
                      className="bg-background"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your inquiry, research needs, or feedback..."
                      rows={6}
                      required
                      className="bg-background"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-ocean hover:bg-primary-glow text-lg py-6">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-card border-border shadow-ocean mt-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-b-0">
                      <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods & Info */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="bg-card border-border shadow-ocean hover:shadow-float transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-muted group-hover:bg-ocean group-hover:text-primary-foreground transition-all">
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{method.title}</h3>
                        <p className="text-muted-foreground mb-2">{method.description}</p>
                        <p className="text-sm font-medium text-primary mb-3">{method.details}</p>
                        <Button variant="outline" size="sm" className="group-hover:bg-ocean group-hover:text-primary-foreground group-hover:border-ocean">
                          {method.action}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Office Information */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border shadow-ocean">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Office Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-line text-sm">
                      {officeInfo.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Business Hours
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-line text-sm">
                      {officeInfo.hours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-card border-border shadow-ocean">
              <CardHeader>
                <CardTitle className="text-xl">Connect With Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Follow us for updates on new features and ocean science discoveries
                </p>
              </CardContent>
            </Card>

            {/* Research Collaboration */}
            <Card className="bg-gradient-to-br from-accent/5 to-secondary/5 border-border shadow-ocean">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Research Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Interested in collaborating on research projects or integrating FloatChat 
                  into your institution's workflow? We'd love to discuss partnership opportunities.
                </p>
                <Button className="w-full bg-accent hover:bg-accent/90">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Research Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Response Time Notice */}
      <div className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">We'll Get Back to You Soon</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We typically respond to all inquiries within 24 hours during business days. 
            For urgent technical issues, please use our live chat feature for faster assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;