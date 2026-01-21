export interface Course {
  id?: number;
  University: string;
  Bologna_Emnekode?: string;
  Bologna_Fagnavn?: string;
  Foreign_Emnekode?: string;
  Foreign_Fagnavn?: string;
  ECTS: string;
  NTNU_Emnekode: string;
  NTNU_Fagnavn: string;
  Behandlingsdato: string;
  Country: string;
  Wiki_URL?: string;
  verified?: boolean; // true if course was added by admin
  approved?: boolean; // true if course has been approved by admin
  Semester?: string;
}
