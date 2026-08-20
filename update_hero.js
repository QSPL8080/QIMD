const path = require('path');
const { PrismaClient } = require(path.join(__dirname, 'node_modules', '@prisma', 'client'));
const db = new PrismaClient();

async function main() {
  const result = await db.pageSection.updateMany({
    where: { pageKey: 'HOME', sectionKey: 'HERO' },
    data: {
      sectionTitle: "India's First Industry-Oriented & AI Powered Marketing & Design Institute",
      subtitle: "Join QIMD's AI-Powered & Performance-Driven Practical Training Program in Digital Marketing, Graphic Design & Video Editing with 100% Job Assistance & Placement Opportunities.",
    },
  });
  console.log('Updated HOME HERO section in DB:', result);
}

main().catch(console.error).finally(() => db.$disconnect());
