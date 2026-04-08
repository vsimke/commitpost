# Example Tone Profile

Below are example writing samples you can use to set your tone profile. 

## How to Use

1. Copy one of these examples or write your own
2. Save to a file: `my-tone.txt`
3. Run: `gitpost config --set-tone my-tone.txt`
4. Verify: `gitpost config --view`

---

## Example 1: Technical + Reflective

```
Just shipped a massive refactor of our authentication system. We moved from 
custom middleware to industry-standard OAuth2, cut our auth handling code by 60%, 
and gave security a huge boost in the process.

The best part? Zero downtime migration. We gradually rolled out the new system 
behind a feature flag, monitored metrics obsessively, and flipped the switch on 
a Tuesday afternoon. The team nailed the execution.

Learned a ton about state management in distributed systems, rate limiting 
strategies, and the glorious pain of deprecating legacy systems. If you're 
tackling similar challenges, happy to chat about our approach.

Building resilient systems is hard work, but it's worth the effort.
```

---

## Example 2: Concise + Action-Oriented

```
Shipped the redesigned dashboard UI this week. 3K lines of React refactored, 
cut bundle size by 40%, and page load time dropped from 2.3s to 0.8s.

Used Vite for the build, Vitest for unit tests, and Playwright for E2E. 
The performance gains alone justified the effort.

Learned a lot about webpack config optimization and JavaScript bundler 
internals. Next: server-side caching.
```

---

## Example 3: Learning-Focused

```
Spent the last week diving deep into Rust. Built a CLI tool for parsing git logs, 
and wow — the language really forces you to think about memory safety.

Coming from JavaScript, the borrow checker felt annoying at first, but it's 
actually brilliant. Zero runtime panics because the compiler catches everything.

Next project: rewrite our performance-critical backend service in Rust. 
Excited to see what we can achieve with compiled-language performance.
```

---

## Example 4: Startup / Rapid Iteration

```
Launched beta v2 of our product today. 8 weeks from spec to launch, completely 
rebuilt backend API from Django to FastAPI.

Metrics look promising: 3x faster response times, 50% fewer database queries. 
Early users are loving the new UI.

Biggest lesson: shipping fast and iterating beats perfect-but-slow. Next sprint: 
user analytics and mobile app.
```

---

## Example 5: Collaboration-Focused

```
Led architecture decision for our new microservices platform. Spent two weeks 
with the team, evaluated gRPC vs REST, and designed our event streaming approach.

The collaboration was the best part. Pairing with backend, frontend, and DevOps 
folks forced us to think holistically about the system.

Decision: gRPC for internal services, REST for public APIs. Starting implementation 
next week. Excited to see it in production.
```

---

## Tips for Your Own Tone Profile

**Do:**
- Write naturally (like you're messaging a friend)
- Include specific technical details
- Talk about what you learned
- Share challenges and solutions
- Be authentic about effort and mistakes

**Don't:**
- Use jargon just to sound smart
- Copy resume language
- Generic startup clichés
- Humble-brag without substance
- Make it too long (200-500 words is ideal)

**Good tone profiles have:**
1. A specific project or accomplishment
2. Technical depth (what you actually did)
3. Human element (what you learned/felt)
4. Forward-looking statement (what's next)

---

**Questions?** Open an issue or check the [GitPost README](./README.md)
