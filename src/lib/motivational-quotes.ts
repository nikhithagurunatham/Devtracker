export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  role: string;
  category: 'BTS' | 'VIRAT_KOHLI' | 'TECH' | 'DISCIPLINE';
  avatar?: string;
}

export const motivationalQuotes: MotivationalQuote[] = [
  // --- BTS Quotes ---
  {
    id: 'bts-1',
    quote: "If you can't fly, then run. If you can't run, then walk. Today we will survive.",
    author: 'RM (Kim Namjoon)',
    role: 'Leader, BTS',
    category: 'BTS',
  },
  {
    id: 'bts-2',
    quote: "Effort makes you. You will regret someday if you don't do your best now.",
    author: 'Jungkook',
    role: 'Main Vocalist, BTS',
    category: 'BTS',
  },
  {
    id: 'bts-3',
    quote: "Don't be trapped in someone else's dream. Create your own path step by step.",
    author: 'V (Kim Taehyung)',
    role: 'BTS',
    category: 'BTS',
  },
  {
    id: 'bts-4',
    quote: "Life is tough, and things don't always work out well, but we should be brave and go on with our lives.",
    author: 'Suga (Min Yoongi)',
    role: 'Producer & Rapper, BTS',
    category: 'BTS',
  },
  {
    id: 'bts-5',
    quote: "When things get tough, stop for a while and look back at how far you've come. Don't forget how rewarding it is.",
    author: 'Jin (Kim Seokjin)',
    role: 'BTS',
    category: 'BTS',
  },
  {
    id: 'bts-6',
    quote: "Never give up on a dream that you've been chasing almost your whole life.",
    author: 'Jimin (Park Jimin)',
    role: 'BTS',
    category: 'BTS',
  },
  {
    id: 'bts-7',
    quote: "If you don't work hard, there won't be good results. Believe in the hours you put in.",
    author: 'J-Hope (Jung Hoseok)',
    role: 'BTS',
    category: 'BTS',
  },

  // --- Virat Kohli Quotes ---
  {
    id: 'vk-1',
    quote: 'Self-belief and hard work will always earn you success. Whatever you want to do, do with passion and work really hard towards it.',
    author: 'Virat Kohli',
    role: 'Legendary Indian Cricketer & Former Captain',
    category: 'VIRAT_KOHLI',
  },
  {
    id: 'vk-2',
    quote: 'Never give up. Today is hard, tomorrow will be worse, but the day after tomorrow will be sunshine if you stay disciplined.',
    author: 'Virat Kohli',
    role: 'Modern Cricket Master',
    category: 'VIRAT_KOHLI',
  },
  {
    id: 'vk-3',
    quote: 'Discipline is choosing between what you want now and what you want most. Focus relentlessly on your process.',
    author: 'Virat Kohli',
    role: 'Fitness & Mindset Icon',
    category: 'VIRAT_KOHLI',
  },
  {
    id: 'vk-4',
    quote: "If you stay true to yourself and your preparation, external noise doesn't matter. Just step up and execute.",
    author: 'Virat Kohli',
    role: 'World Champion',
    category: 'VIRAT_KOHLI',
  },
  {
    id: 'vk-5',
    quote: 'I like to be under pressure. If there is no pressure, then I am not in the zone.',
    author: 'Virat Kohli',
    role: 'Elite Athlete',
    category: 'VIRAT_KOHLI',
  },

  // --- Tech & Engineering Legends ---
  {
    id: 'tech-1',
    quote: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
    role: 'Creator of Linux & Git',
    category: 'TECH',
  },
  {
    id: 'tech-2',
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    role: 'Computer Scientist',
    category: 'TECH',
  },
  {
    id: 'tech-3',
    quote: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
    role: 'Turing Award Winner & OOP Pioneer',
    category: 'TECH',
  },
  {
    id: 'tech-4',
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    role: 'Turing Award Winner',
    category: 'TECH',
  },
  {
    id: 'tech-5',
    quote: 'Consistency is the DNA of mastery. Small daily commits lead to monumental breakthroughs.',
    author: 'Software Engineering Axiom',
    role: 'Engineering Mindset',
    category: 'DISCIPLINE',
  },
];

export function getRandomQuote(): MotivationalQuote {
  const index = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[index];
}

export function getDailyQuote(): MotivationalQuote {
  const todayStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % motivationalQuotes.length;
  return motivationalQuotes[index];
}
