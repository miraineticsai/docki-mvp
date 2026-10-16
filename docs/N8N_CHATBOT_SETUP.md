# Aura Clinic AI Chatbot — n8n Setup & Integration Guide

This guide explains how to set up, configure, and activate the n8n AI workflow that powers the floating clinic chat widget on Dr. Rajesh Kulkarni's website.

---

## 1. Architectural Overview

```
┌──────────────────────┐          POST /api/chat           ┌────────────────────────┐
│  Patient's Browser   │ ────────────────────────────────> │   Next.js API Route    │
│  (ChatWidget UI)     │                                   │   (Server-Side Only)   │
│                      │ <──────────────────────────────── │                        │
└──────────────────────┘         { "reply": "..." }        └───────────┬────────────┘
                                                                       │
                                             POST N8N_WEBHOOK_URL      │
                                   { "message": "...", "sessionId": "" }
                                                                       ▼
                                                           ┌────────────────────────┐
                                                           │      n8n Workflow      │
                                                           │  1. Webhook (POST)     │
                                                           │  2. AI Agent + Memory  │
                                                           │  3. Respond to Webhook │
                                                           └────────────────────────┘
```

### Security & Privacy Protections
1. **Zero Client-Side Exposure**: `N8N_WEBHOOK_URL` is kept strictly on the Next.js server (`.env.local`). It is never bundled into frontend JavaScript or prefixed with `NEXT_PUBLIC_`.
2. **Server-Side Validation**: Messages are validated via Zod (`1 - 1,000` characters, valid `sessionId`).
3. **In-Memory Rate Limiting**: The API route throttles requests to a maximum of 20 requests/minute per client IP to safeguard your n8n instance and LLM token budgets.
4. **Timeouts & Safe Errors**: Server requests to n8n enforce a strict 15-second `AbortController` timeout. Webhook URLs, ports, and internal errors are never leaked to the client.
5. **Session Isolation**: Each browser session receives an isolated `sessionId` used for LLM memory recall.

---

## 2. n8n Workflow Construction (Step-by-Step)

Follow these steps in your n8n workspace to build the workflow.

### Step 1: Webhook Node
1. Click **+** to add a node and search for **Webhook**.
2. Configure settings:
   - **HTTP Method**: `POST`
   - **Path**: `clinic-chat`
   - **Authentication**: None (or Header Auth matching an optional secret)
   - **Respond**: **Using 'Respond to Webhook' Node** *(Crucial: do not select "Immediately")*
3. Note the two webhook URLs shown in n8n:
   - **Test URL**: `https://your-n8n.com/webhook-test/clinic-chat`
   - **Production URL**: `https://your-n8n.com/webhook/clinic-chat`

### Step 2: AI Agent Node
1. Connect the Webhook node to an **AI Agent** node (or an **OpenAI** / **LangChain Chain** node).
2. Configure the input:
   - **Prompt / User Message**: `{{ $json.body.message }}`
   - **Session Key / ID**: `{{ $json.body.sessionId }}`

### Step 3: Connect Model & Memory
1. Attach an **AI Model** sub-node:
   - Recommended: **OpenAI Chat Model** (`gpt-4o-mini`), **Anthropic Chat Model** (`claude-3-5-haiku`), or **Google Gemini Chat Model** (`gemini-1.5-flash`).
2. Attach a **Window Buffer Memory** sub-node:
   - **Session Key**: `{{ $('Webhook').item.json.body.sessionId }}`
   - **Context Window Length**: 10 messages (preserves conversation context across messages).

### Step 4: System Prompt with Clinic Knowledge & Medical Guardrails
Paste the following prompt into the AI Agent's **System Message** field:

```text
You are the virtual assistant for Dr. Rajesh Kulkarni's medical practice in Pune, Maharashtra.
Your role is to assist patients with clinic timings, hospital consultation hours, doctor credentials, services, location, and appointment booking instructions.

CLINIC INFORMATION:
- Doctor: Dr. Rajesh Kulkarni (MBBS, Consultant Physician, 12+ years clinical experience).
- Private OPD: Aura Health Clinic, Katraj-Kondhwa Road, Pune, Maharashtra.
  - Private Clinic OPD Hours: Monday to Saturday, 5:00 PM – 9:00 PM. Sunday Closed.
- Hospital Affiliation: Bharati Vidyapeeth Medical College & Hospital, Dhankawadi, Pune.
  - Hospital OPD Hours: Monday to Saturday, 9:00 AM – 1:00 PM.
- Contact Number: +91 98220 12345.
- Services: General Medicine Consultation, Chronic Disease Care (Diabetes, Hypertension), Preventive Health Checkups, Geriatric Care, Lifestyle Management.
- Consultation Fee: ₹500 for standard outpatient consultations.
- Appointment Booking: Inform patients they can reserve their appointment directly on this website using the "Book Appointment" form.

CRITICAL MEDICAL GUARDRAILS (STRICT COMPLIANCE):
1. NEVER diagnose illnesses, conditions, or symptoms.
2. NEVER prescribe medications, alter dosages, or suggest specific pharmaceuticals.
3. NEVER provide definitive medical opinions or emergency triage.
4. If a patient describes acute emergency symptoms (severe chest pain, shortness of breath, sudden numbness, uncontrolled bleeding, severe trauma):
   Immediately urge them to seek in-person emergency care at the nearest hospital emergency room (e.g. Bharati Hospital 24x7 Emergency / Casualty) or call 108/112.
5. Keep answers courteous, concise, helpful, and in warm Indian professional English (or Hindi/Marathi if the patient speaks in those languages).
```

### Step 5: Respond to Webhook Node
1. Add a **Respond to Webhook** node connected to the AI Agent's output.
2. Configure settings:
   - **Respond With**: `JSON`
   - **Response Body**:
   ```json
   {
     "reply": "={{ $json.output }}"
   }
   ```
   *(Note: The Next.js API expects a JSON response containing `{ "reply": "..." }`)*

---

## 3. Testing vs Production Activation

### Testing with Test URL:
1. In n8n, click **"Test step"** or **"Listen for test event"**.
2. In `.env.local`, set:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook-test/clinic-chat
   ```
3. Open the clinic website in your browser, open the floating chat widget at the bottom right, and send a message.
4. Verify the execution data in n8n.

### Activating for Production:
1. In n8n, toggle the workflow switch to **Active** (green toggle at top right).
2. In `.env.local` (and your production hosting environment, e.g., Vercel), update to the production URL:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/clinic-chat
   ```
3. Restart your Next.js server (`pnpm dev` or redeploy).

---

## 4. Environment Variables Reference

Add the following to your `.env.local`:

```env
# n8n AI Chatbot Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/clinic-chat
```

*Note: If `N8N_WEBHOOK_URL` is omitted or left as a placeholder during local development, `/api/chat` returns a helpful clinic information fallback message rather than crashing or returning an error.*

---

## 5. Frontend Features Included

- **Floating Trigger Button**: Smooth animation, unread indicator badge, and live pulsing online dot.
- **Persistent Session ID**: Session IDs are generated with `crypto.randomUUID()` and preserved across panel minimizes and page browsing via `sessionStorage`.
- **New Conversation Button**: A dedicated reset button in the chat header generates a fresh `sessionId` and clears previous messages.
- **Quick Suggestion Pills**: Frequently asked clinic questions ("Clinic OPD hours", "Hospital schedule", "Services & fees") appear for quick 1-click queries.
- **Duplicate Prevention**: Input and submit buttons are locked while an AI query is in flight.
- **Accessible & Responsive**: Fully responsive modal for mobile and desktop screens with Enter-to-send support.
