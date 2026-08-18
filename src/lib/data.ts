// ============================================================================
//  PORTFOLIO DATA — edit everything about you here.
//  This is the single source of truth for the whole macOS desktop.
// ============================================================================

export const profile = {
  name: "Eliada Salla",
  role: "Full-Stack Developer",
  company: "BIZ360",
  location: "Tirana, Albania",
  email: "eliada.salla@outlook.com",
  phone: "+355 69 340 6752",
  avatar: "/avatar.svg",
  tagline: "Full-stack developer shipping end-to-end web products.",
  bio: [
    "Hi — I'm Eliada, a full-stack developer with 3+ years of experience and a Computer Science degree from the University of New York, Tirana. I build web applications with React, Next.js and TypeScript on the front end, and Node.js, NestJS and PostgreSQL behind them.",
    "I care about REST APIs that are pleasant to consume, reusable component architecture, and Docker-based deployments that behave the same everywhere. This portfolio is built as a small macOS desktop — open the apps in the dock to explore my work.",
  ],
  socials: [
    // TODO: confirm the exact LinkedIn slug — this is a best guess from the CV.
    { label: "GitHub", url: "https://github.com/Eliada02", handle: "@Eliada02" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/eliada-salla/",
      handle: "in/eliada-salla",
    },
    {
      label: "Email",
      url: "mailto:eliada.salla@outlook.com",
      handle: "eliada.salla@outlook.com",
    },
  ],
};

export type Project = {
  id: string;
  name: string;
  year: string;
  summary: string;
  description: string;
  tags: string[];
  link?: string;
  repo?: string;
  accent: string; // tailwind gradient classes
  /** Spans the full width of the bento grid — reserve it for one project. */
  featured?: boolean;
};

// TODO: add named client / personal projects here — the CV documents the work
// in aggregate rather than per project.
export const projects: Project[] = [
  {
    id: "desktop-portfolio",
    name: "Desktop Portfolio",
    year: "2026",
    summary: "This portfolio, built as a miniature macOS desktop.",
    description:
      "A personal portfolio that behaves like an operating system: a dock, draggable and resizable windows, a menu bar and a working terminal. Built with Next.js App Router, TypeScript, Tailwind CSS and shadcn/ui, with window state handled by a small global store.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    repo: "https://github.com/Eliada02",
    accent: "from-brand-cerise to-brand-magenta",
    featured: true,
  },
  {
    id: "freelance-client-apps",
    name: "Client Web Applications",
    year: "2024 — Present",
    summary: "Full-stack apps delivered end to end for private clients.",
    description:
      "Freelance work covering the complete lifecycle: requirements gathering, architecture, development and Dockerized deployment, plus post-launch support. React/Next.js frontends in TypeScript, NestJS REST APIs documented with Swagger, and PostgreSQL for relational data.",
    tags: ["Next.js", "NestJS", "PostgreSQL", "Docker"],
    accent: "from-brand-magenta to-brand-ink",
  },
  {
    id: "expense-tracker",
    name: "Expense Tracker",
    year: "2023",
    summary: "Full-stack MERN app for tracking personal spending.",
    description:
      "A full-stack expense tracker built during a 150-hour internship at Albania Lab. Handled the React front end and integrated it with an Express and Node.js API backed by MongoDB, covering authentication, CRUD for transactions and category-based summaries.",
    tags: ["React", "Node.js", "Express.js", "MongoDB"],
    accent: "from-brand-sand to-brand-cerise",
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "Full-Stack Developer",
    company: "BIZ360",
    period: "Mar. 2026 — Present",
    location: "Tirana, AL",
    points: [
      "Develop end-to-end features for client web applications, from React/Next.js (TypeScript) frontends through Node.js/NestJS backend services.",
      "Design and implement REST APIs with NestJS, documented with Swagger, and model relational data in PostgreSQL.",
      "Containerize services with Docker to keep development and deployment environments consistent across projects.",
      "Build reusable component libraries with Redux Toolkit, Shadcn UI and Tailwind CSS, translating business requirements and UI/UX designs into maintainable code.",
      "Drive performance optimization and UX improvements across client projects, including load-time and responsiveness gains.",
      "Leverage AI-assisted development tools with structured prompting to accelerate debugging, code generation and evaluation of technical trade-offs.",
    ],
  },
  {
    role: "Full-Stack Developer",
    company: "Freelance",
    period: "2024 — Present",
    location: "Remote",
    points: [
      "Deliver full-stack web applications for private clients using React/Next.js, Node.js, NestJS and PostgreSQL.",
      "Handle the complete project lifecycle independently: requirements gathering, architecture, development, Dockerized deployment and post-launch support.",
      "Manage client communication, timelines and scope directly, consistently delivering projects on schedule.",
    ],
  },
  {
    role: "Frontend Developer",
    company: "MCN",
    period: "Dec. 2024 — Mar. 2026",
    location: "Tirana, AL",
    points: [
      "Promoted to Junior Software Developer after a successful internship; developed and maintained production frontend applications with JavaScript, React and Next.js.",
      "Collaborated with designers and backend developers in cross-functional teams to deliver high-quality features on schedule.",
      "Wrote clean, reusable code aligned with best practices, participating in code reviews and agile ceremonies (sprint planning, standups, retrospectives).",
    ],
  },
  {
    role: "Web Developer — Intern",
    company: "Albania Lab Sh.p.k",
    period: "Mar. 2023 — Jun. 2023",
    location: "Tirana, AL",
    points: [
      "Completed a 150-hour internship as part of the university curriculum.",
      "Worked on a full-stack Expense Tracker application using the MERN stack.",
      "Focused on front-end development with React and back-end API integration with Express and Node.",
      "Collaborated with mentors and followed agile-style development practices.",
    ],
  },
];

// Courses & training — rendered as its own section under Experience.
export const courses: Experience[] = [
  {
    role: "JavaScript Developer",
    company: "SDA",
    period: "Sep. 2022 — Mar. 2023",
    location: "Tirana, AL",
    points: [
      "Completed an intensive 6-month web development program focused on real-world projects and group collaboration.",
      "Gained strong foundations in HTML, CSS and core JavaScript (ES6+).",
      "Built interactive front-end applications using React.js, including state management and routing.",
      "Worked in teams to simulate real-life development environments, including version control with Git and GitHub.",
    ],
  },
];

export type SkillGroup = { category: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    category: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Redux Toolkit",
      "Tailwind CSS",
      "shadcn/ui",
      "Material UI",
      "HTML5",
      "CSS3",
    ],
  },
  {
    category: "Backend",
    items: [
      "Node.js",
      "NestJS",
      "Express.js",
      "REST APIs",
      "PostgreSQL",
      "SQL",
      "MongoDB",
    ],
  },
  {
    category: "DevOps & Tools",
    items: [
      "Docker",
      "Git",
      "GitHub",
      "Postman",
      "Swagger",
      "Figma",
      "VS Code",
      "Trello",
      "ClickUp",
      "Slack",
    ],
  },
  {
    category: "Practices",
    items: [
      "Agile/Scrum",
      "Code reviews",
      "Responsive design",
      "Performance optimization",
      "AI-assisted development",
    ],
  },
];

export const education = [
  {
    school: "University of New York, Tirana",
    degree: "B.Sc. Computer Science — GPA 3.57 / 4.0",
    period: "Oct. 2021 — Jul. 2024",
  },
];
