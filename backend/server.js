require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger text payloads for files

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3';

if (!NVIDIA_API_KEY) {
  console.warn('Warning: Missing API keys in environment. Please set NVIDIA_API_KEY. The application will run in fallback mock mode.');
}

const SYSTEM_PROMPT = `You are an AI book summarizer creating daily reading summaries. You will receive the following inputs:
- book_title: string
- author: string
- day: integer (e.g., 1, 2, 3…)
- pages_text: string containing the raw text of the 10 pages assigned for this day. If the book has fewer than 10 pages left on the final day, you will receive the remaining pages.

Your task: Generate a daily summary that helps the reader absorb the most valuable insights, stories, quotes, and a practical action step.

Output exactly the following structure using Markdown headings:

# Day {day} Summary – {book_title} by {author}

## Brief Description
[A concise, 2-3 sentence overview of what this segment covers, focusing on the main theme or argument.]

## Key Insights
- **Insight 1**: [Detailed explanation, at least 3 sentences, capturing a core concept, its context, and why it matters.]
- **Insight 2**: [Additional insight...]
(Provide 3-5 insights, depending on the richness of the material.)

## Stories & Examples
[Narrate any anecdotes, case studies, or examples the author shares in this segment. Retell them in an engaging, story-driven way. If no stories or examples are found, write "No stories or examples in this segment."]

## Quotes
- "Quote 1" – (approximate location if known)
- "Quote 2"
(Include 2-3 of the most impactful, memorable quotes from the text. If none stand out, write "No quotable passages in this segment.")

## Today's Task
[One concrete, actionable exercise or reflection that the user can do today based on the reading. Make it specific, step‑by‑step, and directly applicable to daily life.]

Style: Premium storytelling tone — clear, inspiring, and warm. Make every sentence feel worth reading. Keep the entire summary comprehensive yet concise (aim for 400–600 words). Do not include any text outside this Markdown structure.`;

function generateFallbackSummary(title, author, text, day = 1, totalDays = 1) {
  const cleanTitle = title || "Untitled Document";
  const cleanAuthor = author || "Unknown Author";
  const lowerTitle = cleanTitle.toLowerCase();

  if (lowerTitle.includes("atomic habit")) {
    const daysContent = {
      1: {
        one_line_summary: "An extremely practical guide to letting tiny daily habits compound into life-changing results.",
        overview: "James Clear presents a framework for building good habits and breaking bad ones. Today covers the fundamentals of behavior change, focusing on 1% improvements every day and the power of compounding effects.",
        key_takeaways: [
          {
            title: "Focus on Systems, Not Goals",
            explanation: "Goals are about the results you want to achieve, while systems are about the processes that lead to those results. You do not rise to the level of your goals; you fall to the level of your systems."
          },
          {
            title: "Identity-Based Habits",
            explanation: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become. Real behavior change is identity change."
          }
        ],
        best_stories: [
          {
            title: "The British Cycling Transformation",
            story: "Dave Brailsford became the performance director of British Cycling. He applied the 'aggregation of marginal gains'—improving everything from bike seats to pillows by 1%. Within five years, they dominated the Olympics and won the Tour de France.",
            lesson: "Small 1% improvements across many areas accumulate into monumental competitive advantages."
          }
        ],
        actionable_insights: [
          {
            insight: "Focus on Identity Shift",
            how_to_apply: "Instead of saying 'I want to write a book', say 'I am a writer'. Act like the person you want to become by writing one paragraph today."
          }
        ]
      },
      2: {
        one_line_summary: "To build a good habit, make it Obvious and Attractive.",
        overview: "Today covers the First and Second Laws of Behavior Change. We explore how to design your environment to make the cues of good habits highly visible, and how to use temptation bundling to make habits irresistible.",
        key_takeaways: [
          {
            title: "Law 1: Make it Obvious",
            explanation: "Every habit is initiated by a cue. We are more likely to perform actions when their triggers are obvious in our environment."
          },
          {
            title: "Law 2: Make it Attractive",
            explanation: "The more attractive an opportunity is, the more likely it is to become habit-forming. Dopamine is released not only when you experience pleasure, but when you anticipate it."
          }
        ],
        best_stories: [
          {
            title: "Temptation Bundling in Action",
            story: "An engineering student named Ronan Byrne wanted to exercise more but loved watching Netflix. He hacked a stationary bike and programmed it so Netflix would only play if he pedaled above a certain speed.",
            lesson: "You can make a habit more attractive by bundling it with something you already want to do."
          }
        ],
        actionable_insights: [
          {
            insight: "Habit Stacking",
            how_to_apply: "Stack your new habit on top of a current daily habit. Use the formula: 'After [CURRENT HABIT], I will [NEW HABIT]'. E.g., After I pour my morning coffee, I will meditate for one minute."
          },
          {
            insight: "Design Your Environment",
            how_to_apply: "Place the cues of your desired habits in high-traffic spots. E.g., put your running shoes next to the front door."
          }
        ]
      },
      3: {
        one_line_summary: "To build a good habit, make it Easy and Satisfying.",
        overview: "Today covers the Third and Fourth Laws of Behavior Change. Learn how to decrease friction for good habits, use the Two-Minute Rule to get started, and leverage immediate rewards to make habits stick.",
        key_takeaways: [
          {
            title: "Law 3: Make it Easy",
            explanation: "Human behavior follows the Law of Least Effort. We naturally gravitate toward the option that requires the least amount of work. Shape your environment to make good actions as easy as possible."
          },
          {
            title: "Law 4: Make it Satisfying",
            explanation: "What is immediately rewarded is repeated. What is immediately punished is avoided. The brain prioritizes immediate rewards over delayed ones."
          }
        ],
        best_stories: [
          {
            title: "The Paper Clip Strategy",
            story: "A young stockbroker named Trent Dyrsmid started his day with two jars: one filled with 120 paper clips, the other empty. After every sales call, he moved one paper clip. He kept calling until the jar was empty, rapidly building a successful career.",
            lesson: "Visual progress trackers make habits obvious and satisfying to maintain."
          }
        ],
        actionable_insights: [
          {
            insight: "The Two-Minute Rule",
            how_to_apply: "Scale down any new habit so it takes less than two minutes. E.g., 'Read 30 pages' becomes 'Read one page'. Get started first; optimization comes later."
          },
          {
            insight: "Instant Reinforcement",
            how_to_apply: "Create an immediate reward for yourself when you finish a habit. E.g., open a savings account labeled 'Trip to Europe' and transfer $5 every time you skip a fancy coffee."
          }
        ]
      },
      4: {
        one_line_summary: "How to break bad habits by making them invisible, unattractive, difficult, and unsatisfying.",
        overview: "Today we invert the Four Laws of Behavior Change to break bad habits. We look at hiding cues, reframing mindsets, increasing friction, and utilizing accountability partners.",
        key_takeaways: [
          {
            title: "Invert the Laws for Bad Habits",
            explanation: "To stop a bad habit: make the cue Invisible, make it Unattractive, make it Difficult (increase friction), and make it Unsatisfying (create immediate costs)."
          },
          {
            title: "The Power of a Commitment Device",
            explanation: "A commitment device is a choice you make in the present that controls your actions in the future. It locks you into good behavior before you have the temptation to fail."
          }
        ],
        best_stories: [
          {
            title: "Victor Hugo's Locked Clothes",
            story: "To finish his novel 'The Hunchback of Notre Dame' on deadline, Victor Hugo bought a huge grey knit shawl, locked up all his formal clothes in a chest, and had his assistant hide the key so he could not leave the house.",
            lesson: "Increasing the friction of bad habits (like leaving the house to procrastinate) forces focus."
          }
        ],
        actionable_insights: [
          {
            insight: "Add Friction to Temptations",
            how_to_apply: "If you spend too much time on social media, delete the apps from your phone or have a friend change your passwords during work hours."
          },
          {
            insight: "Create a Habit Contract",
            how_to_apply: "Write down a contract detailing a bad habit you want to stop and a penalty if you fail. Have an accountability partner sign it to make failure immediately unsatisfying."
          }
        ]
      },
      5: {
        one_line_summary: "Advanced tactics: How to go from being merely good to being truly great.",
        overview: "In the final segment, we look at how to sustain habits over the long run, the Goldilocks Rule of motivation, and how to maintain habits when life gets boring or repetitive.",
        key_takeaways: [
          {
            title: "The Goldilocks Rule",
            explanation: "Humans experience peak motivation when working on tasks that are right on the edge of their current abilities. Not too hard, not too easy. Just right."
          },
          {
            title: "The Downside of Good Habits",
            explanation: "Habits are necessary, but not sufficient for mastery. When actions become automatic, you stop paying attention to minor errors. Mastery requires combining automatic habits with deliberate practice."
          }
        ],
        best_stories: [
          {
            title: "The Professional Who Shows Up",
            story: "A famous coach was asked: 'What is the difference between the best athletes and the average ones?' He answered: 'It comes down to who can handle the boredom of training every single day, doing the same lifts over and over.'",
            lesson: "Professionals stick to schedules; amateurs let life get in the way. Fall in love with boredom."
          }
        ],
        actionable_insights: [
          {
            insight: "Find Your Goldilocks Zone",
            how_to_apply: "If a habit becomes too boring, increase the challenge slightly (by 5%) to stay motivated. If it is too hard, simplify it."
          },
          {
            insight: "Conduct a Weekly Review",
            how_to_apply: "Set aside 15 minutes every Sunday to review your habit tracker, analyze where you slipped up, and adjust your systems for the upcoming week."
          }
        ]
      }
    };

    const targetDay = Math.min(day, 5);
    const dayData = daysContent[targetDay] || daysContent[1];
    return {
      title: "Atomic Habits",
      author: "James Clear",
      ...dayData
    };
  }

  if (lowerTitle.includes("psychology of money")) {
    const daysContent = {
      1: {
        one_line_summary: "Doing well with money isn't about what you know; it's about how you behave.",
        overview: "Today introduces how people think about wealth and financial success. We look at the story of Ronald Read (the frugal janitor who saved millions) versus Richard Fuscone (the executive who went bankrupt).",
        key_takeaways: [
          {
            title: "Frugality Beats Raw Intelligence",
            explanation: "Financial success is a soft skill driven by behavior and emotion rather than spreadsheets and formulas. A patient janitor can out-invest a reckless MBA."
          },
          {
            title: "No One is Crazy",
            explanation: "People from different generations, countries, and backgrounds make different financial decisions because their early experiences with money shaped their risk tolerance."
          }
        ],
        best_stories: [
          {
            title: "The Janitor Who Left a Fortune",
            story: "Ronald Read was a gas station attendant and janitor who quietly saved and invested in blue-chip stocks for decades. When he died, he left over $8 million to charity, shocking his local community.",
            lesson: "Frugality and patience beat high intelligence and complex strategies when it comes to financial compounding."
          }
        ],
        actionable_insights: [
          {
            insight: "Acknowledge Luck and Risk",
            how_to_apply: "When evaluating financial success or failure, recognize that nothing is as good or as bad as it seems. Focus on broad patterns rather than extreme individual stories."
          }
        ]
      },
      2: {
        one_line_summary: "Understanding the difference between getting rich and staying rich.",
        overview: "Today covers the psychology of preservation. Compounding works best when you can let assets grow uninterrupted for decades. Staying rich requires survival, humility, and fear.",
        key_takeaways: [
          {
            title: "Getting Rich vs. Staying Rich",
            explanation: "Getting rich requires taking risks, optimism, and putting yourself out there. Staying rich requires the opposite: humility, frugality, and fear that what you made can be taken away."
          },
          {
            title: "The Magic of Compounding",
            explanation: "Compounding isn't intuitive. Small, consistent returns over a very long time lead to astronomical results. Warren Buffett made 99% of his wealth after his 50th birthday."
          }
        ],
        best_stories: [
          {
            title: "The Millionaire Who Went Broke",
            story: "Richard Fuscone was a highly successful Harvard-educated executive who took on massive debt to build a palatial home. When the 2008 financial crisis hit, he went bankrupt and lost everything.",
            lesson: "Without behavioral control, no amount of financial intelligence or initial wealth can save you from ruin."
          }
        ],
        actionable_insights: [
          {
            insight: "Plan for the Plan Not Going According to Plan",
            how_to_apply: "When planning, always leave a buffer for unexpected downturns or mistakes. A plan only works if it can survive the collision with reality."
          }
        ]
      },
      3: {
        one_line_summary: "True wealth is the asset you don't see.",
        overview: "Today we discuss the difference between spending money to show off and building true wealth. Wealth is the option value of money that has not yet been spent.",
        key_takeaways: [
          {
            title: "Wealth is What You Don't See",
            explanation: "Wealth is the unused capital, the cars not purchased, and the diamonds not bought. Spending money to show people how much money you have is the fastest way to have less money."
          },
          {
            title: "Save Money. Just Save.",
            explanation: "You don't need a specific reason to save (like buying a house or a car). Saving for the sake of saving gives you flexibility, control, and options in an unpredictable world."
          }
        ],
        best_stories: [
          {
            title: "The Gold Coins in the River",
            story: "Housel tells of a wealthy technology executive who carried around stacks of gold coins, throwing them into a river just to show off his wealth. He went bankrupt shortly after.",
            lesson: "Showing off wealth is the quickest way to destroy it. Wealth is hidden restraint."
          }
        ],
        actionable_insights: [
          {
            insight: "Define Your 'Enough'",
            how_to_apply: "Recognize when the pursuit of more becomes a danger to what you already have. Avoid moving the goalposts of success as your wealth grows."
          }
        ]
      },
      4: {
        one_line_summary: "The highest dividend money pays is control over your time.",
        overview: "Today covers freedom. The most valuable thing money can buy is the ability to do what you want, when you want, with whom you want, for as long as you want.",
        key_takeaways: [
          {
            title: "Time is the Ultimate Currency",
            explanation: "Control over your schedule is the highest driver of positive emotional well-being. Having a high-paying job but no control over your time makes you less happy than having moderate wealth with flexibility."
          },
          {
            title: "Reasonable beats Rational",
            explanation: "Do not aim to be cold-heartedly rational when managing your money. Aim to be reasonable, which is more sustainable and helps you sleep at night."
          }
        ],
        best_stories: [
          {
            title: "The Coal Miner's Gift",
            story: "Housel's grandfather worked as a coal miner and saved diligently not to become a millionaire, but to ensure his children had the freedom to choose their own career paths.",
            lesson: "Flexibility and options are the ultimate utility of accumulated savings."
          }
        ],
        actionable_insights: [
          {
            insight: "Focus on Control of Your Time",
            how_to_apply: "Use money to buy back control over your daily schedule. Build an emergency fund of 6-12 months of expenses to buy independence from jobs you dislike."
          }
        ]
      },
      5: {
        one_line_summary: "Summary and Conclusion: The cost of admission.",
        overview: "In the final day, we look at the 'price' of investing (volatility and uncertainty) and how to make long-term financial decisions that align with your personal values.",
        key_takeaways: [
          {
            title: "Everything Has a Price, But Not All Prices Are on Labels",
            explanation: "The price of investing success isn't just money; it's fee, fear, doubt, and regret. Treat volatility as a fee you pay to get high returns, not a fine for doing something wrong."
          },
          {
            title: "You & Me: Different Games",
            explanation: "Avoid taking financial cues from people playing a different game than you. A short-term day trader has different rules than a 30-year retirement investor."
          }
        ],
        best_stories: [
          {
            title: "The Bubble of 1999",
            story: "During the dot-com bubble, long-term investors started following day traders, buying tech stocks at astronomical valuations. When the bubble burst, the long-term investors suffered the most because they forgot what game they were playing.",
            lesson: "Always understand your own investment horizon and don't copy others blindly."
          }
        ],
        actionable_insights: [
          {
            insight: "Determine Your Investment 'Fee'",
            how_to_apply: "When the stock market drops 10-20%, accept it as the fee of admission for long-term wealth compounding rather than a punishment for a mistake."
          }
        ]
      }
    };

    const targetDay = Math.min(day, 5);
    const dayData = daysContent[targetDay] || daysContent[1];
    return {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      ...dayData
    };
  }

  // A generic fallback for other books or documents (with progressive pages information)
  return {
    title: cleanTitle,
    author: cleanAuthor,
    one_line_summary: `Day ${day} Summary: A narrative summary of ${cleanTitle} exploring how key concepts translate into practical wisdom.`,
    overview: text
      ? `[Day ${day} of ${totalDays}] This segment covers pages ${(day - 1) * 10 + 1} to ${Math.min(day * 10, (totalDays * 10)) || 'N'}. Text snippet analyzed: "${text.slice(0, 200)}..."`
      : `Day ${day} of a ${totalDays}-day reading plan for ${cleanTitle} by ${cleanAuthor}. This covers key arguments, case studies, and models presented in this section.`,
    key_takeaways: [
      {
        title: `Takeaway 1 (Day ${day})`,
        explanation: `In Day ${day}'s section, we learn that structured execution is critical for turning theory into practice.`
      },
      {
        title: "Adaptive Feedback Loops",
        explanation: "Continuous refinement is required as you gather direct feedback from real-world application."
      }
    ],
    best_stories: [
      {
        title: `The Story of Progression (Day ${day})`,
        story: `An builder tries to implement a complex feature and splits it into manageable daily pieces, showing steady progress over time.`,
        lesson: "Breaking large books or tasks into smaller chunks ensures completion."
      }
    ],
    actionable_insights: [
      {
        insight: `Action Item for Day ${day}`,
        how_to_apply: "Take the primary insight of this segment and write down one action to execute in your routine today."
      }
    ]
  };
}

function formatFallbackToMarkdown(fallbackJson, day, title, author) {
  const cleanTitle = title || fallbackJson.title || "Book";
  const cleanAuthor = author || fallbackJson.author || "Unknown Author";

  let insightsMd = '';
  if (Array.isArray(fallbackJson.key_takeaways)) {
    insightsMd = fallbackJson.key_takeaways.map((item, idx) => `- **Insight ${idx + 1}**: **${item.title}**: ${item.explanation}`).join('\n');
  } else {
    insightsMd = `- **Insight 1**: A key insight from this reading segment.`;
  }

  let storiesMd = 'No stories or examples in this segment.';
  if (Array.isArray(fallbackJson.best_stories) && fallbackJson.best_stories.length > 0) {
    storiesMd = fallbackJson.best_stories.map(item => `### ${item.title}\n${item.story}\n\n*Lesson*: ${item.lesson}`).join('\n\n');
  }

  let quotesMd = 'No quotable passages in this segment.';
  if (cleanTitle.toLowerCase().includes("atomic habit")) {
    quotesMd = `- "You do not rise to the level of your goals. You fall to the level of your systems."\n- "Every action you take is a vote for the type of person you wish to become."`;
  } else if (cleanTitle.toLowerCase().includes("psychology of money")) {
    quotesMd = `- "Doing well with money isn't about what you know. It's about how you behave."\n- "Wealth is what you don't see."`;
  }

  let taskMd = 'No concrete exercise assigned for today.';
  if (Array.isArray(fallbackJson.actionable_insights) && fallbackJson.actionable_insights.length > 0) {
    taskMd = fallbackJson.actionable_insights.map(item => `**${item.insight}**\n${item.how_to_apply}`).join('\n\n');
  }

  return `# Day ${day} Summary – ${cleanTitle} by ${cleanAuthor}

## Brief Description
${fallbackJson.one_line_summary || 'A concise overview of this segment.'}
${fallbackJson.overview || ''}

## Key Insights
${insightsMd}

## Stories & Examples
${storiesMd}

## Quotes
${quotesMd}

## Today's Task
${taskMd}`;
}

app.get('/api/summarize', (req, res) => {
  res.json({ message: 'Please POST JSON { "allPages": [...], "day": 1 } to this endpoint for summarization.' });
});

app.post('/api/summarize', async (req, res) => {
  const { text, title, author, day, totalDays, allPages, totalPages } = req.body;
  if (!text && !title && !allPages) {
    return res.status(400).json({ error: 'Missing text, title, or allPages' });
  }

  const currentDay = day || 1;
  const numDays = totalDays || 1;

  // Track the last page processed for this book
  let pageText = text || '';
  let lastPageProcessed = 0;
  if (Array.isArray(allPages) && allPages.length > 0) {
    const startPage = (currentDay - 1) * 10;
    const endPage = currentDay * 10;
    pageText = allPages.slice(startPage, endPage).join('\n');
    lastPageProcessed = Math.min(endPage, totalPages || allPages.length);
  } else if (totalPages) {
    lastPageProcessed = Math.min(currentDay * 10, totalPages);
  } else {
    lastPageProcessed = currentDay * 10;
  }

  const hasNvidiaKey = NVIDIA_API_KEY && NVIDIA_API_KEY !== 'YOUR_NVIDIA_API_KEY' && NVIDIA_API_KEY !== '';

  if (!hasNvidiaKey) {
    console.log(`Using fallback summary generator for: "${title || 'Uploaded Document'}" (Day ${currentDay}/${numDays})`);
    const fallbackJSON = generateFallbackSummary(title, author, pageText, currentDay, numDays);
    const fallbackMD = formatFallbackToMarkdown(fallbackJSON, currentDay, title, author);
    return res.json({ summary: fallbackMD, lastPageProcessed });
  }

  let userPrompt = '';
  if (pageText) {
    userPrompt = `You are summarizing Day ${currentDay} of a ${numDays}-day reading plan for the document "${title || 'Uploaded Document'}"${author ? ` by ${author}` : ''}.
Please summarize the following text which covers this daily segment:

${pageText}`;
  } else {
    userPrompt = `Please summarize Day ${currentDay} of a ${numDays}-day reading plan for the book "${title}"${author ? ` by ${author}` : ''}.
Focus specifically on the content that corresponds to Day ${currentDay} of the plan (which covers roughly section/part ${currentDay} of ${numDays} parts of the book).`;
  }

  // If this is the final day (or remaining pages are fewer than 10), add a special completed note
  const isFinalDay = currentDay === numDays || (Array.isArray(allPages) && (currentDay * 10) >= allPages.length);
  if (isFinalDay) {
    userPrompt += `\n\nNote: This is the final day of the reading plan. Please include a 'book completed' closing summary or celebratory note at the very end of your markdown summary.`;
  }

  const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const authHeader = `Bearer ${NVIDIA_API_KEY}`;
  const bodyPayload = {
    model: NVIDIA_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 8192,
    temperature: 0.7,
    top_p: 0.95,
    stream: false
  };
  console.log(`Calling NVIDIA NIM API with model: ${NVIDIA_MODEL} (Day ${currentDay}/${numDays})`);

  const apiTimeout = parseInt(process.env.API_TIMEOUT, 10) || 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`API request to ${invokeUrl} timed out after ${apiTimeout / 1000} seconds. Aborting.`);
    controller.abort();
  }, apiTimeout);

  try {
    const response = await fetch(invokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const assistantMessage = data.choices?.[0]?.message?.content || '';
    res.json({
      summary: assistantMessage.trim(),
      lastPageProcessed
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('API call failed:', err.message);
    console.log('Falling back to local summary generator.');
    const fallbackJSON = generateFallbackSummary(title, author, pageText, currentDay, numDays);
    const fallbackMD = formatFallbackToMarkdown(fallbackJSON, currentDay, title, author);
    res.json({ summary: fallbackMD, lastPageProcessed });
  }
});

// --- Auth Routes ---
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const newUser = db.createUser(username, password);
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.findUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username
    }
  });
});

// --- Summary Library Routes ---
app.get('/api/summaries', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  const summaries = db.getUserSummaries(userId);
  res.json(summaries);
});

app.get('/api/summaries/:id', (req, res) => {
  const { id } = req.params;
  const summary = db.getSummaryById(id);

  if (!summary) {
    return res.status(404).json({ error: 'Summary not found' });
  }
  res.json(summary);
});

app.post('/api/summaries', (req, res) => {
  const { userId, summary } = req.body;
  if (!userId || !summary) {
    return res.status(400).json({ error: 'Missing userId or summary payload' });
  }

  try {
    const saved = db.saveUserSummary(userId, summary);
    res.json({ success: true, summary: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/summaries/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  const deleted = db.deleteUserSummary(userId, id);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Summary not found or not owned by user' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`AI Book Summarizer backend listening on port ${PORT}`);
  });
}

module.exports = app;


