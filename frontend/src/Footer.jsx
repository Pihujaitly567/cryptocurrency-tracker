import React from 'react';
import { Github, Code, Globe, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-gradient text-white py-12 mt-auto border-t border-slate-800/50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">

          {/* Personal Branding */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-lg shadow-blue-500/20">
              <img
                src="/logo.jpg"
                alt="CripTik Logo"
                className="w-full h-full object-cover scale-[1.4]"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CripTik
              </h3>
              <p className="text-gray-400 font-medium mt-2">Designed & Built by <span className="text-white">Pihu Jaitly</span></p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Pihujaitly567"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-[#24292e] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                <Github size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300">GitHub</span>
            </a>

            <a
              href="https://leetcode.com/pihujaitly2024"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-[#FFA116] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                <Code size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300">LeetCode</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="mt-4 text-sm text-gray-600">
            <p>© {currentYear} Pihu Jaitly. All rights reserved.</p>
            <p className="text-xs mt-1 opacity-70">Powered by CoinGecko API</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;