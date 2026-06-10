import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import DataExplorer from "@/pages/DataExplorer";
import Visualization from "@/pages/Visualization";
import Resources from "@/pages/Resources";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import TestPlot from "./pages/TestPlot";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explorer" element={<DataExplorer />} />
             <Route path="/visualizations" element={<Visualization />} />
             <Route path="/testplots" element={<TestPlot/>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
