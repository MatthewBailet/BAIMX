import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom'; // Added useParams
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, Filter, CheckCheck, ChevronLeft, TrendingUp, TrendingDown, Lock as LockIcon, X as XIcon, MonitorSmartphone,
  Facebook, // Added Facebook icon
  Twitter,  // Added Twitter icon (X)
  Linkedin, // Added LinkedIn icon
  Mail,     // Added Mail icon
  Link2 as LinkIcon, // Added Link icon (renamed to avoid conflict with react-router-dom Link)
} from 'lucide-react';
import { createPortal } from 'react-dom';

// Assuming TickerBar and StickyHeader are exported from App.tsx or a components file
// If they are not, they would need to be extracted and imported from their new location.
// For now, let's assume they might be part of a shared components directory or directly from App.tsx if exported.
// This is a placeholder and might need adjustment based on actual project structure.
// import { TickerBar, StickyHeader } from '../App'; // Or '../components/TickerBar', '../components/StickyHeader'

// --- Replicated TickerBar (assuming it's not directly exportable or for simplicity here) ---
// This is a simplified version. In a real app, this would be a shared component.
const TickerBar: React.FC = () => {
  // Placeholder for TickerBar logic and UI
  // In a real scenario, you'd import this or ensure App.tsx exports it.
  // For this example, we'll keep it minimal.
  const [tickerData, setTickerData] = useState<any[]>([]); // Simplified data state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching ticker data
    const fetchMockData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickerData([
        { id: 'BTC', symbol: 'BTC', current_price: 70000, price_change_percentage_24h: 2.5 },
        { id: 'ETH', symbol: 'ETH', current_price: 3500, price_change_percentage_24h: -1.2 },
        { id: 'SOL', symbol: 'SOL', current_price: 150, price_change_percentage_24h: 5.0 },
        // Add more mock data as needed
      ]);
      setIsLoading(false);
    };
    fetchMockData();
  }, []);

  const formatPriceTicker = (value: number): string => {
    if (value >= 1) {
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return value.toPrecision(3);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900 text-white py-2 overflow-hidden whitespace-nowrap text-xs border-b border-neutral-700 h-10 flex items-center justify-center">
        Loading Ticker...
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 text-white py-2 overflow-hidden whitespace-nowrap text-xs border-b border-neutral-700">
      <motion.div
        className="flex"
        animate={{ x: ['0%', '-100%'] }}
        transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
      >
        {[...tickerData, ...tickerData].map((coin, index) => ( // Duplicate for seamless loop
          <div key={index} className="inline-block mx-4">
            <span className="font-bold">{coin.symbol}:</span> ${formatPriceTicker(coin.current_price)}
            <span className={`ml-2 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="inline-block h-3 w-3" /> : <TrendingDown className="inline-block h-3 w-3" />}
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
// --- END Replicated TickerBar ---

// --- NEW: BAIMX Pro AdBox Component ---
const BaimxProAdBox: React.FC = () => {
  // Using MonitorSmartphone as a placeholder for the dual monitor icon
  const IconComponent = MonitorSmartphone; // Or another icon like Laptop2

  return (
    <div className="bg-black text-white p-4 mb-6 cursor-default">
      <h3 className="text-md font-semibold mb-2 leading-tight cursor-default">
        Before it's here, <br />it's on <span className="text-blue-400">BAIMX Pro</span>.
      </h3>
      <a 
        href="#" // Placeholder link for BAIMX Pro page
        className="flex items-center text-sm cursor-default font-semibold hover:text-gray-300 transition-colors duration-150 mt-3"
      >
        <IconComponent size={20} className="mr-2 cursor-default" />
        LEARN MORE
      </a>
    </div>
  );
};
// --- END NEW: BAIMX Pro AdBox Component ---

// --- END Replicated StickyHeader ---

const ArticleContextContent: React.FC = () => {
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const initialContextHeight = "4rem"; // Approx 3-4 lines

  return (
    <div className='relative w-full border border-gray-400 mt-0.5 px-3 py-4 rounded-md mt-[204px] md:mt-[0px]'>
      <h2 className="text-xs text-gray-900 font-sans font-semibold pb-2 border-b border-gray-200">Article Context</h2>
      <div className="md:hidden relative"> {/* Mobile: Framer Motion */}
        <AnimatePresence initial={false}>
          <motion.div
            key="contextTextMobile"
            initial={{ height: initialContextHeight }}
            animate={{ height: isContextExpanded ? 'auto' : initialContextHeight }}
            exit={{ height: initialContextHeight }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className='text-sm text-gray-900 pt-2 font-sans'>
              Sam Bankman-Fried's FTX is a fraud and a ponzi scheme. FTT is a scam and a ponzi scheme due to the fact that it is not backed by any assets and is not a stable coin. FTX is a ponzi scheme due to the fact that it is not backed by any assets and is not a stable coin.
            </p>
          </motion.div>
        </AnimatePresence>
        {!isContextExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        )}
      </div>
      <div className="hidden md:block"> {/* Desktop: Always show full text */}
        <p className='text-sm md:text-md text-gray-900 pt-2 font-sans'>
          Sam Bankman-Fried's FTX is a fraud and a ponzi scheme. FTT is a scam and a ponzi scheme due to the fact that it is not backed by any assets and is not a stable coin. FTX is a ponzi scheme due to the fact that it is not backed by any assets and is not a stable coin.
        </p>
      </div>
      <div className="md:hidden flex justify-center mt-2"> {/* Expand/Collapse Button for Mobile */}
        <button
          onClick={() => setIsContextExpanded(!isContextExpanded)}
          className="flex items-center text-sm text-black hover:text-gray-500"
        >
          {isContextExpanded ? 'Show Less' : 'Show More'}
          {isContextExpanded ? <ChevronUp size={20} className="ml-1" /> : <ChevronDown size={20} className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

const ReferencedSectionContent: React.FC = () => (
  <div className='w-full mt-0 md:mt-8'>
    <h2 className="text-lg md:text-md text-gray-900 font-sans font-semibold pb-2">Referenced</h2>
    <div className='px-4'>
      <ul className='list-disc list-inside underline font-medium'>
        <li><a href="#">FTX</a></li>
        <li><a href="#">Sam Bankman-Fried</a></li>
        <li><a href="#">FTT</a></li>
        <li><a href="#">Bitcoin</a></li>
        <li><a href="#">Scams</a></li>
      </ul>
    </div>
  </div>
);

interface MainArticleContentProps {
  slug: string | undefined;
}

const MainArticleContent: React.FC<MainArticleContentProps> = ({ slug }) => (
  <>
    <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-neutral-800 px-4 pb-4 md:pb-6 mx-4 sm:mx-8 md:mx-16 mt-4 md:mt-0 leading-[1] md:leading-[.9] max-w-2xl mx-auto">
      Article: {slug} Sam Bankman-Fried's FTX is a fraud and a ponzi scheme
    </h1>
    <div className="max-w-2xl mx-auto px-4 mb-0 mx-4 sm:mx-8 md:mx-16 text-sm sm:text-base md:text-md">
      <p className="text-black flex items-center">
        <CheckCheck size={20} className="mr-1 text-black" />
        Confirmed by&nbsp;
        <a href="#" className="underline hover:text-neutral-700">Matthew Bailet</a>
      </p>
    </div>
    <div className="max-w-2xl mx-auto px-4 mb-4 md:mb-6 mx-4 sm:mx-8 md:mx-16 text-xs sm:text-sm md:text-md">
      <p className="text-gray-500">
        May 25, 2025 at 12:01 PM EDT | 10 mins ago
      </p>
    </div>
    <p className="text-gray-500 px-4 text-sm sm:text-md md:text-md leading-normal md:leading-5 text-justify pb-4 md:pb-8 max-w-2xl mx-4 sm:mx-8 md:mx-16 mx-auto font-sans font-normal">
      Will FTX be the next bitcoin? probably not and heres what we know about it and what you need to know about it
    </p>
    {/* --- ShareBar --- */}
    <div className="max-w-2xl px-4 md:px-8 md:mx-12 mb-6 md:mb-8">
      <ShareBar articleUrl={window.location.href} articleTitle={`Article: ${slug} Sam Bankman-Fried's FTX is a fraud and a ponzi scheme`} />
    </div>
    {/* --- END: ShareBar --- */}
    {/* Image Container - Reverted to original structure, Media tag below */}
    <div className="max-w-2xl  mb-2 md:mb-3"> {/* Reduced bottom margin to accommodate caption */}
      <img
        src="/Oil.png"
        alt={`Image for article: ${slug}`}
        className="max-w-2xl px-4 md:px-8 md:mx-12 mb-0 block w-full object-cover h-56 sm:h-72 md:h-96" // Reverted image classes, removed direct mb
      />
       <p className="text-[13px] m w-full mt-1 md:ml-4 pr-4 md:pr-0  text-gray-500 mt-0 mb-8 md:mb-16 text-right  max-w-2xl ">BAIMX Media</p> {/* BAIMX Media tag styled like App.tsx, below image and aligned right */}
   
    </div>
    
    <div className="text-neutral-800 px-8 md:px-4  text-lg md:text-lg leading-relaxed md:leading-9 text-justify pb-8 md:pb-12 md:max-w-lg mx-8  md:mx-16 mx-auto font-merriweather merriweather-regular">
      <p className="first-letter:text-7xl first-letter:font-bold first-letter:text-neutral-900 \
                    first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8em] first-letter:mt-1">
        As the crypto markets shake off the volatility of previous cycles, many analysts are betting on a bullish 2025 for Bitcoin — with some projecting a minimum upside of 25% from current levels. This optimism is rooted in a convergence of macroeconomic, technological, and supply-driven catalysts.
      </p>
      <p>
        First and foremost, the <strong>Bitcoin halving</strong> that occurred in April 2024 has started to work its historical magic. Every previous halving cycle has led to a significant rally within 12 to 18 months, as the supply of new BTC entering the market is cut in half. With demand projected to remain steady or rise, basic economics points toward upward price pressure.
      </p>
      <p>
        Second, <strong>institutional adoption continues to gain momentum</strong>. The approval and inflow into Bitcoin spot ETFs in major financial markets has brought new legitimacy and accessibility to BTC, attracting conservative capital that previously sat on the sidelines. As Bitcoin becomes increasingly integrated into diversified portfolios, baseline demand strengthens.
      </p>
      <p>
        Additionally, <strong>geopolitical and monetary instability</strong> may push more capital into "digital gold" as a hedge against fiat currency devaluation. With inflation still a global concern and central banks hesitant to tighten aggressively, Bitcoin's fixed supply narrative becomes more compelling to investors seeking long-term preservation of value.
      </p>
      <p>
        Finally, <strong>technological improvements to the Bitcoin ecosystem</strong> — including Layer 2 solutions like the Lightning Network and growing activity in Ordinals and tokenization — are expanding use cases and enhancing network value.
      </p>
      <p>
        While no forecast is guaranteed, the structural foundations supporting a Bitcoin rally in 2025 are increasingly difficult to ignore. A 25% gain would be conservative compared to previous post-halving cycles — making it a realistic target in a year that could reignite crypto enthusiasm at scale.
      </p>
    </div>
  </>
);

// --- NEW: ShareBar Component ---
interface ShareBarProps {
  articleUrl: string;
  articleTitle: string;
}

const ShareBar: React.FC<ShareBarProps> = ({ articleUrl, articleTitle }) => {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleTitle);

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20article:%20${encodedUrl}`,
    },
    {
      name: 'Copy Link',
      icon: LinkIcon,
      action: () => navigator.clipboard.writeText(articleUrl).then(() => alert('Link copied to clipboard!')),
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      {socialLinks.map((item) => (
        <a
          key={item.name}
          href={item.url || '#'}
          onClick={item.action ? (e) => { e.preventDefault(); item.action && item.action(); } : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${item.name}`}
          className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-150 cursor-pointer"
        >
          <item.icon size={20} />
        </a>
      ))}
    </div>
  );
};
// --- END: ShareBar Component ---

interface RelatedArticle {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  readTime: string;
  slug: string;
}

const mockRelatedArticles: RelatedArticle[] = [
  {
    id: 'related-1',
    title: 'Understanding the FTX Collapse: A Deep Dive',
    imageUrl: '/Oil2.png', // Changed to /Oil2.png
    date: 'May 20, 2025',
    readTime: '7 min read',
    slug: 'understanding-ftx-collapse'
  },
  {
    id: 'related-2',
    title: 'SBF\'s Trial: Key Testimonies and Outcomes',
    imageUrl: '/channel.png', // Changed to /HongKong.png
    date: 'May 15, 2025',
    readTime: '10 min read',
    slug: 'sbf-trial-outcomes'
  },
  {
    id: 'related-3',
    title: 'The Future of Crypto Regulation Post-FTX',
    imageUrl: '/Sam.png', // Changed to /Solana.png
    date: 'May 10, 2025',
    readTime: '6 min read',
    slug: 'crypto-regulation-future'
  }
];

const RelatedArticleItem: React.FC<{ article: RelatedArticle }> = ({ article }) => (
  <Link to={`/article/${article.slug}`} className="block group mb-2 last:mb-0">
    <div className="flex items-start space-x-3">
      <img 
        src={article.imageUrl} 
        alt={article.title} 
        className="w-24 h-18 object-cover  flex-shrink-0 mt-1" // Adjusted size and added mt-1 for alignment
      />
      <div className="flex-grow">
        <h4 className="text-sm font-semibold text-neutral-800 group-hover:gray-100 transition-colors duration-150 leading-[1.1] line-clamp-3">
          {article.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {article.date} • {article.readTime}
        </p>
      </div>
    </div>
  </Link>
);

const RelatedArticlesSectionContent: React.FC = () => (
  <div className='w-full mt-8'>
    <h2 className="text-lg text-gray-900 font-sans font-semibold pb-2 mb-3 border-b border-gray-300">
      Related Articles
    </h2>
    <div>
      {mockRelatedArticles.map(article => (
        <RelatedArticleItem key={article.id} article={article} />
      ))}
    </div>
  </div>
);

// --- NEW: NewslettersSectionContent Component ---
type NewsletterFrequency = 'Hourly' | 'Daily' | 'Weekly';

interface NewsletterItemData {
  id: string;
  title: string;
  description: string;
  imageSrc?: string; // Optional
  frequency: NewsletterFrequency;
  previewLink: string;
}

const newslettersData: NewsletterItemData[] = [
  {
    id: 'nl1',
    title: 'BAIMX Daily Brief',
    description: 'Your essential morning update on market-moving news.',
    imageSrc: '/Newsletter1.png',
    frequency: 'Daily',
    previewLink: '#',
  },
  {
    id: 'nl2',
    title: 'BAIMX Weekly Digest',
    description: 'In-depth analysis and trends from the past week.',
    imageSrc: '/newsletter-weekly.png',
    frequency: 'Weekly',
    previewLink: '#',
  },
  {
    id: 'nl3',
    title: 'Hourly Algo Signals',
    description: 'Real-time insights powered by BAIMX algorithms.',
    imageSrc: '/Newsletter2.png',
    frequency: 'Hourly',
    previewLink: '#',
  },
  {
    id: 'nl4',
    title: 'Markets Today',
    description: 'Key movements and analysis in Canadian finance.',
    imageSrc: '/Newsletter3.png',
    frequency: 'Daily',
    previewLink: '#',
  },
   {
    id: 'nl5',
    title: 'Tech Pulse Weekly',
    description: 'The latest in tech, AI, and innovation, weekly.',
    // imageSrc: null, // Will use placeholder
    frequency: 'Weekly',
    previewLink: '#',
  },
];

const NewslettersSectionContent: React.FC = () => {
  const [activeNewsletterFrequency, setActiveNewsletterFrequency] = useState<NewsletterFrequency>('Daily');

  const filteredNewsletters = newslettersData.filter(nl => nl.frequency === activeNewsletterFrequency).slice(0, 3);

  return (
    <div className='w-full mt-8'>
      <h2 className="text-lg text-gray-900 font-sans font-semibold pb-2 mb-3 border-b border-gray-300">
        Newsletters
      </h2>
      {/* Frequency Selectors */}
      <div className="flex space-x-3 mb-4">
        {(['Hourly', 'Daily', 'Weekly'] as NewsletterFrequency[]).map(freq => (
          <button
            key={freq}
            onClick={() => setActiveNewsletterFrequency(freq)}
            className={`text-xs font-medium pb-1 transition-colors duration-150 
                        ${activeNewsletterFrequency === freq
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-800'}`}
          >
            {freq}
          </button>
        ))}
      </div>

      {/* Newsletter Items with Animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeNewsletterFrequency}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{
            type: "spring",
            duration: 0.4,
            bounce: 0.1,
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 }
          }}
          className="space-y-3" // Reduced space-y from 4 to 3 for tighter fit in sidebar
        >
          {filteredNewsletters.length > 0 ? filteredNewsletters.map(nl => (
            <div key={nl.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border border-gray-200 overflow-hidden"> {/* Adjusted image size for sidebar */}
                {nl.imageSrc ? (
                  <img src={nl.imageSrc} alt={nl.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-[10px] p-1 text-center">No Image</div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-gray-900 mb-0.5 leading-tight line-clamp-2">{nl.title}</h4> {/* Added line-clamp-2 for title */}
                <p className="text-xs text-gray-600 mb-1 leading-snug line-clamp-2">{nl.description}</p>
                <a
                  href={nl.previewLink}
                  className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Preview
                </a>
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-500">No newsletters for this frequency.</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Subscribe Section - Simplified for sidebar */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <button className="w-full flex items-center justify-center bg-black hover:bg-slate-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-150 mb-2">
          <LockIcon size={14} className="mr-2" />
          Subscribe
        </button>
        <p className="text-[10px] text-gray-500 leading-relaxed text-center"> {/* Centered and smaller text */}
          Get the latest insights from BAIMX.
        </p>
      </div>
    </div>
  );
};
// --- END NEW: NewslettersSectionContent Component ---

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen bg-white text-black ">
      {/* StickyHeader and TickerBar are assumed to be part of the page structure from App.tsx or globally */}
      {/* Main content container with overall max-width and centering */}
      <div className="mx-auto max-w-[77rem] px-4 sm:px-6 lg:px-8 pb-12 ">
        {/* CONTAINER for content below header, with side borders on desktop & top padding for header */}
        {/* Kept pt-[244px] constant, assuming header height is not yet responsive */}
        <div className="md:border-l md:border-r border-gray-400 min-h-screen border-b border-gray-400 ">
          {/* Removed empty div that was here */}
         
          {/* --- Mobile First: Context --- */}
          <div className="md:hidden w-full px-4 pt-6 pb-2"> {/* Reduced pb for mobile context */}
            <ArticleContextContent />
          </div>

          {/* --- Main Content Layout (Desktop Two-Column, Mobile Stacked Article Body then Sidebar Items) --- */}
          <div className="flex flex-col md:flex-row">
            {/* Desktop: Left Column */}
            <div className="hidden md:block w-full md:w-2/9 md:border-r border-b md:border-b-0 border-gray-400 px-4 pt-6 pb-6 md:pt-12 md:pb-12">
              <div className="md:mt-[204px]">
                 <BaimxProAdBox />
              </div>
              <ArticleContextContent />
              <ReferencedSectionContent />
              <RelatedArticlesSectionContent /> {/* Added Related Articles for Desktop */}
              <NewslettersSectionContent /> {/* ADDED NEWSLETTERS FOR DESKTOP */}
            </div>

            {/* Right Column / Main Article Content (for desktop and mobile) */}
            <div className="w-full md:w-7/9 pt-2 md:pt-12 md:mt-[204px] mt-[20]"> {/* Reduced mobile pt for article content */}
              <MainArticleContent slug={slug} />
            </div>
          </div>

          {/* --- Mobile Only: Referenced and Related Articles at the bottom --- */}
          <div className="md:hidden w-full px-4 pt-6 pb-6">
            <BaimxProAdBox /> {/* MOVED BAIMX PRO AD BOX FOR MOBILE */}
            <ReferencedSectionContent />
            <RelatedArticlesSectionContent /> {/* Added Related Articles for Mobile Bottom */}
            <NewslettersSectionContent /> {/* ADDED NEWSLETTERS FOR MOBILE BOTTOM */}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArticlePage; 