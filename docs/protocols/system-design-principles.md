# System Best Practices for AI-Assisted Engineering (Codex, Claude, etc.)

This document is a set of *system-level* best practices for building and operating AI-assisted workflows and AI-augmented software systems. It intentionally *enforces* classic engineering philosophies:

- UNIX philosophy: do one thing well; compose small tools; text in/out.
- KISS: simplest thing that could possibly work.
- SOLID: maintainable boundaries and dependency discipline.
- Stateless / FP bias: minimize hidden state; prefer pure functions; explicit inputs/outputs.
- Convention over configuration: reduce knobs; standardize defaults; keep the “golden path” obvious.

The goal: make your AI layer boring, predictable, testable, and easy to evolve.

---

## 1) The Prime Directive

**The AI is not your architecture. The AI is a component.**

If your system only works when “the model feels like it,” you don’t have a system—you have a vibe. The job is to constrain the vibe into deterministic interfaces.

Operationally: every AI interaction must be wrapped in a contract that you can validate, test, observe, and roll back.

---

## 2) Principles, Rewritten as Enforceable Rules

### 2.1 UNIX: “Small tools, sharp edges, clean seams”
Rule set:
1. Each AI capability is a *single-purpose tool* (e.g., “summarize PR”, “extract API spec”, “generate migration plan”).
2. Tools communicate via **typed, versioned payloads** (JSON schemas, protobufs, or strict dataclasses).
3. Inputs/outputs are **text-first and serializable**. Logs are artifacts, not side-effects.
4. Composition happens in an orchestrator, not inside a mega-prompt.

If you can’t explain the AI module in one sentence (“It converts X into Y with constraints Z”), it’s too big.

### 2.2 KISS: “Fewer moving parts beats cleverness”
Rule set:
1. Default to **one model + one prompt template + one output schema** per tool.
2. Introduce retrieval, tool-calls, multi-agent, or planning only when the simplest approach fails repeatedly under real load.
3. Prefer **boring pipelines** over “agentic autonomy.”

KISS test: if a new engineer can’t modify the behavior in 30 minutes, it’s not simple enough.

### 2.3 SOLID: “Maintainable boundaries for a probabilistic component”
Mapping SOLID into AI systems:

- Single Responsibility: one tool = one job = one schema.
- Open/Closed: extend by adding new tools or new prompt versions, not editing everything.
- Liskov: tool outputs must satisfy the published schema invariants (no “almost JSON”).
- Interface Segregation: don’t make one giant “do everything” tool; create small interfaces.
- Dependency Inversion: business logic depends on **an AI interface** (ports), not a specific vendor/model (adapters).

### 2.4 Stateless / FP: “Make the invisible visible”
Rule set:
1. Every AI call is a pure-ish function: `output = f(input, context, policy)`.
2. Context is explicit: no hidden global memory, no implicit “it remembers.”
3. Determinism is approached via constraints: schemas, validators, idempotency keys, and replay.

State is allowed, but it must be:
- explicit,
- versioned,
- auditable,
- replayable.

### 2.5 Convention Over Configuration: “Golden path or it didn’t happen”
Rule set:
1. Provide a default scaffold that 80% of use cases should use.
2. Config knobs require justification, owner, and tests.
3. Conventions must be documented and enforced by CI/linting.

If everyone configures their own prompt formatting, you’ve reinvented snowflakes.

---

## 3) Reference Architecture (Battle-Tested Pattern)

### 3.1 The “Tool + Orchestrator + Policy” triangle
- Tool: a single AI capability (prompt + schema + validators).
- Orchestrator: routes requests, handles retries/fallbacks, composes tools.
- Policy: governs safety, permissions, cost limits, data access, and logging.

Never bury policy inside prompts. Prompts are behavior; policy is governance.

### 3.2 A canonical request flow
1. Normalize input (sanitize, redact, classify sensitivity).
2. Build explicit context bundle (documents, code refs, metadata).
3. Invoke tool with strict schema requirements.
4. Validate output (schema + semantic checks).
5. Apply post-processing (format, patch, diff).
6. Persist artifacts (request, context hash, tool version, output, validation status).
7. Return result + references + trace id.

“Trace id or it didn’t happen.”

---

## 4) Prompting as Engineering, Not Poetry

### 4.1 Prompt versioning is mandatory
Treat prompts like code:
- semantic versioning (v1.2.0),
- changelog,
- tests,
- rollback.

### 4.2 Separate: instructions vs. data vs. policy
A stable structure:
- System constraints: role, style, schema rules.
- Task instructions: what to do.
- Data payload: the content to process.
- Output contract: exact format + examples + edge cases.

Do not mingle raw data with instructions. It confuses both models and humans.

### 4.3 Output must be machine-checkable
Hard rule: AI output must be either:
- valid JSON matching schema, or
- a diff/patch format, or
- a strictly delimited artifact format.

Human-friendly prose can be included, but only in a dedicated field like `"notes"`.

---

## 5) Context Management: Precision Beats Volume

### 5.1 The “context budget” mindset
Every extra token is:
- latency,
- cost,
- and more surface area for model confusion.

Prefer:
- curated summaries,
- ranked retrieval,
- structured facts,
- and references to artifacts.

### 5.2 Retrieval/RAG rules that keep it sane
1. Retrieve only what you can cite or reference.
2. Cap per-call context and enforce truncation policies.
3. Store compact intermediate artifacts (summaries, extracted API surface, dependency graphs).
4. Always include provenance: doc id, commit sha, line ranges, timestamps.

If the model can’t point to where it learned something, treat it as untrusted.

---

## 6) Reliability: Make Probabilistic Systems Operable

### 6.1 Defensive design patterns
- Validation gate: schema validation + domain checks (e.g., “no missing endpoints”).
- Retry policy: only for *transient* failures; avoid blind retries.
- Fallback policy: smaller model, alternate prompt version, or rule-based baseline.
- Idempotency: safe replays with the same context hash and tool version.

### 6.2 “Trust, but verify” automation
Every AI tool should have:
- golden test fixtures,
- regression tests on tricky inputs,
- canary rollout for prompt/model updates,
- quality metrics (precision/recall where measurable).

If you can’t test it, you can’t ship it.

---

## 7) Observability: You Need a Debuggable Story

Minimum telemetry per AI call:
- tool name + version
- model identifier
- input hash + context hash
- latency
- token usage + cost estimate
- validation success/failure + reason
- output size + structured quality metrics
- trace id spanning orchestrator → tool → downstream actions

Keep full raw inputs in a secure store when allowed; otherwise store redacted representations and deterministic hashes.

---

## 8) Security and Data Governance: Least Privilege by Default

Rules:
1. “Need-to-know context”: the tool only receives the data it must process.
2. Redaction and classification are pre-steps, not afterthoughts.
3. Secrets never enter prompts. Use secret managers and tool APIs.
4. Permissions are attached to requests and enforced by the orchestrator.
5. Log policies are explicit (what is stored, where, for how long).

If your AI can see production secrets “because it’s convenient,” you’ve already lost.

---

## 9) Cost and Performance: Treat Tokens as a Resource

Conventions:
- budgets per tool per request class
- hard caps: max tokens in/out
- caching: context hash → output for idempotent tools
- progressive enhancement: try cheap baseline first; escalate only if necessary

A good system is cost-aware without being fragile.

---

## 10) Anti-Patterns (Things That Will Hurt You)

1. The Mega-Agent: one prompt that tries to do everything.
2. Implicit memory: “it knows our system already.”
3. Configuration explosion: every team has their own prompt dialect.
4. No schema: outputs are “mostly structured.”
5. No provenance: results with no references become institutional hallucinations.
6. Side-effecting AI: model directly executes changes without a reviewable plan/diff.
7. Silent failures: invalid outputs are accepted “because it looks okay.”

---

## 11) Practical Conventions (Recommended Defaults)

Adopt these conventions across the org:

Tool naming:
- `ai.summarize_pr.v1`
- `ai.extract_api_surface.v2`
- `ai.generate_openapi_patch.v1`
- `ai.review_security_risks.v3`

Payload conventions:
- `request_id`, `trace_id`
- `tool_version`, `model_id`
- `input_artifact_refs[]` (doc/commit/line ranges)
- `constraints` (explicit rules)
- `output_schema_version`

Output conventions:
- Always include:
  - `result` (machine-usable)
  - `notes` (human explanation)
  - `provenance[]` (what was used)
  - `confidence` (calibrated bucket, not a fake probability)

Review convention:
- If it changes code/config, output must be a diff/patch or a structured plan with steps and verification commands.

---

## 12) A “Definition of Done” for an AI Tool

An AI tool is shippable only when:
- it has a single responsibility and stable contract
- outputs validate against a schema
- failures are observable and actionable
- it has regression tests and golden fixtures
- it supports rollback (prompt/model versioning)
- it respects data classification and least privilege
- it is cost-bounded and has sensible defaults
- it produces provenance and artifacts suitable for audit/replay

---

## 13) Final Mental Model

Build AI systems like you build distributed systems:
- assume partial failure,
- constrain interfaces,
- observe everything,
- make changes reversible,
- prefer composition,
- and keep the golden path frictionless.

If you do this right, your AI layer becomes an engine that is fast, boring, and dependable—which is exactly what you want.
