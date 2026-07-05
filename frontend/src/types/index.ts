export type UserRole = "admin" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  _id: string;
  user: string | User;
  deviceId: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  loginAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  banner: string;
  instructor?: { _id: string; name: string; avatar?: string };
  price: number;
  isFree: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  language: string;
  duration: string;
  learningOutcomes: string[];
  requirements: string[];
  isPublished: boolean;
  totalEnrollments: number;
  rating: number;
  createdAt: string;
}

export interface Section {
  _id: string;
  course: string;
  title: string;
  order: number;
}

export interface Lesson {
  _id: string;
  section: string;
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface Video {
  _id: string;
  lesson: string;
  section: string;
  course: string;
  title: string;
  youtubeUrl: string;
  embedUrl: string;
  duration: string;
  order: number;
  accessType: "preview" | "locked";
}

export interface Enrollment {
  _id: string;
  student: string | User;
  course: string | Course;
  status: "active" | "revoked";
  enrolledAt: string;
  progress?: number;
  isCompleted?: boolean;
}

export interface Progress {
  _id: string;
  student: string;
  course: string;
  completedVideos: string[];
  completedLessons: string[];
  completedSections: string[];
  lastWatchedVideo?: string;
  lastWatchedPosition: number;
  bookmarkedLessons: string[];
  percentage: number;
  isCompleted: boolean;
}

export interface Homepage {
  _id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerText: string;
  socialLinks: Record<string, string>;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
  isActive: boolean;
  socialLinks?: Record<string, string>;
}

export interface Testimonial {
  _id: string;
  name: string;
  designation: string;
  photo: string;
  message: string;
  rating: number;
  order: number;
  isActive: boolean;
}

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta;
}
