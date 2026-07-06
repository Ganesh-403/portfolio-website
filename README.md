# Ganesh Kambli — Portfolio Website

> A dark, responsive portfolio website showcasing projects, experience, and skills. Built from scratch with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

---

## About the Portfolio

I'm **Ganesh Kambli** — a Computer Engineering graduate from **Savitribai Phule Pune University, Pune** (graduated 2026, CGPA 8.65). I specialize in **Python development**, building production-grade backends, cloud platforms, cybersecurity tools, and full-stack web applications. Currently interning at **AI Adventures LLP**, a Pune-based AI startup.

**Open to SDE roles** — Pune / Remote

---

## What's Inside

### **Hero Section**
- Typewriter animation rotating through 5 roles (Python Developer · Backend Engineer · Cloud Builder · Security Enthusiast · Aspiring SDE)
- Animated profile photo with rotating gradient border
- Live stat counters: **1 Internship · 20+ Projects · 2 Competition Wins · 8.65 CGPA**
- Call-to-action buttons linking to projects, GitHub, and LinkedIn

### **About Section**
- Personal introduction and career goals
- 11 skill categories representing his technical expertise:
  - **Programming Languages**: Python, C++, JavaScript, SQL, Kotlin
  - **Web & Backend**: HTML, CSS, REST APIs, FastAPI, Flask, async programming, Redis, WebSockets/SSE
  - **Frontend**: React.js, Vite, TailwindCSS
  - **Databases**: MySQL, PostgreSQL, MongoDB, DynamoDB, ChromaDB, pgvector
  - **Cloud & DevOps**: AWS (EC2, S3, Lambda, RDS, API Gateway, CloudWatch, VPC, IAM, CloudFront), Docker, CI/CD, GitHub Actions, Render, Vercel
  - **AI / LLM**: Prompt Engineering, RAG, GraphRAG, LangChain, LangGraph, Local LLM Inference (Ollama), FAISS, semantic search, hybrid search, re-ranking, RAGAS
  - **Machine Learning**: scikit-learn, Isolation Forest, Random Forest, LSTM, MLOps metrics, model drift monitoring
  - **Security**: JWT Authentication, SHA-256 Hashing, Argon2id, bcrypt, Role-Based Access Control (RBAC), Honeypots, POSIX permissions
  - **Systems Programming**: C++17, block storage engines, B-Tree indexing, thread-safe concurrency (Readers-Writer lock), CUDA/GPU parallelization
  - **Mobile**: Android (Kotlin)
  - **Tools**: Git, GitHub, Linux

### **Experience Section**
- **Python Developer Intern** (Dec 2024 – Feb 2025) at AI Adventures LLP
  - Eliminated manual attendance tracking by building an end-to-end Absence Detection System (Python + Google Sheets API + GitHub Actions), reducing reporting time by ~80% and human error to zero.
  - Built a real-time Google Sheets monitoring pipeline that automated data reconciliation across internal workflows, replacing a manual, error-prone process.
  
- **B.E. Computer Engineering** (2022–2026) at Savitribai Phule Pune University
  - CGPA: 8.65
  - Relevant coursework: DSA, DBMS, OS, Computer Networks, OOP, Machine Learning
  
- **HSC - Science (Class XII)** (2019–2021) at Gurukul Grand Union High School & Jr. College
  - Percentage: 74%
  
- **Achievements & Certifications**
  - Winner: Site Craft Web Dev Challenge (VAMINT Club 2025)
  - Runner-up: Prep-A-Thon Coding Competition (Technobash 2025)
  - Open Source Contributor: GirlScript Summer of Code 2026 (GSSoC'26)
  - Certifications: Python for Machine Learning (IIT Bombay / SINE), Google AI Essentials, Google Prompting Essentials, Cisco Cybersecurity, Learn Generative AI

- **Publications & Research**
  - HoneyCloud: A Smart Scalable Honeypot Platform with ML-Based Threat Classification and Real-Time Attacker Profiling (Co-authored research paper)
  - A Survey on AI-Driven Honeypot Systems and Real-Time Intrusion Detection (Co-authored literature review)

### **Projects Section** (8 Projects)

1. **RepoSage — Agentic GraphRAG Codebase Intelligence System** *(Deployed)*
   - Engineered a 100% offline, agentic GraphRAG system using LangGraph and NetworkX to autonomously traverse function-call dependency graphs, resolving queries via AST-based chunking and hybrid retrieval (ChromaDB + BM25) with Reciprocal Rank Fusion.
   - Stack: Python · LangGraph · FastAPI · ChromaDB · NetworkX · Ollama
   - [GitHub](https://github.com/Ganesh-403/Repo-Sage)

2. **HoneyCloud — Smart Scalable Honeypot Platform** *(Published Research / Deployed)*
   - Built a scalable, cloud-deployed honeypot system (FastAPI, PostgreSQL, Docker) detecting and logging intrusion attempts in real time, with ML-based anomaly detection (Isolation Forest, Random Forest) for automated threat classification. Deployed a React + Vite dashboard on Render/Vercel.
   - Stack: FastAPI · PostgreSQL · Docker · React · Vite · Anomaly Detection
   - [GitHub](https://github.com/Ganesh-403/honeycloud)

3. **Flight Delay AI — Real-Time Flight Delay Prediction Infrastructure** *(Deployed)*
   - Architected a decoupled, multi-service ML platform integrating an inference pipeline, distributed weather caching, and real-time client updates using React.js and Python. Implemented model drift monitoring and MLOps metrics.
   - Stack: Flask · React · XGBoost · SHAP (XAI) · Redis · WebSockets · MLOps
   - [GitHub](https://github.com/Ganesh-403/FlightDelayAI)

4. **AWS Serverless URL Shortener** *(Deployed)*
   - Built a fully serverless, event-driven URL shortener using AWS Lambda, API Gateway, DynamoDB, S3, and CloudFront.
   - Stack: AWS Lambda · API Gateway · DynamoDB · S3 · CloudFront
   - [GitHub](https://github.com/Ganesh-403/aws-serverless-url-shortener)

5. **SVF — Secure Virtual File System** *(Deployed)*
   - Engineered a persistent virtual file system in C++17 implementing physical block storage simulation, POSIX permissions, and concurrent inode access via a thread-safe Readers-Writer lock model. Passed a comprehensive security audit.
   - Stack: C++17 · Argon2id · B-Tree · POSIX · Concurrency
   - [GitHub](https://github.com/Ganesh-403/SVF)

6. **GPU-Accelerated Parallel Compression Engine (CUDA Huffman)** *(Deployed)*
   - CUDA-accelerated Huffman encoding system in C++17 leveraging massive GPU parallelism, shared memory histograms, and warp-level aggregation kernels, achieving 45+ GB/s throughput.
   - Stack: C++17 · CUDA · Warp-Level Aggregation · OpenMP · CMake
   - [GitHub](https://github.com/Ganesh-403/GPU-huffman)

7. **RailExp — Modern Railway Management System** *(Deployed)*
   - Re-engineered a legacy Flask + raw HTML application into a multi-tier architecture with a concurrent FastAPI backend and a Vite React + TailwindCSS SPA frontend. Containerized via Docker.
   - Stack: FastAPI · React.js · Vite · TailwindCSS · Docker · Flask
   - [GitHub](https://github.com/Ganesh-403/railexp)

8. **Aura Wellness — Mindful Digital Wellbeing App** *(Deployed)*
   - Built an Android application in Kotlin that intervenes on distracting app usage and offers gamified wellness quests and AI-guided check-ins.
   - Stack: Kotlin · Android · AI Guides · Gamified Quests
   - [GitHub](https://github.com/Ganesh-403/aura-wellness)

### **Contact Section**
- Direct email, LinkedIn, and GitHub links
- Resume download (PDF)
- Contact form powered by Formspree

---

## Design & Features

### **Visual Design**
- **Color Scheme**: Dark background (#0d0d0d) with orange accent (#F74C00)
- **Custom Cursor**: Animated dot + ring following mouse movement
- **Grain Texture**: Subtle SVG noise overlay for depth
- **Grid Background**: Responsive geometric background pattern
- **Typography**: 
  - Display: [Syne](https://fonts.google.com/specimen/Syne) (bold headings)
  - Code: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (monospace elements)
  - Body: [DM Sans](https://fonts.google.com/specimen/DM+Sans) (readable text)

### **Interactions**
- Smooth scroll behavior with reveal animations
- Fade-in + slide-up on scroll (Intersection Observer)
- Animated stat counters with easing functions
- Typewriter effect on hero role text
- Hover effects on buttons, cards, and links
- Responsive mobile menu with hamburger toggle
- Custom scrollbar styling

### **Responsive**
- Fully responsive design: desktop, tablet, mobile
- Mobile menu breakpoint: 768px
- Tablet layout breakpoint: 900px
- Mobile grid layout at 600px

---

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6+)
- **Fonts**: Google Fonts (Syne, JetBrains Mono, DM Sans)
- **Form Handling**: [Formspree](https://formspree.io)
- **Animations**: CSS transitions, Intersection Observer API, RequestAnimationFrame
- **No Build Tools**: Single-file deployment — just open `index.html`

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/Ganesh-403/portfolio-website.git
cd portfolio-website

# Open in browser (no install needed)
open index.html
# or on Windows:
start index.html
# or on Linux:
xdg-open index.html
```

That's it — no npm, no build step, no dependencies. Just vanilla web technologies.

---

## File Structure

```
portfolio-website/
├── index.html                    # Single-file: HTML + CSS + JS
├── README.md                     # This file
├── LICENSE                       # License file
└── assets/
    ├── images/
    │   └── ganesh.jpg            # Profile photo (circular, animated border)
    └── resume/
        └── ganesh_kambli_resume.pdf  # Downloadable resume
```

---

## Performance

- **Single-file delivery**: instant page load
- **Lazy fonts**: Google Fonts preconnect for faster load
- **Optimized animations**: CSS-based + RequestAnimationFrame
- **Minimal JavaScript**: ~8KB of functionality
- **Mobile-first responsive**: adapts to all screen sizes

---

## Contact & Links

- **Email**: [gkambli70@gmail.com](mailto:gkambli70@gmail.com)
- **LinkedIn**: [ganeshkambli](https://www.linkedin.com/in/ganeshkambli/)
- **GitHub**: [Ganesh-403](https://github.com/Ganesh-403)
- **GitHub Repos**: [See all projects](https://github.com/Ganesh-403?tab=repositories)

---

## License

© 2026 Ganesh Kambli. See [LICENSE](LICENSE) for details.

Built with intention.