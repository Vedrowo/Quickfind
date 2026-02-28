**Team Charter**

QuickFind

[https://github.com/Vedrowo/Quickfind](https://github.com/Vedrowo/Quickfind)

## **Team Driver**

 Luka Jack Komljen \- Project Manager

## **Team Members**

Luka Jack Komljen 								Student no: 89231379

◦        Technical Leadership

◦        System Architecture

◦        AI/LLM Integration

Vedran Gvozderac 								Student no: 89231031

◦        Backend Development

◦        Database & Vector Storage

◦        API Design

Aleksandra Zečević 							Student no: 89231025

◦        Frontend Development

◦        User Interface Design

◦       Documentation & Testing

# **Project Charter \- Project Document with Justification**

**Project Code:** UP\_QF

**Project Name:** QuickFind

**Client:** Government Institution / Public Administration Body / Private Users 

**Document Version:** 1.0

Date of changes: 27.02.2026.

## **The Importance Of The Project For The Organization And Its Environment**

Public institutions often rely on legacy data systems based on Excel spreadsheets, PDF and Word  documents. These systems lack semantic search capabilities and require manual browsing and keyword searches in a file system to retrieve information. This results in inefficiency, increased workload, and potential decision-making delays.

Employees with a weaker technical background or lack of familiarity with a certain file structure often struggle to extract relevant information from large, fragmented datasets. Modern database migration is costly and time-consuming. Therefore, there is a need for a solution that improves accessibility without restructuring the existing infrastructure.

The proposed system introduces an AI-powered assistant capable of understanding natural language queries and retrieving relevant information from existing documents using vector-based semantic search and large language models.

This project contributes to: increased operational efficiency, reduced manual search effort, improved accessibility of institutional data and introduction of modern AI technologies into public and private sector workflows

## **The Purpose And The Objectives Of The Project**

The purpose of the project is to develop a web-based (with a CLI option) intelligent assistant prototype that enables natural language querying of file systems containing Excel, Word and PDF documents.

The objectives are:

* Enable uploading and processing of documents.  
* Implement embedding and vector-based retrieval mechanisms.  
* Integrate a Retrieval-Augmented Generation (RAG) pipeline.  
* Provide cited responses referencing original data sources.  
* Deliver a usable web interface for non-technical users.  
* Provide documentation and demonstration of the system.

## **Possible Requirements Of The Contracting Authority (Options):**

### Description Of The Methodology

Agile development approach with iterative two-week sprints.  
Each sprint delivers incremental functionality and internal testing.

### Techniques And Technologies Used

Backend development (Express.js)  
Web framework (Node.js)  
Vector database (FAISS, ChromaDB)  
Large Language Model API integration (OpenAPI, AgentsSDK)  
Embedding models for semantic search (OpenAI API or self-hosted Ollama)  
Frontend (React)  
Version control (Git, Github)  
Local or cloud-based deployment (Vercel)

### Other Rules Of The Organization

Clear communication among team members  
Code review before merging  
Version control with documented commits  
Documentation maintained in repository

### Description Of The Finished Product, Service Or Result

The finished product will be a web-based but application that allows:

* Uploading Excel PDF and Word documents  
* Automatic parsing and processing  
* Natural language querying  
* Retrieval of relevant document segments  
* AI-generated responses with references to source files  
* Basic authentication (user roles)  
* System logging

### Reporting And Final Report

Weekly internal progress reports, Bi-weekly sprint review  
Final report including:

* Architecture description  
* Implementation overview  
* Testing results  
* User guide

## **Project Limitations:**

### Available Funds

* LLM API usage: €300  
* Cloud hosting: €200  
* Development tools: €0 (student licenses)

Total estimated cost: €500

### Phases Of Project Implementation

Phase 1 – System design  
Phase 2 – Data ingestion and vector indexing  
Phase 3 – Query engine and RAG integration  
Phase 4 – UI, testing, and documentation

### Milestones \- Dates Required

23.02.2026 – Project Charter submission  
15.03.2026 – Architecture design completed  
10.04.2026 – Data ingestion module completed  
05.05.2026 – RAG integration completed  
20.05.2026 – System testing and bug fixing  
25.05.2026 – Final MVP delivery

## **Risk Assessment**

Technical Risks:

* LLM non-deterministic behavior  
* Inefficient model context management  
* Vector database integration issues

Operational Risks:

* Limited experience with AI frameworks  
* Academic workload overlap  
* API cost overruns

Mitigation:

* Early prototyping  
* Controlled scope  
* Continuous testing

## **Date Of Order**

20.02.2026

## **Client And Signature**

Client Representative: Univerza na Primorksem (FAMNIT, ESN)  
Signature: 

 

# **Personas and Problem Scenarios**

## **Nina** the New ESN Primorska volunteer

### Screening Questions

* Are you a new or first-year volunteer at ESN Primorska?  
* Have you ever organized or helped organize an event?

Nina is 21 years old and recently joined ESN Primorska as a volunteer. She is motivated, social, and wants to contribute actively. She studies at FAMNIT and balances university work with volunteering. She uses Google Drive regularly, but she is not very familiar with the internal folder structure of ESN. When she opens the Drive, she sees many folders from past years: events, budgets, agreements, photos, reports, and sponsor documents. Nina wants to organize a “Sip & Paint” event at UP FM. She knows the event was organized before, but she does not know:

* How much money was spent  
* Where the paint was bought  
* Which drinks were offered  
* If there were sponsor deals  
* How the classroom was reserved

She feels uncomfortable constantly asking older members or writing in group chats. She wants to be independent and efficient.

| Thinks | “There must be a file somewhere with this information.” “I don’t want to bother others with basic questions.” “I hope I don’t miss something important.” |
| :---- | :---- |
| **Sees** | Many folders and subfolders in Google Drive Different naming styles from different years Budgets in Excel, reports in PDF, scanned receipts and random notes in Word |
| **Feels** | Confused when searching through files Slightly stressed before deadlines Insecure about missing important details |
| **Does** | Searches manually through Drive folders Uses keyword search (which often gives too many results) Asks older members in WhatsApp groups Waits for someone to send her the right file |

| Problem Scenarios | Current Alternatives | Your Value Proposition |
| ----- | ----- | ----- |
| Nina cannot find the old budget for “Sip & Paint” | Manual folder browsing or asking alumni. | The AI assistant retrieves the budget from past events in seconds. |
| She does not know which supplier provided paint or drinks. | Searching through old reports or group chats. | Assistant summarizes supplier info from past documents. |
| She does not know how to reserve a classroom at UP FM. | Asking other members or checking old emails. | The assistant explains the reservation process based on stored documents. |
| She is unsure about sponsor deals for similar events. | Checking multiple Excel sheets manually. | Assistant finds and summarizes previous sponsorship agreements. |

## **Marko** the Municipal Administration Clerk

### Screening Questions

* Do you work in a public institution that uses Excel, Word, or PDF archives?  
* Do you often search through old documents to answer citizen or internal requests?

Marko is 38 years old and works as an administrative clerk in a municipal office. His department handles procurement records, public tenders, and internal reports.

The office has 15+ years of archived documentation stored in shared drives. Most files are:

* Excel sheets (budgets, cost breakdowns)  
* PDF contracts  
* Word reports  
* Scanned documents

Marko receives daily email requests from colleagues and citizens asking for:

* Past contract details  
* Budget allocations  
* Supplier information  
* Dates of previous public calls

He knows the information exists — but finding it takes time.

| Thinks | “There should be a faster way to find this.” “I know we signed a contract like this before.” “I can’t spend 40 minutes searching for one number.” |
| :---- | :---- |
| **Sees** | Shared drive with inconsistent naming conventions Folders like “Final\_v3\_NEW\_revised\_FINAL2” Old scanned PDFs without clear titles |
| **Feels** | Frustrated when search returns irrelevant results Overwhelmed by document volume Pressured when citizens are waiting |
| **Does** | Uses Ctrl+F inside multiple PDFs Searches by keywords (which often miss context) Opens many files before finding the right one Asks older colleagues for guidance |

| Problem Scenarios | Current Alternatives | Your Value Proposition |
| ----- | ----- | ----- |
| Marko needs the value of a 2021 procurement contract. | Manual folder search and reading PDFs. | The AI assistant retrieves the exact contract and highlights the value instantly. |
| He needs to compare budget allocation between two years. | Opening multiple Excel files and manually comparing. | The assistant summarizes differences across years. |
| A citizen asks about a supplier used in past projects. | Searching contract archives manually. | The assistant finds all documents mentioning that supplier and provides a summary with references. |
| He needs information from scanned PDFs. | Manual reading of scanned files. | Assistant processes and retrieves relevant sections using semantic search |

## **Sara** the Private-Sector Analyst

### Screening Questions

* Do you work in a company that stores reports, invoices, or internal documentation in shared folders?  
    
* Do you often need to extract information from older documents for analysis or decision-making?

Sara is 29 years old and works as a junior business analyst in a medium-sized marketing agency. Her responsibilities include preparing monthly performance reports, summarizing campaign outcomes, reviewing invoices, and checking contract details when preparing proposals for new clients.

The marketing agency stores all internal documentation on a shared company drive. Over the years, different teams uploaded documents with inconsistent naming styles, across folders like "Campaigns," "Clients," "Invoices," "Performance Reports," "Archive," and "Old 2020+2021 Data." The structure is messy, and files include PDFs, Excel sheets, Word documents, and scanned attachments.

When preparing a report for a new client pitch, Sara often needs to know:

* How much was spent on previous campaigns of similar type  
* Which suppliers were used (photographers, venues, designers)  
* What KPIs were reached in past projects  
* Whether there were issues or complaints related to similar client categories  
* The timeline and cost structure of older campaigns


She wants to perform her job efficiently but often loses time navigating archives.

| Thinks | "I know this information exists, but I don't know where." "If I miss something important, the report won't be complete." "Why is every team naming files differently?" |
| :---- | :---- |
| **Sees** | Dozens of folders with old and new naming conventions Reports stored in both PDF and Word Excel sheets with inconsistent column names |
| **Feels** | Anxious when deadlines are short Annoyed by repetitive manual file searches Unsure whether she included all relevant data |
| **Does** | Tries keyword search in the shared drive Opens many files one by one Asks senior colleagues for missing information Manually cross-checks invoices, reports, and summaries |

| Problem Scenarios | Current Alternatives | Your Value Proposition |
| ----- | ----- | ----- |
| Sara needs KPI results for a campaign from 2022\. | Searching through old folders and opening multiple PDFs. | AI assistant retrieves KPI summaries instantly with citations. |
| She must find all suppliers used for a type of event. | Checking Excel sheets, old reports, or asking colleagues. | Assistant identifies all supplier mentions and groups them by category.. |
| She needs invoice totals for previous campaigns. | Manually browsing invoice folders and scanned files. | Assistant extracts totals and references from PDFs—even scanned ones.. |
| She wants to compare performance across similar clients. | Manually compiling data from old reports. | Assistant provides side-by-side comparison with source links. |

