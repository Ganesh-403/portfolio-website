# Ganesh Kambli — Portfolio Website

> A dark, responsive portfolio website showcasing projects, experience, and skills. Built from scratch with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

---

## About the Portfolio

I'm **Ganesh Kambli** — a final-year Computer Engineering student at **Savitribai Phule Pune University, Pune** (graduating 2026, CGPA 7.67). I specialize in **Python development**, building production-grade backends, cloud platforms, cybersecurity tools, and full-stack web applications. Currently interning at **AI Adventures LLP**, a Pune-based AI startup.

**Open to SDE roles** — Pune / Remote

---

## What's Inside

### **Hero Section**
- Typewriter animation rotating through 5 roles (Python Developer · Backend Engineer · Cloud Builder · Security Enthusiast · Aspiring SDE)
- Animated profile photo with rotating gradient border
- Live stat counters: **1 Internship · 6 Projects · 2 Competition Wins · 7.67 CGPA**
- Call-to-action buttons linking to projects, GitHub, and LinkedIn

### **About Section**
- Personal introduction and career goals
- 5 skill categories with 30+ tech tags:
  - **Languages**: Python, C++, JavaScript, Java, SQL, HTML/CSS
  - **Frameworks & Libraries**: Flask, React, Node.js, Scikit-learn, Pandas, NumPy, Matplotlib, Jinja2
  - **Cloud & Security**: Docker, GitHub Actions, REST APIs, JWT Auth, SHA-256, RBAC
  - **Databases**: MySQL, MongoDB, SQLite, Google Sheets API
  - **CS Fundamentals**: OOP, DSA, DBMS, OS, Computer Networks, MVC

### **Experience Section**
- **Python Developer Intern** (Dec 2024 – Feb 2025) at AI Adventures LLP
  - Built automated Absence Detection System reducing reporting time by ~80%
  - Redesigned 3 Python course modules and authored 10+ interactive quizzes
  - Created real-time Google Sheets monitoring pipeline
  
- **B.E. Computer Engineering** (2022–2026) at Savitribai Phule Pune University
  - CGPA: 7.67
  - Relevant coursework: DSA, DBMS, OS, Computer Networks, OOP, Machine Learning
  
- **Achievements**
  - 🥇 Winner: Site Craft Web Dev Challenge (VAMINT Club 2025)
  - 🏆 Runner-up: Prep-A-Thon Coding Competition (Technobash 2025)

### **Projects Section** (6 Featured Projects)

1. **HoneyCloud — Scalable Honeypot Platform** *(In Progress)*
   - Final-year project: Cloud-native cybersecurity platform capturing and analyzing attack traffic across SSH, FTP, and HTTP
   - Stack: Python · Cloud · Cybersecurity · ML · Docker · Real-time Streaming
   - [GitHub](https://github.com/Ganesh-403/honeycloud)

2. **Cloud SaaS System** *(Deployed)*
   - Python-powered SaaS platform with JWT authentication, file storage, and metadata handling
   - Stack: Python · JWT Auth · REST API · SaaS
   - [GitHub](https://github.com/Ganesh-403/Cloud-SaaS-System)

3. **SVF — Secure Virtual File System** *(Deployed)*
   - C++-based secure file system with user auth, SHA-256 hashing, and role-based access control
   - Stack: C++ · SHA-256 · RBAC · Systems
   - [GitHub](https://github.com/Ganesh-403/SVF)

4. **Railway Management System** *(Deployed)*
   - Full-stack booking system: under 3 user actions to complete booking, zero race conditions under concurrent load
   - Stack: Flask · MySQL · JavaScript
   - [GitHub](https://github.com/Ganesh-403/Railway-Management-System)

5. **Monitor Google Sheet** *(Deployed)*
   - Real-time monitoring pipeline using Google Sheets API + GitHub Actions
   - Achieved ~80% reduction in reporting time, eliminated human error
   - Stack: Python · Google Sheets API · GitHub Actions
   - [GitHub](https://github.com/Ganesh-403/Monitor-Google-Sheet)

6. **Portfolio Website** *(Live)*
   - This site — responsive dark-themed portfolio with custom animations and effects
   - Stack: HTML · CSS · JavaScript
   - [GitHub](https://github.com/Ganesh-403/portfolio-website)

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