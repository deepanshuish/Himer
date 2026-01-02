const prisma = require('./utils/prisma');
require('dotenv').config();
const axios = require('axios');
const { fetchNirfRanking, parseNirfListHtml } = require('./utils/nirf');
const { generateClusters, inferGenderType } = require('./utils/cluster-generator');

const NIRF_ENGINEERING_URL =
  process.env.NIRF_ENGINEERING_URL || 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking.html';
const NIRF_ENGINEERING_150_URL =
  process.env.NIRF_ENGINEERING_150_URL || 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking150.html';
const NIRF_ENGINEERING_200_URL =
  process.env.NIRF_ENGINEERING_200_URL || 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking200.html';
const NIRF_MEDICAL_URL =
  process.env.NIRF_MEDICAL_URL || 'https://www.nirfindia.org/Rankings/2024/MedicalRanking.html';
const NIRF_MEDICAL_ALL_URL =
  process.env.NIRF_MEDICAL_ALL_URL || 'https://www.nirfindia.org/Rankings/2024/MedicalRankingALL.html';

async function fetchHtml(url) {
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000,
    });
    return String(res.data);
  } catch (e) {
    console.error(`Failed to fetch ${url}:`, e.message);
    return "";
  }
}

async function seed() {
  try {
    console.log('Connecting to SQL Database...');
    await prisma.$connect();

    // Clear existing data (caution: deletes everything)
    console.log('Clearing existing data...');
    // Delete dependents first to satisfy foreign keys
    await prisma.tweetLike.deleteMany({});
    await prisma.reply.deleteMany({});
    await prisma.tweet.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.passed.deleteMany({});
    await prisma.message.deleteMany({});

    await prisma.user.deleteMany({});
    await prisma.college.deleteMany({});
    await prisma.cluster.deleteMany({});

    console.log('Fetching NIRF rankings...');
    const engTop = await fetchNirfRanking(NIRF_ENGINEERING_URL).catch(() => []);
    const eng150Html = await fetchHtml(NIRF_ENGINEERING_150_URL);
    const eng200Html = await fetchHtml(NIRF_ENGINEERING_200_URL);
    const eng101to150 = parseNirfListHtml(eng150Html, { rankStart: 101 });
    const eng151to200 = parseNirfListHtml(eng200Html, { rankStart: 151 });

    const topEngineering = [
      ...engTop.filter((r) => r.rank >= 1 && r.rank <= 100),
      ...eng101to150.slice(0, 50),
      ...eng151to200.slice(0, 50),
    ].slice(0, 200);

    const medTop = await fetchNirfRanking(NIRF_MEDICAL_URL).catch(() => []);
    const medAllHtml = await fetchHtml(NIRF_MEDICAL_ALL_URL);
    const medAll = parseNirfListHtml(medAllHtml);

    const medTop50 = medTop.filter((r) => r.rank >= 1 && r.rank <= 50).slice(0, 50);
    const seenMed = new Set(medTop50.map((r) => r.name.toLowerCase()));
    const medNext = [];
    for (const r of medAll) {
      if (seenMed.has(r.name.toLowerCase())) continue;
      medNext.push({ ...r, rank: 50 + medNext.length + 1 });
      if (medNext.length === 50) break;
    }
    const topMedical = [...medTop50, ...medNext].slice(0, 100);

    console.log(`Found ${topEngineering.length} engineering and ${topMedical.length} medical colleges.`);

    const collegesToInsert = [
      ...topEngineering.map((r) => ({
        name: r.name,
        category: 'engineering',
        genderType: inferGenderType(r.name),
        city: r.city,
        state: r.state
      })),
      ...topMedical.map((r) => ({
        name: r.name,
        category: 'medical',
        genderType: inferGenderType(r.name),
        city: r.city,
        state: r.state
      })),
    ];

    const insertedColleges = [];
    console.log('Inserting colleges one-by-one to maintain ID references...');
    for (const c of collegesToInsert) {
      const inserted = await prisma.college.create({ data: c });
      insertedColleges.push(inserted);
    }

    console.log(`Inserted ${insertedColleges.length} colleges.`);

    // Generate exactly 100 clusters of 3
    const clustersTriples = generateClusters(insertedColleges.map(c => ({ ...c, _id: c.id })), { nearestPool: 30 });
    console.log(`Generated ${clustersTriples.length} clusters.`);

    for (let i = 0; i < clustersTriples.length; i++) {
      const triple = clustersTriples[i];
      const cluster = await prisma.cluster.create({
        data: {
          name: `Cluster ${i + 1}`,
          isActive: true
        }
      });

      const collegeIds = triple.map(c => c.id);
      await prisma.college.updateMany({
        where: { id: { in: collegeIds } },
        data: { clusterId: cluster.id }
      });
    }

    console.log(`\n✅ Seeded ${clustersTriples.length} clusters and ${insertedColleges.length} colleges`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

