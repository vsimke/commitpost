/**
 * Built-in tone profile examples
 * Users can select and use these when generating posts
 */

export const TONE_PROFILES = {
  technical_reflective: {
    name: 'Technical + Reflective',
    description: 'Deep technical work with learning insights',
    content: `Just shipped a massive refactor of our authentication system. We moved from custom middleware to industry-standard OAuth2, cut our auth handling code by 60%, and gave security a huge boost in the process.

The best part? Zero downtime migration. We gradually rolled out the new system behind a feature flag, monitored metrics obsessively, and flipped the switch on a Tuesday afternoon. The team nailed the execution.

Learned a ton about state management in distributed systems, rate limiting strategies, and the glorious pain of deprecating legacy systems. If you're tackling similar challenges, happy to chat about our approach.

Building resilient systems is hard work, but it's worth the effort.`,
  },

  concise_action_oriented: {
    name: 'Concise + Action-Oriented',
    description: 'Direct and results-focused',
    content: `Shipped the redesigned dashboard UI this week. 3K lines of React refactored, cut bundle size by 40%, and page load time dropped from 2.3s to 0.8s.

Used Vite for the build, Vitest for unit tests, and Playwright for E2E. The performance gains alone justified the effort.

Learned a lot about webpack config optimization and JavaScript bundler internals. Next: server-side caching.`,
  },

  learning_focused: {
    name: 'Learning-Focused',
    description: 'Emphasizes growth and new skills',
    content: `Spent the last week diving deep into Rust. Built a CLI tool for parsing git logs, and wow — the language really forces you to think about memory safety.

Coming from JavaScript, the borrow checker felt annoying at first, but it's actually brilliant. Zero runtime panics because the compiler catches everything.

Next project: rewrite our performance-critical backend service in Rust. Excited to see what we can achieve with compiled-language performance.`,
  },

  startup_rapid: {
    name: 'Startup / Rapid Iteration',
    description: 'Fast-paced, shipping-focused',
    content: `Launched beta v2 of our product today. 8 weeks from spec to launch, completely rebuilt backend API from Django to FastAPI.

Metrics look promising: 3x faster response times, 50% fewer database queries. Early users are loving the new UI.

Biggest lesson: shipping fast and iterating beats perfect-but-slow. Next sprint: user analytics and mobile app.`,
  },

  collaboration_focused: {
    name: 'Collaboration-Focused',
    description: 'Highlights teamwork and shared vision',
    content: `Led architecture decision for our new microservices platform. Spent two weeks with the team, evaluated gRPC vs REST, and designed our event streaming approach.

The collaboration was the best part. Pairing with backend, frontend, and DevOps folks forced us to think holistically about the system.

Decision: gRPC for internal services, REST for public APIs. Starting implementation next week. Excited to see it in production.`,
  },
};

/**
 * Get a tone profile by name
 * @param {string} name - Tone profile name (key from TONE_PROFILES)
 * @returns {Object|null} Tone profile object or null if not found
 */
export function getToneProfile(name) {
  return TONE_PROFILES[name] || null;
}

/**
 * Get list of available tone profile names
 * @returns {Array} Array of profile names
 */
export function listToneNames() {
  return Object.keys(TONE_PROFILES);
}

/**
 * Get list of available tone profiles with info
 * @returns {Array} Array of profile objects with name, description, and key
 */
export function listToneProfiles() {
  return Object.entries(TONE_PROFILES).map(([key, profile]) => ({
    key,
    name: profile.name,
    description: profile.description,
  }));
}

/**
 * Format tone profiles for display
 * @returns {string} Formatted list of tone profiles
 */
export function displayToneProfiles() {
  const profiles = listToneProfiles();
  const lines = [
    '📚 Available Tone Profiles:\n',
    ...profiles.map(
      (p) =>
        `  • ${p.key}\n    ${p.name} — ${p.description}`
    ),
  ];
  return lines.join('\n');
}
