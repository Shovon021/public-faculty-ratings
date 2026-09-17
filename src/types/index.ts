export interface RatingBreakdown {
  teachingQuality: number;
  examFairness: number;
  gradingStrictness: number;
  examGuarding: number;
  behaviorWithStudents: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  initials: string;
  nicknames: string[];
  designation: string;
  role?: string;
  office: string;
  email: string;
  profileUrl: string;
  education?: string;
  researchInterests: string[];
  onLeave: boolean;
  rating: number;
  reviewCount: number;
  breakdown: RatingBreakdown;
  avatarUrl?: string;
}

export interface FacultyReview {
  id: string;
  facultyId: string;
  ratings: RatingBreakdown;
  overallRating: number;
  comment: string;
  createdAt: string;
  author: string; // strictly "Anonymous Student"
  semester?: string;
  userEmail?: string;
  userId?: string;
}

export interface UserSession {
  email: string;
  studentId: string;
  isVerified: boolean;
}
