import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      study_program?: string;
      specialization?: string;
      study_year?: string;
      university?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    study_program?: string;
    specialization?: string;
    study_year?: string;
    university?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
