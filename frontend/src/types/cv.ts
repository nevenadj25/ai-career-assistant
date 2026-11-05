export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  photo: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  city: string;
  startYear: string;
  endYear: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Language {
  id: number;
  name: string;
  level: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: Language[];
  projects: Project[];
  certificates: Certificate[];

  template: "modern" | "classic" | "minimal";
}

export type CVHeaderStyle = "left" | "centered" | "sidebar";

export type CVSkillsStyle = "badges" | "list" | "columns";

export type CVExperienceStyle = "standard" | "timeline" | "compact";

export type CVSection =
  | "contact"
  | "summary"
  | "education"
  | "experience"
  | "skills"
  | "languages"
  | "projects"
  | "certificates";

export interface CVDesignConfig {
  layout: "single-column" | "two-column" | "sidebar";

  sidebarPosition: "left" | "right";
  sidebarWidth: number;

  primaryColor: string;
  accentColor: string;

  font: "Inter" | "Roboto" | "Poppins" | "Georgia";

  photo: {
    visible: boolean;
    position: "header" | "sidebar";
    shape: "circle" | "rounded" | "square";
    size: "small" | "medium" | "large";
  };

  header: {
    alignment: "left" | "center";
    style: "minimal" | "bold" | "accent";
  };

  mainSections: CVSection[];
  sideSections: CVSection[];

  headingStyle: "line" | "accent" | "minimal";

  skillsStyle: "list" | "badges" | "bars";

  experienceStyle: "standard" | "timeline" | "compact";

  spacing: "compact" | "normal" | "spacious";
}

export const defaultCVDesign: CVDesignConfig = {
  layout: "single-column",

  sidebarPosition: "left",
  sidebarWidth: 30,

  primaryColor: "#1f2937",
  accentColor: "#4f46e5",

  font: "Inter",

  photo: {
    visible: true,
    position: "header",
    shape: "circle",
    size: "medium",
  },

  header: {
    alignment: "left",
    style: "minimal",
  },

  mainSections: [
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "languages",
    "certificates",
  ],

  sideSections: ["contact"],

  headingStyle: "line",

  skillsStyle: "badges",

  experienceStyle: "standard",

  spacing: "normal",
};
