export interface Course {
  courseCode: string;
  courseName: string;
  replacedCourseCode: string;
  replacedCourseName: string;
  institute: string;
  ECTSPoints: string;
  courseType: string;
  comments: string;
}

export interface CoursesBySemester {
  Høst?: Course[];
  Vår?: Course[];
}

export interface Exchange {
  id: string;
  university: string;
  country: string;
  study: string;
  specialization: string;
  studyYear: string;
  numSemesters: number;
  year: string;
  courses: CoursesBySemester;
}

export interface University {
  name: string;
  country: string;
  exchangeCount?: number;
  image_url?: string;
}

export interface Country {
  name: string;
  universityCount: number;
  exchangeCount: number;
}

export interface Study {
  name: string;
  exchangeCount: number;
}

export interface PopularDestination {
  university: string;
  country: string;
  exchangeCount: number;
  imageUrl?: string;
}

