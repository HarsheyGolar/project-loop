import "dotenv/config";

// Demo credentials (README mein bhi yahi likhna):
//   admin@loopdemo.dev    / Demo@12345  (ADMIN)
//   analyst@loopdemo.dev  / Demo@12345  (ANALYST)
//   viewer@loopdemo.dev   / Demo@12345  (VIEWER)
const DEMO_PASSWORD = "Demo@12345";
const DEMO_WORKSPACE = "Demo Company";

const CHANNELS = [
  { name: "Support ticket", source: "API" },
  { name: "App store review", source: "API" },
  { name: "NPS survey", source: "CSV" },
  { name: "Sales call note", source: "MANUAL" },
  { name: "Community post", source: "OTHER" },
] as const;

const CUSTOMERS = [
  "Northwind Traders",
  "Orbit Finance",
  "Kinetic Health",
  "Goodwork Co.",
  "Bluepeak Logistics",
  "Lumen Studio",
  "Harbor Retail",
  "Vertex Labs",
];

type Sentiment = "positive" | "neutral" | "negative";

type ThemeSpec = {
  theme: string; // already in the form normalizeTheme() returns
  category: string;
  sentiment: Sentiment | "mixed";
  recent: number; // items in last 7 days
  older: number; // items in days 8-30
  texts: string[];
};

const THEMES: ThemeSpec[] = [
  {
    theme: "Profile picture upload crash",
    category: "Mobile",
    sentiment: "negative",
    recent: 12,
    older: 3,
    texts: [
      "The mobile app crashes when I try to upload a profile picture.",
      "Uploading a profile photo closes the app every single time.",
      "App freezes and then crashes after selecting a profile picture.",
      "Profile picture upload fails on Android and takes the whole app down.",
    ],
  },
  {
    theme: "Reports page performance",
    category: "Reports",
    sentiment: "negative",
    recent: 9,
    older: 8,
    texts: [
      "The reports page is very slow to load.",
      "Reports take over a minute to open when we have a lot of data.",
      "Loading times on the reports page make it hard to use before meetings.",
      "Reports page keeps spinning and sometimes never finishes loading.",
    ],
  },
  {
    theme: "Checkout process complexity",
    category: "Billing",
    sentiment: "negative",
    recent: 6,
    older: 9,
    texts: [
      "The checkout process is confusing and takes too many steps.",
      "Too many screens before I can actually pay. Please simplify checkout.",
      "I abandoned checkout because it was so lengthy and unclear.",
    ],
  },
  {
    theme: "New dashboard",
    category: "Dashboard",
    sentiment: "positive",
    recent: 10,
    older: 6,
    texts: [
      "The new dashboard is gorgeous and finally fast. Huge improvement.",
      "I really like the new dashboard, everything is easier to find.",
      "Love the redesigned dashboard, our team checks it every morning.",
      "The new dashboard gives us exactly the overview we needed.",
    ],
  },
  {
    theme: "Onboarding Difficulty",
    category: "Onboarding",
    sentiment: "negative",
    recent: 4,
    older: 10,
    texts: [
      "Onboarding took forever, I could not figure out how to invite my team.",
      "Setup was confusing, there is no clear first step after signing up.",
      "New users on my team got lost during onboarding.",
    ],
  },
  {
    theme: "Export Feature",
    category: "Exports",
    sentiment: "positive",
    recent: 5,
    older: 4,
    texts: [
      "Love the new export feature, saved me an hour today.",
      "CSV export works great and the file opens cleanly in Excel.",
      "Exporting reports for leadership is now a one-click job.",
    ],
  },
  {
    theme: "Billing Page Timeout",
    category: "Billing",
    sentiment: "negative",
    recent: 7,
    older: 2,
    texts: [
      "Billing page keeps timing out when I try to download an invoice.",
      "Cannot download invoices, the billing page just times out.",
      "Invoice download hangs and then the billing page shows an error.",
    ],
  },
  {
    theme: "Single Sign-on Request",
    category: "Security",
    sentiment: "neutral",
    recent: 3,
    older: 6,
    texts: [
      "Prospect wants single sign-on before they will sign, third time this month.",
      "Our IT team requires SSO. Is it on the roadmap?",
      "Enterprise buyers keep asking about SSO support.",
    ],
  },
  {
    theme: "Mobile Layout Improvements",
    category: "Mobile",
    sentiment: "neutral",
    recent: 4,
    older: 5,
    texts: [
      "It does the job, but the mobile layout needs work.",
      "Tables are hard to read on a phone, please improve the mobile layout.",
      "Works fine on desktop, but the mobile screens feel cramped.",
    ],
  },
  {
    theme: "Customer Support Speed",
    category: "Support",
    sentiment: "mixed",
    recent: 5,
    older: 5,
    texts: [
      "Support replied within minutes and solved my problem, great service.",
      "We waited three days for a reply from support on a billing question.",
      "Support was friendly but the answer took longer than we hoped.",
    ],
  },
  {
    theme: "Team Invitations",
    category: "Workspace",
    sentiment: "neutral",
    recent: 3,
    older: 3,
    texts: [
      "Would love a clearer way to invite and assign teammates.",
      "Inviting new members works, but roles are not obvious at first glance.",
      "Sending invitations to several teammates at once would help.",
    ],
  },
];

// Small deterministic random generator so every run gives the same data.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildFeedback(now = new Date()) {
  const rand = makeRng(42);
  const pick = <T,>(items: readonly T[]) =>
    items[Math.floor(rand() * items.length)];
  const dayMs = 86_400_000;
  const rows: Array<{
    content: string;
    source: (typeof CHANNELS)[number]["source"];
    sentiment: Sentiment;
    sentimentScore: number;
    summary: string;
    theme: string;
    category: string;
    status: "NEW" | "REVIEWED" | "ACTIONED";
    metadata: { channel: string; customerLabel: string };
    createdAt: Date;
  }> = [];

  for (const spec of THEMES) {
    const total = spec.recent + spec.older;

    for (let i = 0; i < total; i++) {
      const isRecent = i < spec.recent;
      // recent: 0-6.9 days ago, older: 7.5-29 days ago
      const daysAgo = isRecent ? rand() * 6.9 : 7.5 + rand() * 21.5;
      const createdAt = new Date(now.getTime() - daysAgo * dayMs);

      const sentiment: Sentiment =
        spec.sentiment === "mixed"
          ? i % 2 === 0
            ? "positive"
            : "negative"
          : spec.sentiment;

      // texts of the mixed theme are ordered: positive, negative, neutral-ish
      const content =
        spec.sentiment === "mixed"
          ? sentiment === "positive"
            ? spec.texts[0]
            : spec.texts[1 + (i % 2)]
          : spec.texts[i % spec.texts.length];

      const sentimentScore =
        sentiment === "positive"
          ? Math.round((0.5 + rand() * 0.45) * 100) / 100
          : sentiment === "negative"
            ? -Math.round((0.4 + rand() * 0.5) * 100) / 100
            : Math.round((rand() * 0.3 - 0.15) * 100) / 100;

      const ageDays = daysAgo;
      const status =
        ageDays > 20 ? "ACTIONED" : ageDays > 8 ? "REVIEWED" : "NEW";

      const channel = pick(CHANNELS);

      rows.push({
        content,
        source: channel.source,
        sentiment,
        sentimentScore,
        summary: content.length > 90 ? content.slice(0, 87) + "..." : content,
        theme: spec.theme,
        category: spec.category,
        status,
        metadata: { channel: channel.name, customerLabel: pick(CUSTOMERS) },
        createdAt,
      });
    }
  }

  return rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

async function main() {
  const rows = buildFeedback();

  if (process.env.SEED_DRY) {
    console.log(`DRY RUN: ${rows.length} feedback rows would be created.`);
    return;
  }

  const [{ default: bcrypt }, { PrismaPg }, { PrismaClient }] =
    await Promise.all([
      import("bcryptjs"),
      import("@prisma/adapter-pg"),
      import("../app/generated/prisma/client"),
    ]);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    let workspace = await db.workspace.findFirst({
      where: { name: DEMO_WORKSPACE },
    });
    if (!workspace) {
      workspace = await db.workspace.create({ data: { name: DEMO_WORKSPACE } });
    }

    const people = [
      { name: "Demo Admin", email: "admin@loopdemo.dev", role: "ADMIN" },
      { name: "Demo Analyst", email: "analyst@loopdemo.dev", role: "ANALYST" },
      { name: "Demo Viewer", email: "viewer@loopdemo.dev", role: "VIEWER" },
    ] as const;

    let analystId = "";

    for (const person of people) {
      const user = await db.user.upsert({
        where: { email: person.email },
        update: { name: person.name, passwordHash },
        create: { name: person.name, email: person.email, passwordHash },
      });

      await db.workspaceMember.upsert({
        where: {
          userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
        },
        update: { role: person.role },
        create: {
          userId: user.id,
          workspaceId: workspace.id,
          role: person.role,
        },
      });

      if (person.role === "ANALYST") analystId = user.id;
    }

    // Re-runnable: only the demo workspace's feedback is replaced.
    await db.feedback.deleteMany({ where: { workspaceId: workspace.id } });

    await db.feedback.createMany({
      data: rows.map((row) => ({
        workspaceId: workspace!.id,
        createdById: analystId,
        content: row.content,
        source: row.source,
        sentiment: row.sentiment,
        sentimentScore: row.sentimentScore,
        summary: row.summary,
        theme: row.theme,
        category: row.category,
        status: row.status,
        metadata: row.metadata,
        createdAt: row.createdAt,
      })),
    });

    console.log(`Seeded workspace "${DEMO_WORKSPACE}" with ${rows.length} feedback items.`);
    console.log("Logins (password for all: " + DEMO_PASSWORD + "):");
    for (const person of people) console.log(`  ${person.role.padEnd(8)} ${person.email}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});