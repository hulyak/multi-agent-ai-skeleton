# Example Queries for CrewOS Agents

This document provides example queries you can use to test the multi-agent system. Each example demonstrates different agent capabilities and workflows.

## Customer Support Agent (`/apps/support`)

The Support Agent handles customer inquiries by classifying intent, searching FAQs, generating responses, and providing citations.

### Password & Account Issues

**Query 1: Password Reset**
```
I forgot my password and can't log into my account. How do I reset it?
```
- **Intent**: `password_reset`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent → CitationAgent
- **Expected Response**: Instructions for password reset via account settings
- **Citations**: Help Doc #123, FAQ Database

**Query 2: Account Locked**
```
My account has been locked after multiple failed login attempts. What should I do?
```
- **Intent**: `account_access`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: Verification steps and support contact information
- **Citations**: Security FAQ, Account Help

**Query 3: Two-Factor Authentication**
```
I enabled 2FA but lost access to my authenticator app. How can I recover my account?
```
- **Intent**: `account_access`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → EscalationAgent
- **Expected Response**: Account recovery procedures with escalation option
- **Citations**: Security Guide, Recovery Procedures

### Billing & Payment Issues

**Query 4: Invoice Question**
```
I was charged twice this month. Can you help me understand the billing?
```
- **Intent**: `billing`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent → CitationAgent
- **Expected Response**: Billing dashboard instructions and dispute process
- **Citations**: Billing FAQ, Invoice Guide

**Query 5: Subscription Upgrade**
```
How do I upgrade my subscription plan? What are the differences between plans?
```
- **Intent**: `billing`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: Plan comparison and upgrade instructions
- **Citations**: Pricing Page, Subscription Guide

**Query 6: Payment Method Update**
```
I need to update my credit card on file. Where can I do that?
```
- **Intent**: `billing`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: Account settings navigation and payment update steps
- **Citations**: Account Settings Help, Payment FAQ

### Technical Issues

**Query 7: Application Error**
```
I'm getting a 500 error when trying to upload files. The error message says "Internal Server Error".
```
- **Intent**: `technical_issue`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent → EscalationAgent
- **Expected Response**: Troubleshooting steps and escalation to engineering
- **Citations**: Troubleshooting Guide, Known Issues

**Query 8: Performance Problem**
```
The application is running very slowly. It takes 30 seconds to load a page that usually loads in 2 seconds.
```
- **Intent**: `technical_issue`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: Performance troubleshooting and browser cache clearing
- **Citations**: Performance Guide, Browser Compatibility

**Query 9: Feature Not Working**
```
The export to PDF feature isn't working. I click the button but nothing happens.
```
- **Intent**: `technical_issue`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent → CitationAgent
- **Expected Response**: Feature troubleshooting and browser requirements
- **Citations**: Feature Documentation, Browser Requirements

### General Inquiries

**Query 10: Feature Request**
```
Is there a way to schedule reports to be sent automatically? This would save me a lot of time.
```
- **Intent**: `general_inquiry`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: Current capabilities and feature request submission
- **Citations**: Feature List, Feedback Form

**Query 11: Data Export**
```
How can I export all my data from the system? I want to keep a backup.
```
- **Intent**: `general_inquiry`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent → CitationAgent
- **Expected Response**: Data export options and formats available
- **Citations**: Data Management Guide, Export FAQ

**Query 12: API Access**
```
Do you provide an API for integrating with third-party tools?
```
- **Intent**: `general_inquiry`
- **Agents Involved**: IntentDetectionAgent → FAQAgent → ResponseAgent
- **Expected Response**: API availability and documentation links
- **Citations**: API Documentation, Integration Guide

## Research Agent (`/apps/research`)

The Research Agent handles document retrieval, summarization, and citation generation.

### Document Retrieval

**Query 1: Find Papers on Machine Learning**
```
I need to find recent papers on machine learning applications in healthcare.
```
- **Agents Involved**: RetrievalAgent → SummarizationAgent → CitationAgent
- **Expected Response**: List of relevant papers with abstracts
- **Citations**: Paper titles, authors, publication dates

**Query 2: Literature Review**
```
What are the latest developments in natural language processing?
```
- **Agents Involved**: RetrievalAgent → SummarizationAgent
- **Expected Response**: Summary of recent NLP research trends
- **Citations**: Key papers, research groups

**Query 3: Specific Topic Search**
```
Find all papers about transformer architectures published in the last 2 years.
```
- **Agents Involved**: RetrievalAgent → CitationAgent
- **Expected Response**: Filtered list of transformer papers with citations
- **Citations**: Paper metadata, publication venues

### Summarization

**Query 4: Paper Summary**
```
Can you summarize the key findings from the BERT paper?
```
- **Agents Involved**: RetrievalAgent → SummarizationAgent
- **Expected Response**: Concise summary of BERT's contributions
- **Citations**: Original paper, related work

**Query 5: Comparative Analysis**
```
Compare the approaches used in GPT-3 and GPT-4 papers.
```
- **Agents Involved**: RetrievalAgent → SummarizationAgent
- **Expected Response**: Side-by-side comparison of methodologies
- **Citations**: Both papers, technical details

**Query 6: Methodology Extraction**
```
What methodology did the authors use in their experiments?
```
- **Agents Involved**: RetrievalAgent → SummarizationAgent
- **Expected Response**: Detailed methodology section summary
- **Citations**: Methods section, supplementary materials

### Citation Generation

**Query 7: Generate Bibliography**
```
Create a bibliography for papers on deep learning optimization.
```
- **Agents Involved**: RetrievalAgent → CitationAgent
- **Expected Response**: Formatted bibliography in multiple citation styles
- **Citations**: APA, MLA, Chicago, BibTeX formats

**Query 8: Citation Format**
```
I need these papers in APA format for my thesis.
```
- **Agents Involved**: RetrievalAgent → CitationAgent
- **Expected Response**: Properly formatted APA citations
- **Citations**: All retrieved papers in APA style

**Query 9: Cross-Reference**
```
Which papers cite the original transformer paper?
```
- **Agents Involved**: RetrievalAgent → CitationAgent
- **Expected Response**: List of papers that reference the transformer
- **Citations**: Citation network, impact metrics

## Multi-Agent Coordination Examples

### Complex Workflow 1: Support Escalation
```
I've been trying to fix this error for 3 days and nothing works. I need immediate help!
```
- **Workflow**: IntentDetectionAgent → FAQAgent → (no match) → EscalationAgent
- **Result**: Escalated to human support with full context
- **Agents**: 4 agents involved in coordination

### Complex Workflow 2: Research Synthesis
```
Summarize the state of the art in computer vision and provide citations for a literature review.
```
- **Workflow**: RetrievalAgent → SummarizationAgent → CitationAgent
- **Result**: Comprehensive summary with formatted bibliography
- **Agents**: 3 agents working in sequence

### Complex Workflow 3: Multi-Intent Query
```
I'm having trouble with my account and I need to update my billing information. Also, can you explain the new features?
```
- **Workflow**: IntentDetectionAgent (multiple intents) → FAQAgent (parallel) → ResponseAgent (parallel)
- **Result**: Responses for all three intents with relevant citations
- **Agents**: 3+ agents working in parallel

## Testing Tips

1. **Try variations**: Use different phrasings for the same intent to test robustness
2. **Test edge cases**: Try ambiguous queries that could match multiple intents
3. **Check confidence**: Notice how confidence scores vary with query clarity
4. **Monitor citations**: Verify that citations are relevant to the response
5. **Test escalation**: Try queries that should trigger escalation to human support

## Agent Intent Classification

The system recognizes these intents:

| Intent | Keywords | Agent |
|--------|----------|-------|
| `password_reset` | password, reset, forgot, locked | IntentDetectionAgent |
| `account_access` | account, login, access, 2FA | IntentDetectionAgent |
| `billing` | billing, payment, invoice, subscription | IntentDetectionAgent |
| `technical_issue` | error, bug, crash, not working | IntentDetectionAgent |
| `general_inquiry` | question, help, how, feature | IntentDetectionAgent |

## CORBA Agent Methods

Each agent exposes these CORBA methods:

### Support Agents
- `IntentDetectionAgent::classifyIntent(query: string): Intent`
- `FAQAgent::searchFAQ(intent: Intent): FAQResult[]`
- `ResponseAgent::generateResponse(intent: Intent, faqResults: FAQResult[]): string`
- `CitationAgent::addCitations(response: string): Citation[]`
- `EscalationAgent::escalateTicket(query: string, context: Context): Ticket`

### Research Agents
- `RetrievalAgent::retrieveDocuments(query: string): Document[]`
- `SummarizationAgent::summarizeDocument(document: Document): Summary`
- `CitationAgent::generateCitation(document: Document, format: string): string`

## Performance Metrics

Expected response times:
- **Intent Classification**: 100-200ms
- **FAQ Search**: 200-500ms
- **Response Generation**: 300-800ms
- **Citation Generation**: 100-300ms
- **Total Support Query**: 1-2 seconds
- **Document Retrieval**: 500ms-2s
- **Summarization**: 1-3 seconds
- **Citation Formatting**: 200-500ms

## Troubleshooting

If queries aren't working as expected:

1. **Check intent detection**: Verify the detected intent matches your query
2. **Review confidence scores**: Low confidence may indicate ambiguous queries
3. **Check citations**: Ensure citations are being generated
4. **Monitor agent logs**: Check the CORBA ORB terminal for agent invocations
5. **Test with examples**: Start with the provided examples before custom queries
