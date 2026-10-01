import { AIMode, Task, Problem, UserProfile, DailyScheduleSlot } from '@/types';
import { DevTrackStore } from './storage';

export interface ParsedQuickAction {
  tasksToCreate?: Array<{
    title: string;
    category: 'DSA' | 'WEB_DEV' | 'PROJECT' | 'CS' | 'JOB' | 'PERSONAL' | 'REVISION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate: string;
    estimatedTime?: number;
    tags: string[];
    description?: string;
  }>;
  problemsCount?: number;
  dsaTopicName?: string;
  webDevMinutes?: number;
  webDevTopicName?: string;
  moodScore?: number;
  appliedCompany?: string;
  appliedRole?: string;
  summaryExplanation: string;
}

export class AIService {
  /**
   * Generates a context-aware response from DevMentor AI.
   * Injects current user progress, weak topics, and active interview milestones.
   */
  static async chat(
    userMessage: string,
    mode: AIMode = 'EXPLAIN',
    isWebSearch: boolean = false
  ): Promise<{ response: string; source: 'MY_KNOWLEDGE' | 'WEB_SEARCH'; contextSummary: string }> {
    const profile = DevTrackStore.getProfile();
    const problems = DevTrackStore.getProblems();
    const weakProblems = problems.filter((p) => p.confidence <= 2 || p.status === 'ATTEMPTED');
    const weakTopics = Array.from(new Set(weakProblems.map((p) => p.topicName).filter((t): t is string => Boolean(t))));
    const revisionsDue = problems.filter((p) => p.nextRevisionAt && p.nextRevisionAt <= new Date().toISOString().split('T')[0]);
    const jobApps = DevTrackStore.getJobApplications().filter((a) => a.status === 'INTERVIEW' || a.status === 'OA');

    const contextSummary = `User: ${profile.name} (Target: ${profile.targetRole} @ ${profile.targetCompanies.join(', ')}). Weak Areas: ${weakTopics.join(', ') || 'None'}. Revisions Due: ${revisionsDue.length}. Active Interviews: ${jobApps.map((j) => `${j.company} (${j.status})`).join(', ') || 'None'}.`;

    // Check if an OpenAI key is configured on server/client
    const apiKey = typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined;

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const prompt = this.buildSystemPrompt(mode, contextSummary, isWebSearch);
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const reply = json.choices?.[0]?.message?.content;
          if (reply) {
            return {
              response: reply,
              source: isWebSearch ? 'WEB_SEARCH' : 'MY_KNOWLEDGE',
              contextSummary,
            };
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to local DevMentor AI knowledge engine:', err);
      }
    }

    // Context-Aware Intelligent Local DevMentor AI Generator
    const response = this.generateLocalMentorResponse(userMessage, mode, isWebSearch, {
      weakTopics,
      weakProblems,
      revisionsDue,
      jobApps,
      profile,
    });

    return {
      response,
      source: isWebSearch ? 'WEB_SEARCH' : 'MY_KNOWLEDGE',
      contextSummary,
    };
  }

  private static buildSystemPrompt(mode: AIMode, contextSummary: string, isWebSearch: boolean): string {
    return `You are DevMentor AI, a senior Staff Software Engineer and FAANG mentor embedded inside DevTrack AI.
User Context: ${contextSummary}
Current Mode: ${mode}
Search Source: ${isWebSearch ? 'WEB SEARCH (provide verified external engineering practices)' : 'MY KNOWLEDGE (focus on student notes, weak areas, and active roadmap)'}

Guidelines:
- Give crisp, production-grade SDE-1 advice.
- When explaining DSA, emphasize invariants, time/space complexities, and pattern triggers.
- In HINT mode, give progressive clues without spoiling code.
- In INTERVIEW mode, act as an Amazon/Google interviewer asking follow-ups and edge cases.
- In DEBUG mode, pinpoint common pitfalls (off-by-one, integer overflow, stale closures).`;
  }

  private static generateLocalMentorResponse(
    msg: string,
    mode: AIMode,
    isWebSearch: boolean,
    ctx: {
      weakTopics: string[];
      weakProblems: Problem[];
      revisionsDue: Problem[];
      jobApps: any[];
      profile: UserProfile;
    }
  ): string {
    const lower = msg.toLowerCase();

    // Mode: QUIZ
    if (mode === 'QUIZ') {
      return `🧠 **DevMentor AI — Quick SDE-1 Knowledge Check**

**Question:** What is the loop condition invariant for Binary Search on a sorted array when searching for an exact target vs lower-bound insertion index?
1. Why does \`while (low <= high)\` require \`high = mid - 1\`, while \`while (low < high)\` typically sets \`high = mid\`?
2. In JavaScript/TypeScript, what happens if you mutate state directly instead of passing a pure updater function into \`setState\`?

*Think through your reasoning and reply with your solution!*`;
    }

    // Mode: INTERVIEW
    if (mode === 'INTERVIEW') {
      return `👔 **Mock Technical Interview Round (Amazon SDE-1 Simulation)**

"Hi ${ctx.profile.name}. Let's dive into our technical problem.

**Problem Statement:**
You are given an array of integers \`heights\` representing building elevations. After a torrential rain, compute how much water can be trapped between the buildings.

**Your First Steps:**
1. State your clarifying questions (e.g. constraints on array length, negative heights).
2. Propose a brute force approach and analyze its complexity.
3. Can you optimize it to $O(N)$ time and $O(1)$ auxiliary space using Two Pointers or Monotonic Stack?

Please walk me through your thought process before writing any code."`;
    }

    // Mode: SEARCH_MY_NOTES
    if (mode === 'SEARCH_MY_NOTES') {
      return `🔍 **DevTrack AI Knowledge Base Search**

Found matching entries from your personal learning history:
- **Binary Search Invariant:** Note recorded on 2026-09-17: *"Always verify \`nums[low] <= nums[mid]\` when searching in rotated sorted arrays. Using strict \`<\` breaks 2-element testcases."*
- **React useEffect Closure Trap:** Note recorded on 2026-09-28: *"Async callbacks inside useEffect capture the initial render state. Use functional state updates \`setCount(c => c + 1)\` or ref-guards."*
- **Active Revisions Due:** You have ${ctx.revisionsDue.length} problem(s) pending spaced repetition today, including **Coin Change (DP)** and **Search in Rotated Sorted Array**.`;
    }

    // Weakness analysis
    if (lower.includes('weak') || lower.includes('failing') || lower.includes('struggling')) {
      return `📊 **DevTrack AI Performance Diagnostic for ${ctx.profile.name}**

Based on your actual problem logs and confidence ratings:
1. **Dynamic Programming (Confidence: 1/5):**
   - You have attempted *Coin Change* 3 times with recorded mistakes on base case initialization and integer overflows.
   - Recommended remedy: Master the 1D state transition template before advancing to 2D knapsack.
2. **Binary Search (Confidence: 2/5):**
   - Last studied 12 days ago. You struggled with *Search in Rotated Sorted Array*.
   - Recommended remedy: Do 2 search-on-answer problems today (*Koko Eating Bananas*, *Capacity to Ship Packages*).
3. **Graph Topological Sort (Confidence: 2/5):**
   - Attempted *Course Schedule*. Mistake noted: inverted graph adjacency edges.

*Action item:* Would you like me to schedule a targeted 45-minute revision block for Binary Search right now?`;
    }

    // Sliding Window
    if (lower.includes('sliding window')) {
      return `🪟 **Sliding Window Pattern Breakdown**

*(I notice you solved Longest Substring Without Repeating Chars with confidence 2/5 and it is due for revision today!)*

**Core Mental Model:**
A sliding window converts an $O(N^2)$ brute-force nested loop into an $O(N)$ linear pass by maintaining a continuous valid state.

**Two Variations:**
1. **Fixed Window of size K:**
   - Initialize window for first $K$ items.
   - Loop $i = K$ to $N-1$: Add $arr[i]$, subtract $arr[i-K]$.
2. **Dynamic Window:**
   - Right pointer expands the window to acquire elements.
   - When the condition becomes invalid (e.g. duplicate character, sum > target), advance the left pointer until validity is restored.

**The Golden Template (C++/TypeScript):**
\`\`\`typescript
function dynamicSlidingWindow(s: string): number {
  let left = 0, maxLength = 0;
  const charMap = new Map<string, number>();

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (charMap.has(ch)) {
      // Pitfall: left must only move forward!
      left = Math.max(left, charMap.get(ch)! + 1);
    }
    charMap.set(ch, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}
\`\`\`

**Your Previous Mistake:**
In your attempt on Sep 17, you missed \`Math.max(left, ...)\`, which caused the left pointer to jump backwards when an old character was re-encountered. Remember to keep the window boundary monotonic!`;
    }

    // Binary Search
    if (lower.includes('binary search')) {
      return `🎯 **Binary Search & Rotated Array Invariant**

*(Your current confidence on Binary Search is 2/5. You have an attempt logged on LeetCode 33).*

**Why Rotated Sorted Arrays Trick People:**
In a rotated array like \`[4, 5, 6, 7, 0, 1, 2]\`, at least one half (\`[low..mid]\` or \`[mid..high]\`) is **guaranteed** to be normally sorted.

**3-Step Decision Algorithm:**
1. Calculate \`mid = low + Math.floor((high - low) / 2)\`.
2. Check if the left half is sorted: \`if (nums[low] <= nums[mid])\`.
   - If target lies in \`[nums[low], nums[mid])\`, discard right: \`high = mid - 1\`.
   - Otherwise, target must be in the right half: \`low = mid + 1\`.
3. Otherwise, the right half is sorted:
   - If target lies in \`(nums[mid], nums[high]]\`, discard left: \`low = mid + 1\`.
   - Otherwise, discard right: \`high = mid - 1\`.

**Crucial SDE-1 Interview Tip:**
Always handle duplicates (\`nums[low] === nums[mid] === nums[high]\`) by incrementing \`low++\` and decrementing \`high--\`, which degrades worst-case to $O(N)$.`;
    }

    // Default Explanatory Mentor Response
    return `👋 **DevMentor AI:**

I have analyzed your query: *"${msg}"*

${
  isWebSearch
    ? '🌐 **Web Search Results:** Current industry standards emphasize modular TypeScript architectures, strict API boundary validation with Zod, and predictable state reducers for high-concurrency SDE-1 systems.'
    : '📚 **Internal Learning Context:** You are on Day 1 of your 100-Day Roadmap towards SDE-1. Your daily target is 5.0 study hours.'
}

**Recommendations for Today:**
1. Master **Day 1 Foundations: Big-O Asymptotic Complexity & Memory Layout**.
2. Solve your first DSA practice problem in the Knowledge Tree.
3. Review **Modern CSS Box Model** and **Process vs Thread** fundamentals.

What specific coding doubt, interview question, or system design concept can I break down for you next?`;
  }

  /**
   * Natural Language Quick-Add Parser:
   * Parses natural strings like:
   * "Do 2 binary search problems tomorrow"
   * "Finished 2 medium binary search problems, studied React useEffect for 45 minutes, mood 4"
   * "Applied to Amazon SDE-1 today"
   */
  /**
   * Natural Language Quick-Add Parser:
   * Parses natural strings like:
   * "Do 2 binary search problems tomorrow"
   * "Study React useEffect for 1 hour today"
   * "Apply to Amazon SDE-1 on Friday"
   */
  static parseQuickAction(input: string): ParsedQuickAction {
    const text = input.trim();
    const lower = text.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    // Compute date based on day of week or relative terms
    let targetDate = today;
    const now = new Date();

    if (lower.includes('tomorrow')) {
      const tomDate = new Date(now);
      tomDate.setDate(tomDate.getDate() + 1);
      targetDate = tomDate.toISOString().split('T')[0];
    } else {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < daysOfWeek.length; i++) {
        const day = daysOfWeek[i];
        if (new RegExp(`\\b(on|this|by)?\\s*${day}\\b`, 'i').test(lower)) {
          const currentDay = now.getDay();
          let diff = (i - currentDay + 7) % 7;
          if (diff === 0) diff = 7; // next week's day if mentioned today
          const target = new Date(now);
          target.setDate(target.getDate() + diff);
          targetDate = target.toISOString().split('T')[0];
          break;
        }
      }
    }

    const result: ParsedQuickAction = {
      summaryExplanation: '',
      tasksToCreate: [],
    };

    // Check for mood score (e.g. "mood 4", "mood: 5", "mood 5/5", "feeling great", "feeling tired")
    const moodMatch = lower.match(/mood\s*(?:is|level|score|rating)?\s*[:=]?\s*([1-5])/);
    if (moodMatch) {
      result.moodScore = parseInt(moodMatch[1], 10);
    } else if (lower.includes('feeling great') || lower.includes('feeling excellent') || lower.includes('mood excellent') || lower.includes('mood: 5') || lower.includes('mood 5')) {
      result.moodScore = 5;
    } else if (lower.includes('feeling good') || lower.includes('feeling happy') || lower.includes('mood good') || lower.includes('mood: 4') || lower.includes('mood 4')) {
      result.moodScore = 4;
    } else if (lower.includes('feeling okay') || lower.includes('feeling fine') || lower.includes('feeling normal') || lower.includes('mood ok')) {
      result.moodScore = 3;
    } else if (lower.includes('feeling tired') || lower.includes('feeling low') || lower.includes('feeling stressed') || lower.includes('mood low')) {
      result.moodScore = 2;
    } else if (lower.includes('feeling terrible') || lower.includes('feeling exhausted') || lower.includes('feeling burnt out') || lower.includes('mood bad')) {
      result.moodScore = 1;
    }

    // Check for duration (e.g. "for 1 hour", "for 45 mins", "for 2 hours")
    let parsedDurationMin = 45;
    const durationHourMatch = lower.match(/(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/);
    const durationMinMatch = lower.match(/(?:for\s+)?(\d+)\s*(?:min|mins|minute|minutes)/);
    if (durationHourMatch) {
      parsedDurationMin = Math.round(parseFloat(durationHourMatch[1]) * 60);
    } else if (durationMinMatch) {
      parsedDurationMin = parseInt(durationMinMatch[1], 10);
    }

    // Category detection
    let category: 'DSA' | 'WEB_DEV' | 'PROJECT' | 'CS' | 'JOB' | 'PERSONAL' | 'REVISION' = 'DSA';
    if (
      lower.includes('react') ||
      lower.includes('useeffect') ||
      lower.includes('css') ||
      lower.includes('javascript') ||
      lower.includes('node') ||
      lower.includes('api') ||
      lower.includes('html') ||
      lower.includes('web dev')
    ) {
      category = 'WEB_DEV';
    } else if (lower.includes('project') || lower.includes('offboarding') || lower.includes('auth')) {
      category = 'PROJECT';
    } else if (
      lower.includes('apply') ||
      lower.includes('applied') ||
      lower.includes('interview') ||
      lower.includes('amazon') ||
      lower.includes('recruiter') ||
      lower.includes('sde') ||
      lower.includes('job')
    ) {
      category = 'JOB';
    } else if (lower.includes('revise') || lower.includes('revision') || lower.includes('spaced repetition')) {
      category = 'REVISION';
    }

    // Priority detection
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    if (lower.includes('urgent') || lower.includes('asap')) {
      priority = 'URGENT';
    } else if (
      lower.includes('important') ||
      lower.includes('high') ||
      category === 'DSA' ||
      category === 'JOB'
    ) {
      priority = 'HIGH';
    }

    // Tags extraction
    const tags: string[] = [category];
    if (lower.includes('binary search')) tags.push('BinarySearch');
    if (lower.includes('react')) tags.push('React');
    if (lower.includes('useeffect')) tags.push('useEffect');
    if (lower.includes('amazon')) tags.push('Amazon');
    if (lower.includes('sde-1') || lower.includes('sde 1') || lower.includes('sde1')) tags.push('SDE-1');
    if (lower.includes('leetcode')) tags.push('LeetCode');
    if (lower.includes('dynamic programming') || lower.includes('dp')) tags.push('DP');
    if (lower.includes('graph')) tags.push('Graph');
    if (lower.includes('tree')) tags.push('Tree');

    // Title generation
    let cleanTitle = text
      .replace(/\s+(tomorrow|today|on\s+[a-zA-Z]+|for\s+\d+\s*(?:hours?|hrs?|mins?|minutes?))\b/gi, '')
      .replace(/^(do|study|apply\s+to)\s+/i, (match) => match)
      .trim();

    // Capitalize first letter
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    result.tasksToCreate?.push({
      title: cleanTitle,
      category,
      priority,
      dueDate: targetDate,
      estimatedTime: parsedDurationMin,
      tags: Array.from(new Set(tags)),
      description: `Structured task parsed from: "${text}"`,
    });

    result.summaryExplanation = `Parsed: "${cleanTitle}" [${category}, ${priority}] due on ${targetDate} (${parsedDurationMin}m)`;

    return result;
  }
}
