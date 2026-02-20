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

# **Project Charter \- Project Document with**

# **Justification**

**Project Code:** UP\_QF

**Project Name:** QuickFind

**Client:** Government Institution / Public Administration Body / Private Users 

**Document Version:** 1.0

Date of changes: 20.02.2026.

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

 