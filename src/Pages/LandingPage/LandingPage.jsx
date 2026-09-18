// App.jsx
import React, { useEffect,useState } from 'react';
import { motion, useAnimation ,AnimatePresence} from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const LandingPage = () => {
  return (
    <div className="bg-[#F8F5F0] font-sans antialiased">
      {/* Navbar */}
      <Navbar />
      {/* 1️⃣ HERO SECTION */}

      <HeroSection />
      
      {/* 2️⃣ TRUST & CREDIBILITY STRIP */}
      <TrustStrip />
      
      {/* 3️⃣ PRODUCT DEMO SHOWCASE */}
      <ProductDemo />
      
      {/* 4️⃣ FEATURE GRID */}
      <FeatureGrid />
      
      {/* 5️⃣ HOW IT WORKS */}
      <HowItWorks />
      
      {/* 6️⃣ ANALYTICS PREVIEW */}
      <AnalyticsPreview />
      
      {/* 7️⃣ FINAL CTA */}
      <FinalCTA />
      
      {/* 8️⃣ FOOTER */}
      <Footer />
    </div>
  );
};


// navbar component
// Navbar.jsx


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const naigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB] shadow-sm' 
            : 'bg-[#F8F5F0]'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg"></div>
              <span className="text-xl font-bold text-[#1F2937]">IIP</span>
              <span className="hidden sm:inline-block ml-1 text-xs font-medium px-2 py-1 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full">
                Beta
              </span>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors">
                Product
              </a>
              <a href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors">
                Features
              </a>
              <a href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors flex items-center gap-1">
                Pricing
                <span className="text-xs px-1.5 py-0.5 bg-[#0891B2]/10 text-[#0891B2] rounded-full">-20%</span>
              </a>
              <a href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors">
                Resources
              </a>
              <a href="#" className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors">
                Contact
              </a>
            </div>

            {/* Desktop Right Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
              className="text-sm font-medium text-[#4B5563] hover:text-[#4F46E5] transition-colors px-4 py-2"
              onClick={() => naigate('/login')}
              >
                Sign in
              </button>
              <button className="group bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] text-sm font-medium flex items-center gap-2">
                Start Practicing
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <motion.span 
                animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-[#1F2937] block transition-all"
              ></motion.span>
              <motion.span 
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-6 h-0.5 bg-[#1F2937] block transition-all"
              ></motion.span>
              <motion.span 
                animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-[#1F2937] block transition-all"
              ></motion.span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-white border-t border-[#E5E7EB] shadow-lg overflow-hidden"
            >
              <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors">
                    Product
                  </a>
                  <a href="#" className="text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors">
                    Features
                  </a>
                  <a href="#" className="text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors flex items-center gap-2">
                    Pricing
                    <span className="text-xs px-1.5 py-0.5 bg-[#0891B2]/10 text-[#0891B2] rounded-full">-20%</span>
                  </a>
                  <a href="#" className="text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors">
                    Resources
                  </a>
                  <a href="#" className="text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors">
                    Contact
                  </a>
                  
                  <div className="border-t border-[#E5E7EB] my-2 pt-4">
                    <button className="w-full text-left text-[#4B5563] hover:text-[#4F46E5] py-2 text-sm font-medium transition-colors">
                      Sign in
                    </button>
                    <button className="w-full mt-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-5 py-3 rounded-lg shadow-sm text-sm font-medium">
                      Start Practicing
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};


// ==================== HERO SECTION ====================
const HeroSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Word stagger for headline
  const headline = "Adaptive Interview Intelligence".split(" ");
  const subHeadline = "Built for Placement Success".split(" ");

  return (
    <section className="relative bg-[#F8F5F0] pt-20 pb-32 overflow-hidden">
      {/* Subtle radial gradient top-right */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radial-gradient opacity-30 pointer-events-none" />
      
      {/* Light section divider curve */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
          <path d="M0,50 C300,100 600,0 1440,50 L1440,100 L0,100 Z" fill="#F1ECE6" opacity="0.4" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={staggerChildren}
            className="flex-1 max-w-2xl"
          >
            {/* Main Headline with word stagger */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block text-[#1F2937]">
                {headline.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { duration: 0.4, delay: i * 0.05 } 
                      }
                    }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block text-[#4F46E5] mt-2">
                {subHeadline.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { duration: 0.4, delay: (headline.length + i) * 0.05 } 
                      }
                    }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subtext */}
            <motion.p 
              variants={fadeUp}
              className="text-[#6B7280] text-lg md:text-xl mt-6 leading-relaxed max-w-lg"
            >
              A next-generation interview simulation platform that analyzes performance, 
              detects skill gaps, and prepares students for real-world hiring.
            </motion.p>

            {/* CTA Section */}
            <motion.div 
              variants={fadeUp}
              className="flex flex-wrap gap-4 mt-8"
            >
              <button className="group bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-8 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] font-medium">
                Start Practicing
              </button>
              
              <button className="group bg-white text-[#4F46E5] border border-[#4F46E5] px-8 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] font-medium flex items-center gap-2">
                View Demo
                <motion.span 
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                >
                  →
                </motion.span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Product Mock Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1 relative"
          >
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl p-6 max-w-lg mx-auto"
            >
              {/* Mini Dashboard Mock */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#0891B2]"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="text-xs font-medium text-[#4F46E5]">Live Session</div>
                </div>

                {/* Radar Chart Mini */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Grid lines */}
                      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
                      <polygon points="50,25 70,40 70,60 50,75 30,60 30,40" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
                      {/* Data area */}
                      <motion.polygon 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        points="50,20 75,35 70,65 50,80 30,70 35,30" 
                        fill="#4F46E5" 
                        fillOpacity="0.2"
                        stroke="#4F46E5" 
                        strokeWidth="1.5"
                      />
                      {/* Data points */}
                      <circle cx="50" cy="20" r="2" fill="#4F46E5"/>
                      <circle cx="75" cy="35" r="2" fill="#0891B2"/>
                      <circle cx="70" cy="65" r="2" fill="#0891B2"/>
                      <circle cx="50" cy="80" r="2" fill="#4F46E5"/>
                      <circle cx="30" cy="70" r="2" fill="#0891B2"/>
                      <circle cx="35" cy="30" r="2" fill="#4F46E5"/>
                    </svg>
                  </div>
                </div>

                {/* Readiness Score Ring */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 0.78 }}
                          transition={{ duration: 1, delay: 0.8 }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1F2937]">78%</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Readiness Score</p>
                      <p className="text-sm font-semibold text-[#1F2937]">+12% this week</p>
                    </div>
                  </div>
                  
                  {/* Mini Stat Card */}
                  <div className="bg-[#F1ECE6] rounded-lg p-2 px-3">
                    <p className="text-xs text-[#6B7280]">Questions</p>
                    <p className="text-sm font-bold text-[#1F2937]">24/30</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== TRUST & CREDIBILITY STRIP ====================
const TrustStrip = () => {
  return (
    <div className="bg-white border-y border-[#E5E7EB] py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <p className="text-[#4B5563] text-sm md:text-base font-medium">
            Designed for Universities • Placement Cells • Career Mentorship Programs
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#4F46E5]/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
              </div>
              <span className="text-xs text-[#6B7280]">IITs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#0891B2]/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#0891B2]"></div>
              </div>
              <span className="text-xs text-[#6B7280]">NITs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>
              </div>
              <span className="text-xs text-[#6B7280]">IIMs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PRODUCT DEMO SHOWCASE ====================
const ProductDemo = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="bg-[#F1ECE6] py-24">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
            How It Feels to Practice
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
          }}
          className="relative group cursor-pointer"
        >
          {/* Dashboard Mock */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
            <div className="p-6 bg-gradient-to-r from-[#4F46E5]/5 to-[#7C3AED]/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-10 bg-[#F1ECE6] rounded-lg flex items-center px-4">
                  <div className="w-3 h-3 rounded-full bg-[#4F46E5] mr-2"></div>
                  <span className="text-sm text-[#6B7280]">Product Management Interview</span>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-[#4F46E5]/10 rounded-full text-xs font-medium text-[#4F46E5]">Live Scoring</div>
                  <div className="px-3 py-1 bg-[#0891B2]/10 rounded-full text-xs font-medium text-[#0891B2]">Adaptive</div>
                  <div className="px-3 py-1 bg-[#16A34A]/10 rounded-full text-xs font-medium text-[#16A34A]">Performance</div>
                </div>
              </div>

              {/* Dashboard Content Mock */}
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
                    <div className="w-full h-16 bg-[#F1ECE6] rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-[#E5E7EB] rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Gradient fade overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F1ECE6] to-transparent pointer-events-none"></div>
        </motion.div>

        {/* Animated UI tags */}
        <motion.div 
          initial="hidden"
          animate={controls}
          variants={staggerChildren}
          className="flex justify-center gap-4 mt-8"
        >
          {['Live Scoring', 'Adaptive Questions', 'Performance Tracking'].map((tag, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="px-4 py-2 bg-white rounded-full border border-[#E5E7EB] shadow-sm text-sm font-medium text-[#4B5563]"
            >
              {tag}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FEATURE GRID ====================
const FeatureGrid = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const features = [
    {
      icon: "📄",
      title: "Resume Intelligence",
      description: "Extracts skills and generates role-specific interview questions.",
      tag: "Smart Question Engine",
      tagColor: "bg-[#4F46E5]/10 text-[#4F46E5]"
    },
    {
      icon: "🌳",
      title: "Adaptive Follow-Ups",
      description: "Dynamically adjusts questions based on your responses.",
      tag: "Context Aware",
      tagColor: "bg-[#0891B2]/10 text-[#0891B2]"
    },
    {
      icon: "📊",
      title: "Skill Radar Analytics",
      description: "Visual breakdown of communication, clarity, and technical depth.",
      tag: "Visual Performance Mapping",
      tagColor: "bg-[#4F46E5]/10 text-[#4F46E5]"
    },
    {
      icon: "🔄",
      title: "Placement Readiness Score",
      description: "Quantifies your preparation level and improvement trend.",
      tag: "Growth Tracking",
      tagColor: "bg-[#16A34A]/10 text-[#16A34A]"
    }
  ];

  return (
    <section className="bg-[#F8F5F0] py-24">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
            Intelligence That Adapts to You
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Every feature is designed to simulate real interview pressure and provide actionable feedback
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate={controls}
          variants={staggerChildren}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.4, delay: index * 0.1 } 
                }
              }}
              className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#4F46E5]/30 p-8"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">{feature.title}</h3>
              <p className="text-[#6B7280] mb-4">{feature.description}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${feature.tagColor}`}>
                {feature.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS ====================
const HowItWorks = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const steps = [
    {
      number: "01",
      icon: "📤",
      title: "Upload Resume",
      description: "Share your resume and target role. Our AI analyzes your experience and skill gaps."
    },
    {
      number: "02",
      icon: "🎙️",
      title: "Simulate Interview",
      description: "Practice with adaptive questions that mirror real interview difficulty and style."
    },
    {
      number: "03",
      icon: "📈",
      title: "Analyze & Improve",
      description: "Get detailed feedback on answers, confidence, and areas needing improvement."
    }
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
            From Resume to Ready in 3 Steps
          </h2>
          <p className="text-[#6B7280] text-lg">
            No fluff. Just focused preparation that works.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-center items-start gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.4, delay: index * 0.15 } 
                }
              }}
              className="flex-1 text-center relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#4F46E5]/20 to-[#7C3AED]/20"></div>
              )}
              
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-xl mb-6">
                {step.number}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">{step.title}</h3>
              <p className="text-[#6B7280]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== ANALYTICS PREVIEW ====================
const AnalyticsPreview = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="bg-[#F1ECE6] py-24">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
            Performance Intelligence at a Glance
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Stop guessing. See exactly where you stand and what to improve.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
          }}
          className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl p-8 max-w-5xl mx-auto"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {/* Radar Chart */}
            <div className="col-span-1">
              <h4 className="text-sm font-semibold text-[#1F2937] mb-4">Skill Breakdown</h4>
              <div className="relative w-full aspect-square">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#E5E7EB" strokeWidth="0.8"/>
                  <polygon points="50,25 70,40 70,60 50,75 30,60 30,40" fill="none" stroke="#E5E7EB" strokeWidth="0.8"/>
                  <motion.polygon 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    points="50,20 80,35 75,70 50,85 25,65 30,25" 
                    fill="#4F46E5" 
                    fillOpacity="0.15"
                    stroke="#4F46E5" 
                    strokeWidth="1.5"
                  />
                  <text x="30" y="15" fontSize="6" fill="#4B5563">Technical</text>
                  <text x="75" y="25" fontSize="6" fill="#4B5563">Communication</text>
                  <text x="75" y="75" fontSize="6" fill="#4B5563">Problem</text>
                  <text x="30" y="90" fontSize="6" fill="#4B5563">Culture</text>
                  <text x="5" y="40" fontSize="6" fill="#4B5563">Leadership</text>
                  <text x="5" y="65" fontSize="6" fill="#4B5563">Strategy</text>
                </svg>
              </div>
            </div>

            {/* Score Cards */}
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F8F5F0] rounded-lg p-4">
                  <p className="text-xs text-[#6B7280]">Overall Score</p>
                  <p className="text-2xl font-bold text-[#1F2937]">78<span className="text-sm font-normal text-[#6B7280]">/100</span></p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-[#16A34A]">↑ +12%</span>
                    <span className="text-xs text-[#6B7280]">vs last month</span>
                  </div>
                </div>
                <div className="bg-[#F8F5F0] rounded-lg p-4">
                  <p className="text-xs text-[#6B7280]">Placement Readiness</p>
                  <p className="text-2xl font-bold text-[#1F2937]">High</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-[#0891B2]">Top 15%</span>
                  </div>
                </div>
              </div>

              {/* Line Graph Mock */}
              <div className="bg-[#F8F5F0] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-[#1F2937]">Performance Trend</p>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                      <span className="text-[#6B7280]">You</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#E5E7EB]"></span>
                      <span className="text-[#6B7280]">Average</span>
                    </span>
                  </div>
                </div>
                <div className="h-20 flex items-end gap-2">
                  {[35, 45, 55, 65, 70, 78, 82].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: value }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                        className="w-full bg-[#4F46E5] rounded-t-sm"
                        style={{ height: `${value * 0.5}px` }}
                      ></motion.div>
                      <div className="w-full h-1 bg-[#E5E7EB] rounded-t-sm"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Heatmap Mock */}
              <div className="mt-6">
                <p className="text-sm font-medium text-[#1F2937] mb-2">Skill Heatmap</p>
                <div className="grid grid-cols-6 gap-1">
                  {['Algorithms', 'Behavioral', 'Product Sense', 'Leadership', 'Negotiation'].map((skill, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-2 rounded-full mb-1 ${
                        i < 2 ? 'bg-[#4F46E5]' : i < 4 ? 'bg-[#0891B2]' : 'bg-[#16A34A]'
                      }`} style={{ width: `${[90, 70, 85, 60, 95, 40][i]}%` }}></div>
                      <span className="text-[10px] text-[#6B7280]">{skill.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FINAL CTA ====================
const FinalCTA = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="relative bg-gradient-to-br from-[#4F46E5]/10 via-[#7C3AED]/10 to-[#0891B2]/10 py-24 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            Start Preparing Smarter.
          </h2>
          <p className="text-xl text-[#4B5563] mb-8">
            Built for serious candidates. Trusted by top placement cells.
          </p>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-[#4F46E5] border border-[#4F46E5] px-10 py-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-lg"
          >
            Get Started Free
          </motion.button>
          <p className="text-sm text-[#6B7280] mt-6">
            No credit card required • 7 days free • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FOOTER ====================
const Footer = () => {
  return (
    <footer className="bg-[#F1ECE6] py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg"></div>
              <span className="text-xl font-bold text-[#1F2937]">IIP</span>
            </div>
            <p className="text-[#6B7280] text-sm max-w-xs">
              Interview Intelligence Platform helps students and professionals ace their interviews with AI-powered practice and analytics.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-[#1F2937] mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Demo', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-[#1F2937] mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              {['Resume Analysis', 'Mock Interviews', 'Skill Tracking', 'Placement Readiness'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-[#1F2937] mb-4 uppercase tracking-wider">About</h4>
            <ul className="space-y-2">
              {['Company', 'Careers', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#E5E7EB]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#6B7280]">
              © 2026 Interview Intelligence Platform. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5]">Privacy</a>
              <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5]">Terms</a>
              <a href="#" className="text-sm text-[#6B7280] hover:text-[#4F46E5]">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;