import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Linkedin, Github, Mail } from 'lucide-react';

const scroll = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Carbon<span className="text-emerald-500">Twin</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Turning invisible digital carbon emissions into visible financial losses. Built for
              modern, eco-conscious teams.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/adityapandey2607/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-emerald-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/AdityaPandey03/carbontwin"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-emerald-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:pandey.aditya4272@gmail.com"
                className="text-muted-foreground hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  onClick={scroll('features')}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={scroll('how-it-works')}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  How it Works
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  AI Coach
                </Link>
              </li>
              <li>
                <a
                  href="#enterprise"
                  onClick={scroll('enterprise')}
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/AdityaPandey03/carbontwin#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AdityaPandey03/carbontwin#-api-reference"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AdityaPandey03/carbontwin"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://carbontwin.onrender.com/health"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  API Status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <a
                  href="mailto:pandey.aditya4272@gmail.com?subject=CarbonTwin%20—%20Schedule%20a%20Demo"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
                >
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CarbonTwin · MIT licensed · Open-source
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <a
              href="https://carbontwin.onrender.com/health"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              All systems operational
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
