export type Branch =
  | "CSE"
  | "IT"
  | "ECE"
  | "EEE"
  | "Mechanical"
  | "Civil"
  | "Other";

export type RegistrationTeamMember = {
  name: string;
  email: string;
  branch: Branch | "";
  year: string;
  phone: string;
};

export type RegistrationSubmission = {
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  branch: Branch | "";
  year: string;
  rollNumber: string;
  teamName: string;
  teamMembers: RegistrationTeamMember[];
  acceptedPrivacyPolicy: boolean;
};
