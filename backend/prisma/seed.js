import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, ApplicationStatus } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


const DEMO_USER = {
  email: "demo@example.com",
  displayName: "Demo Account",
  password: "password123",
  isVerified: true,
};

const SAMPLE_APPLICATIONS = [
  // 3 Bookmarked (WISHLIST)
  {
    company: "Anthropic",
    jobTitle: "Software Engineer, New Grad",
    status: ApplicationStatus.WISHLIST,
    location: "San Francisco, CA",
    salary: "$165,000",
    appliedDate: new Date("2026-10-15T12:00:00.000Z"),
    notes: "Researching ML infrastructure team; need referral.",
  },
  {
    company: "Datadog",
    jobTitle: "Backend Software Engineer",
    status: ApplicationStatus.WISHLIST,
    location: "New York, NY",
    salary: "$150,000",
    appliedDate: new Date("2026-10-18T12:00:00.000Z"),
    notes: "Observability platform role; bookmarking before deadline.",
  },
  {
    company: "Figma",
    jobTitle: "Full Stack Product Engineer",
    status: ApplicationStatus.WISHLIST,
    location: "Remote / San Francisco, CA",
    salary: "$160,000",
    appliedDate: new Date("2026-10-20T12:00:00.000Z"),
    notes: "Strong UI/UX focus; tailor portfolio examples first.",
  },

  // 3 Applied (APPLIED)
  {
    company: "Stripe",
    jobTitle: "Software Engineering Intern",
    status: ApplicationStatus.APPLIED,
    location: "Seattle, WA",
    salary: "$62/hr",
    appliedDate: new Date("2026-09-22T12:00:00.000Z"),
    notes: "Submitted online application with updated resume.",
  },
  {
    company: "Cloudflare",
    jobTitle: "Systems & Backend Engineer",
    status: ApplicationStatus.APPLIED,
    location: "Austin, TX",
    salary: "$142,000",
    appliedDate: new Date("2026-09-28T12:00:00.000Z"),
    notes: "Applied via university career portal.",
  },
  {
    company: "Atlassian",
    jobTitle: "Software Engineer",
    status: ApplicationStatus.APPLIED,
    location: "Remote",
    salary: "$138,000",
    appliedDate: new Date("2026-10-02T12:00:00.000Z"),
    notes: "Completed online assessment; awaiting recruiter follow-up.",
  },

  // 2 Interviewing (INTERVIEWING)
  {
    company: "Linear",
    jobTitle: "Product & Full Stack Engineer",
    status: ApplicationStatus.INTERVIEWING,
    location: "Remote",
    salary: "$155,000",
    appliedDate: new Date("2026-09-12T12:00:00.000Z"),
    notes: "Cleared recruiter screen; technical pairing scheduled.",
  },
  {
    company: "Ramp",
    jobTitle: "Backend Engineer",
    status: ApplicationStatus.INTERVIEWING,
    location: "New York, NY",
    salary: "$152,000",
    appliedDate: new Date("2026-09-16T12:00:00.000Z"),
    notes: "Completed live coding round; preparing for system design.",
  },

  // 2 Offered (OFFERED)
  {
    company: "HubSpot",
    jobTitle: "Associate Software Engineer",
    status: ApplicationStatus.OFFERED,
    location: "Cambridge, MA",
    salary: "$125,000",
    appliedDate: new Date("2026-08-25T12:00:00.000Z"),
    notes: "Written offer received; reviewing relocation and equity details.",
  },
  {
    company: "Capital One",
    jobTitle: "Software Engineer (TDP)",
    status: ApplicationStatus.OFFERED,
    location: "McLean, VA",
    salary: "$130,000",
    appliedDate: new Date("2026-08-29T12:00:00.000Z"),
    notes: "Offer extended after final loop; comparing compensation packages.",
  },

  // 2 Rejected (REJECTED)
  {
    company: "Meta",
    jobTitle: "Software Engineer, University Grad",
    status: ApplicationStatus.REJECTED,
    location: "Menlo Park, CA",
    salary: "$158,000",
    appliedDate: new Date("2026-08-15T12:00:00.000Z"),
    notes: "Received rejection after initial screen.",
  },
  {
    company: "Duolingo",
    jobTitle: "Software Engineer",
    status: ApplicationStatus.REJECTED,
    location: "Pittsburgh, PA",
    salary: "$135,000",
    appliedDate: new Date("2026-08-20T12:00:00.000Z"),
    notes: "Role closed / not moving forward after technical review.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {
      displayName: DEMO_USER.displayName,
      passwordHash,
      isVerified: DEMO_USER.isVerified,
    },
    create: {
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
      passwordHash,
      isVerified: DEMO_USER.isVerified,
    },
  });

  // Replace existing applications for the demo user so re-running the seed
  // always yields a clean, deterministic set of 12 sample records.
  await prisma.application.deleteMany({
    where: { userId: user.id },
  });

  await prisma.application.createMany({
    data: SAMPLE_APPLICATIONS.map((app) => ({
      ...app,
      userId: user.id,
    })),
  });

  console.log(
    `Seeded demo account (${user.email}) with ${SAMPLE_APPLICATIONS.length} applications.`
  );
}

main()
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });