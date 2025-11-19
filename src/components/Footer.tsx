import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-footer-background text-white border-t border-border/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Factfullness</h3>
            <p className="text-white/70 text-sm">
              Master essential tech skills through smart, AI-powered micro-courses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-white/70 hover:text-white transition-colors">All Courses</Link></li>
              <li><Link to="/courses" className="text-white/70 hover:text-white transition-colors">Excel</Link></li>
              <li><Link to="/courses" className="text-white/70 hover:text-white transition-colors">Python</Link></li>
              <li><Link to="/courses" className="text-white/70 hover:text-white transition-colors">SQL</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Factfullness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
