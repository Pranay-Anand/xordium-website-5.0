export interface CoreMember {
  name: string;
  rollNo: string;
  post: string;
  image: string; // path relative to /public, e.g. "/assets/team/john.jpg"
}

export interface CoordinatorMember {
  name: string;
  rollNo: string;
  image: string; // path relative to /public
}

// ─── Core Executives ─────────────────────────────────────────────────────────
// The president is displayed prominently at the top, centered.

export const president: CoreMember = {
  name: "President Name",
  rollNo: "BIT/XXXXX/XX",
  post: "President",
  image: "/assets/team/placeholder.jpg",
};

// Exactly 2 Vice Presidents — displayed side by side below the president.
export const vicePresidents: CoreMember[] = [
  {
    name: "Vice President Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Vice President",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Vice President Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Vice President",
    image: "/assets/team/placeholder.jpg",
  },
];

// All remaining post-holders displayed in a 4-column grid below the VPs.
// Add/remove entries freely — order here determines display order.
export const otherCoreExecutives: CoreMember[] = [
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "General Secretary",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Treasurer",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Joint Secretary",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Technical Head",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Design Head",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "PR Head",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Marketing Head",
    image: "/assets/team/placeholder.jpg",
  },
  {
    name: "Member Name",
    rollNo: "BIT/XXXXX/XX",
    post: "Content Head",
    image: "/assets/team/placeholder.jpg",
  },
];

// ─── Senior Coordinators ─────────────────────────────────────────────────────
// Sorted A→Z automatically — enter in any order you like.
// Gallery shows 4 at a time with ← → arrows to navigate.

export const seniorCoordinators: CoordinatorMember[] = [
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Senior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
];

// ─── Junior Coordinators ─────────────────────────────────────────────────────
// Sorted A→Z automatically — enter in any order you like.
// Gallery shows 4 at a time with ← → arrows to navigate.

export const juniorCoordinators: CoordinatorMember[] = [
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
  { name: "Junior Coordinator Name", rollNo: "BIT/XXXXX/XX", image: "/assets/team/placeholder.jpg" },
];
