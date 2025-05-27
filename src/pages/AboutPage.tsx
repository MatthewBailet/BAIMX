import React from 'react';
import { StickyHeader } from '../App'; // Assuming App.tsx is in the src directory
import { ArrowRight, Award, TrendingUp, Users, BookOpen, BarChart3, Globe, Mail } from 'lucide-react'; // Added icons

const AboutPage: React.FC = () => {
  return (
    <>
      <StickyHeader />
      <div className="bg-white min-h-screen pt-24"> {/* Adjusted padding for sticky header */}

        {/* Hero Section */}
        <section className="bg-slate-800 py-20 md:py-52 border-b border-gray-700 relative overflow-hidden"> {/* Changed bg, added relative & overflow */}
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src="/BGV.m4v" type="video/mp4" /> {/* Use source element for type attribute */}
            Your browser does not support the video tag. {/* Fallback text */}
          </video>
          {/* Gradient Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/60 to-black/90 z-10" />

          {/* Content (ensure this is on top) */}
          <div className="relative z-20 container mx-auto max-w-[77rem] px-4 text-center mt-12">
            <img src="/logoBAIMXFinal.png" alt="BAIMX Logo" className="h-10 md:h-13 w-auto mx-auto mb-2" /> {/* Changed to white logo for dark bg */}
            <h1 className="text-4xl md:text-6xl font-bold text-white max-w-5xl mx-auto mb-6 dm-serif-text-regular leading-tight">
              Navigating the Complexities of Global Decentralized Finance.
            </h1>
            <p className="text-md md:text-lg text-slate-200 max-w-3xl mx-auto font-light">
              We deliver unparalleled insight and clarity in a rapidly evolving financial world. We provide the critical intelligence that empowers leaders and investors to make informed decisions.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-[77rem] py-16 md:py-24 px-4">

          {/* Our Philosophy Section */}
          <section className="mb-20 md:mb-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="pr-0 md:pr-10">
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-6 dm-serif-text-regular">
                  Our Philosophy: Insight, Integrity, Impact.
                </h2>
                <p className="text-slate-700 mb-6 text-lg leading-relaxed ">
                  In an era of information overload, BAIMX stands for rigorous analysis, unwavering journalistic integrity, and impactful reporting. We believe that access to trusted financial intelligence is fundamental to navigating market volatility and identifying opportunity.
                </p>
                <p className="text-slate-700 text-lg leading-relaxed ">
                  Our global team of analysts, journalists, and data scientists is dedicated to uncovering the stories behind the numbers, providing context, and delivering perspectives that matter. We cut through the noise to bring you the essential insights that shape economies and markets.
                </p>
              </div>
              <div className="relative h-80 md:h-96 rounded-md overflow-hidden shadow-lg">
                <img
                  src="/placeholder-newsroom.jpg" // Placeholder: Modern newsroom or data visualization hub
                  alt="BAIMX Editorial Team Environment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </section>

          {/* What We Deliver Section */}
          <section className="mb-20 md:mb-28">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-12 text-center dm-serif-text-regular">
              What We Deliver
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[{
                icon: <BarChart3 size={36} className="text-blue-600 mb-4" />,
                title: "In-Depth Market Analysis",
                description: "Comprehensive research and data-driven analysis across all major asset classes and global markets."
              }, {
                icon: <TrendingUp size={36} className="text-blue-600 mb-4" />,
                title: "Real-Time Intelligence",
                description: "Breaking news, live market updates, and algorithmic insights to keep you ahead of critical developments."
              }, {
                icon: <BookOpen size={36} className="text-blue-600 mb-4" />,
                title: "Exclusive Reporting & Features",
                description: "Investigative journalism, long-form features, and expert commentary on the trends shaping the future of finance."
              }].map((item, index) => (
                <div key={index} className="bg-slate-50 p-8 rounded-md shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {item.icon}
                  <h3 className="text-xl font-semibold text-slate-700 mb-3 ">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed ">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Commitment Section */}
          <section className="mb-20 md:mb-28 bg-slate-800 text-white py-16 md:py-20 rounded-md shadow-xl">
            <div className="max-w-3xl mx-auto text-center px-6">
                <Award size={48} className="text-blue-400 mb-6 mx-auto" />
                <h2 className="text-3xl md:text-4xl font-semibold mb-6 dm-serif-text-regular">Our Commitment to Excellence</h2>
                <p className="text-slate-300 mb-6 text-lg leading-relaxed mina-regular">
                    At BAIMX, our foremost commitment is to our audience. We adhere to the highest standards of journalistic ethics, ensuring accuracy, impartiality, and transparency in all our reporting. Our insights are meticulously researched and independently verified.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mina-regular">
                    We strive to empower our readers with knowledge that is not only timely and relevant but also deeply contextualized, helping them understand the forces that drive global markets and economies.
                </p>
            </div>
          </section>

          {/* Leadership/Our People Section */}
          <section className="mb-20 md:mb-28">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-12 text-center dm-serif-text-regular">
              Editorial & Analytical Leadership
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
                name: "Eleanor Vance",
                title: "Editor-in-Chief",
                bio: "With over two decades in financial journalism, Eleanor directs BAIMX's global editorial strategy, ensuring insightful and impactful coverage.",
                image: "/placeholder-editor-1.jpg" // Placeholder: Professional headshot
              }, {
                name: "Marcus Chen",
                title: "Head of Global Market Analysis",
                bio: "Marcus leads our team of analysts, providing deep dives into market trends, economic indicators, and investment strategies.",
                image: "/placeholder-analyst-1.jpg"
              }, {
                name: "Dr. Sofia Al-Jamil",
                title: "Chief Data Scientist",
                bio: "Sofia spearheads BAIMX's cutting-edge data intelligence, translating complex datasets into actionable insights for our readers.",
                image: "/placeholder-scientist-1.jpg"
              }].map((person, index) => (
                <div key={index} className="bg-white p-6 rounded-md border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-4 border-slate-100 shadow-sm"
                  />
                  <h4 className="text-xl font-semibold text-slate-800 mina-bold">{person.name}</h4>
                  <p className="text-blue-600 text-sm mb-2 mina-regular">{person.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed mina-regular">
                    {person.bio}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Global Presence (Optional Example) */}
          <section className="mb-20 md:mb-28 text-center">
            <Globe size={40} className="text-slate-500 mb-4 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-3 dm-serif-text-regular">
              A Global Perspective
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mina-regular leading-relaxed">
              With correspondents and analysts in key financial centers worldwide, BAIMX provides truly global coverage, offering diverse perspectives on interconnected markets.
            </p>
          </section>

          {/* Call to Action / Engage With Us Section */}
          <section className="text-center py-16 bg-gradient-to-r from-slate-800 to-slate-900 rounded-md shadow-xl">
             <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 dm-serif-text-regular">Stay Informed with BAIMX</h2>
            <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto leading-relaxed mina-regular">
              Subscribe to our newsletters for curated insights, breaking news alerts, and exclusive content delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg mx-auto gap-3 px-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-5 py-3.5 w-full text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-slate-400 text-sm"
              />
              <button className="bg-blue-600 text-white px-8 py-3.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto flex items-center justify-center whitespace-nowrap">
                Subscribe <Mail size={18} className="ml-2" />
              </button>
            </div>
             <p className="text-xs text-slate-400 mt-6 max-w-md mx-auto">
              By subscribing, you agree to our <a href="#" className="underline hover:text-slate-200">Terms of Service</a> and <a href="#" className="underline hover:text-slate-200">Privacy Policy</a>.
            </p>
          </section>

        </div>
      </div>
    </>
  );
};

export default AboutPage; 