import { ArticleItem } from './SectionBase';

export const mockArticles: Record<string, ArticleItem[]> = {
  btc: [
    {
      id: 'btc1',
      title: 'Bitcoin Surpasses $80,000 Mark Amid Growing Institutional Interest',
      image: '/images/articles/bitcoin-price.jpg',
      tags: ['Speculative', 'Regulation', 'BTC'],
      timeAgo: '3m ago',
      readTime: '6 min read',
      url: '/news/btc-ath'
    },
    {
      id: 'btc2',
      title: 'BlackRock Bitcoin ETF Trading Volume Hits Record High',
      image: '/images/articles/blackrock-btc.jpg',
      tags: ['Institutional', 'ETF', 'Trading'],
      timeAgo: '18m ago',
      readTime: '4 min read',
      url: '/news/blackrock-volume'
    },
    {
      id: 'btc3',
      title: 'Lightning Network Adoption Soars Among Merchants',
      image: '/images/articles/lightning-network.jpg',
      tags: ['Technology', 'Adoption', 'Layer2'],
      timeAgo: '42m ago',
      readTime: '5 min read',
      url: '/news/lightning-adoption'
    },
    {
      id: 'btc4',
      title: 'Bitcoin Mining Difficulty Reaches All-Time High',
      image: '/images/articles/btc-mining.jpg',
      tags: ['Mining', 'Network', 'Security'],
      timeAgo: '1h ago',
      readTime: '3 min read',
      url: '/news/mining-difficulty'
    }
  ],
  eth: [
    {
      id: 'eth1',
      title: 'Ethereum Staking Yields Dip Slightly After Dencun',
      image: '/images/articles/eth-staking.jpg',
      tags: ['ETH', 'Staking', 'Yield'],
      timeAgo: '35m ago',
      readTime: '4 min read',
      url: '/news/eth-staking-yield'
    },
    {
      id: 'eth2',
      title: 'Layer 2 Ecosystem Sees Surge in Active Users',
      image: '/images/articles/layer2.jpg',
      tags: ['L2', 'Scaling', 'Growth'],
      timeAgo: '27m ago',
      readTime: '5 min read',
      url: '/news/l2-growth'
    },
    {
      id: 'eth3',
      title: 'EIP-4844 Implementation Shows Promising Results',
      image: '/images/articles/eip-4844.jpg',
      tags: ['Technology', 'Protocol', 'Update'],
      timeAgo: '53m ago',
      readTime: '7 min read',
      url: '/news/eip-4844-results'
    },
    {
      id: 'eth4',
      title: 'Ethereum Gas Fees Drop to 6-Month Low',
      image: '/images/articles/eth-gas.jpg',
      tags: ['Gas', 'Network', 'Fees'],
      timeAgo: '1h ago',
      readTime: '3 min read',
      url: '/news/eth-gas-fees'
    }
  ],
  xrp: [
    {
      id: 'xrp1',
      title: 'Ripple Expands Cross-Border Payment Network in Asia',
      image: '/images/articles/ripple-asia.jpg',
      tags: ['Expansion', 'Payments', 'ODL'],
      timeAgo: '12m ago',
      readTime: '4 min read',
      url: '/news/ripple-asia'
    },
    {
      id: 'xrp2',
      title: 'XRP Ledger Introduces New Smart Contract Features',
      image: '/images/articles/xrpl-update.jpg',
      tags: ['Technology', 'Development', 'Smart Contracts'],
      timeAgo: '46m ago',
      readTime: '6 min read',
      url: '/news/xrpl-features'
    },
    {
      id: 'xrp3',
      title: 'Major Banks Join RippleNet for Real-Time Settlement',
      image: '/images/articles/ripplenet-banks.jpg',
      tags: ['Partnership', 'Banking', 'Settlement'],
      timeAgo: '1h ago',
      readTime: '5 min read',
      url: '/news/ripplenet-expansion'
    },
    {
      id: 'xrp4',
      title: 'XRP Community Launches Developer Grant Program',
      image: '/images/articles/xrp-dev.jpg',
      tags: ['Community', 'Development', 'Funding'],
      timeAgo: '2h ago',
      readTime: '3 min read',
      url: '/news/xrp-grants'
    }
  ],
  sol: [
    {
      id: 'sol1',
      title: 'Solana Price Surges Amid Network Upgrade Optimism',
      image: '/images/articles/solana-price.jpg',
      tags: ['SOL', 'Network', 'Update'],
      timeAgo: '15m ago',
      readTime: '3 min read',
      url: '/news/sol-surge'
    },
    {
      id: 'sol2',
      title: 'Solana DeFi Protocol Sets New Volume Record',
      image: '/images/articles/sol-defi.jpg',
      tags: ['DeFi', 'Trading', 'Volume'],
      timeAgo: '35m ago',
      readTime: '4 min read',
      url: '/news/sol-defi-record'
    },
    {
      id: 'sol3',
      title: 'Solana Mobile Reports Strong Device Sales',
      image: '/images/articles/saga-phone.jpg',
      tags: ['Mobile', 'Adoption', 'Technology'],
      timeAgo: '1h ago',
      readTime: '5 min read',
      url: '/news/sol-mobile-sales'
    },
    {
      id: 'sol4',
      title: 'New Gaming Studio Launches on Solana',
      image: '/images/articles/sol-gaming.jpg',
      tags: ['Gaming', 'Development', 'Ecosystem'],
      timeAgo: '2h ago',
      readTime: '4 min read',
      url: '/news/sol-gaming'
    }
  ],
  speculative: [
    {
      id: 'spec1',
      title: 'New DeFi Protocol Sees Record TVL Growth in First Week',
      image: '/images/articles/defi-growth.jpg',
      tags: ['DeFi', 'Growth', 'Protocol'],
      timeAgo: '2h ago',
      readTime: '5 min read',
      url: '/news/defi-tvl'
    },
    {
      id: 'spec2',
      title: 'AI-Powered Trading Platform Launches Beta',
      image: '/images/articles/ai-trading.jpg',
      tags: ['AI', 'Trading', 'Technology'],
      timeAgo: '45m ago',
      readTime: '4 min read',
      url: '/news/ai-trading'
    },
    {
      id: 'spec3',
      title: 'New Layer 1 Chain Announces Mainnet Date',
      image: '/images/articles/new-l1.jpg',
      tags: ['Layer1', 'Launch', 'Technology'],
      timeAgo: '1h ago',
      readTime: '6 min read',
      url: '/news/new-chain'
    },
    {
      id: 'spec4',
      title: 'Privacy-Focused DEX Gains Traction',
      image: '/images/articles/privacy-dex.jpg',
      tags: ['DEX', 'Privacy', 'Trading'],
      timeAgo: '2h ago',
      readTime: '3 min read',
      url: '/news/privacy-dex'
    }
  ]
}; 