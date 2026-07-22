# Lisa — voice assistant setup

**Agent:** `agent_2801ky5xj2xxehc830ew80m20xc1`
**Voice:** Charlotte — Warm, Clear, Modern, Distinctive (`6fZce9LFNG3iEITDfqZZ`)

The system prompt and first message are already set via the API. What remains
has to be done in the ElevenLabs dashboard, because the tools API is not
exposed through the MCP connector.

## Personality

Lisa has a deliberate personality: the sharp, unflappable office veteran with
dry, understated warmth. It is written into the "Who you are" section of her
prompt, and temperature is set to 0.45 (up from a flat 0.3) to give it room.

The rules that keep it tasteful are load-bearing, not decoration:

- The answer always comes first; warmth lives only in greetings and sign-offs.
- Never a joke at the customer's or the operator's expense.
- Plumbing invites the crude joke — she is explicitly forbidden from taking it.
- When news is bad (missing price, failed lookup, upset customer) she drops the
  wit entirely and is simply plain and helpful.
- Personality never bends a grounding rule. "A charming wrong number is still a
  wrong number."

If you ever re-push her prompt (e.g. after an SOP change), preserve the "Who
you are" section — a bare re-push would flatten her back into a script.

## How this is wired

```
Operator clicks "Start"
  → /api/admin/assistant/voice-session  (server signs a URL with ELEVENLABS_API_KEY)
  → browser opens the session with ElevenLabs
  → Lisa decides to call a tool
  → the browser executes it, carrying the admin session cookie
  → POST /api/admin/assistant/tool  { tool, args }
  → same implementations the text assistant uses (lib/assistant/tools.ts)
```

Two properties worth preserving:

**Tools run in the browser, not on ElevenLabs' servers.** They travel with the
operator's existing session cookie, so Lisa can only ever reach what the
signed-in operator could already open. No new public endpoint, no shared
secret, no widened auth surface.

**One set of implementations.** The text assistant and Lisa call the same
functions. Defining her tools separately would guarantee drift — the honesty
rules (an unpriced service must never read as $0, never guess a customer
identity) would end up enforced on one path and quietly not the other.

## Step 1 — Add the six client tools ✅ DONE

Registered on the agent 2026-07-22 via the ElevenLabs REST API
(`PATCH /v1/convai/agents/{id}`, `conversation_config.agent.prompt.tools`),
not the dashboard. All six are `client` type alongside the two system tools
(end_call, language_detection).

To re-check or edit them: dashboard → Lisa → Tools, or re-fetch the agent
config. The inline client-tool shape the API expects is:

```json
{
  "type": "client",
  "name": "searchPricebook",
  "description": "...",
  "response_timeout_secs": 20,
  "parameters": { "type": "object", "properties": { "query": {"type":"string"} }, "required": ["query"] }
}
```

Note `parameters` must be a JSON Schema **object**, not an array — the API
rejects an array with "should be a valid dictionary or ObjectJsonSchemaProperty".

Names and parameter names must match `lib/assistant/tools.ts` exactly; the
browser bridge in `useVoiceAssistant.ts` dispatches on them. For reference, the
six and their parameters:

### 1. `searchPricebook`
> Search the company pricebook for a plumbing service to get its price, estimated labor hours, and scope of work. Use for ANY pricing, duration, or "what's involved" question.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | yes | Service to search, e.g. "water heater", "main line stoppage", or a code like "H6110" |

### 2. `findCustomer`
> Find a customer by name, phone, email, or address. Returns matches so you can confirm which one before pulling full context.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | yes | Name, phone, email, or address to search for |

### 3. `getCustomerContext`
> Get full context on one customer by id: profile, recent jobs, invoice history, and lifetime stats. Call findCustomer first to get the id.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customerId` | number | yes | The customer id returned by findCustomer |

### 4. `getJobContext`
> Get details on a specific job by its id: service, current status, schedule, assigned crew, amounts, address, and the customer.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `jobId` | number | yes | The job number the operator refers to |

### 5. `getJobMaterials`
> List the parts and materials a pricebook service typically needs, by service code. Use after searchPricebook to answer "what parts does this job need".

| Parameter | Type | Required | Description |
|---|---|---|---|
| `serviceCode` | string | yes | Pricebook service code, e.g. "H6110" |

### 6. `businessKpis`
> Get top-line business numbers: revenue this month, last 12 months and lifetime, unpaid balance, customer count, jobs this week, and jobs ready to invoice.

No parameters.

## Step 2 — Set `ELEVENLABS_API_KEY`

Add it in Vercel (all environments) and to `.env.local` for local testing.
Without it `/api/admin/assistant/voice-session` returns 503 and the Start
button shows "Voice is not configured yet" — the text assistant keeps working
either way.

Optional: `ELEVENLABS_AGENT_ID` overrides the hard-coded agent id, useful if a
separate staging agent is ever wanted.

## Step 3 — Allowed origins

Dashboard → Lisa → Security/Advanced → add:

- `https://www.zandzplumbing.com`
- your localhost dev origin while testing

## Testing it

1. Open `/admin/assistant`, click **Start**, allow the microphone.
2. "What's the price on a fifty gallon gas water heater?" — she should name
   code H6120 and quote $2,052.55 or whatever the pricebook holds.
3. "What about replacing a flapper?" — that one has **no price loaded**. She
   must say it is in the pricebook without a price and to check with Jay. If
   she says free, zero, or no charge, the grounding is broken.
4. Ask about a customer with a common first name — she should list the matches
   and ask which one rather than picking.
5. Talk over her mid-sentence. She should stop and listen.

## Known limits

- **Read-only.** Lisa cannot create, edit, send, or delete. Decided
  deliberately: speech recognition mishears numbers and addresses often enough
  that a misheard job number silently marking the wrong job complete is a real
  risk. Revisit with a spoken confirmation step.
- **Her prompt is static.** The text assistant injects live company knowledge
  docs into its system prompt each request; ElevenLabs holds one fixed prompt,
  so knowledge-base edits do not reach her automatically. Re-run the prompt
  update when the SOP changes materially.
- **Cost is not tracked yet.** Conversation minutes bill against the ElevenLabs
  account with no visibility in the OS. That is the API-cost panel (task B3),
  still unbuilt.
- **Billing sits on Asala's ElevenLabs account** (Creator tier). Fine for an
  internal tool; move it to Z and Z before the customer-facing phone
  receptionist ships.
