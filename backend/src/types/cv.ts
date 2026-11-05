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
