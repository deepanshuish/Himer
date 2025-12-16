const mongoose = require('mongoose');
const College = require('./models/College');
const Cluster = require('./models/Cluster');
require('dotenv').config();
const axios = require('axios');
const { fetchNirfRanking, parseNirfListHtml } = require('./utils/nirf');
const { generateClusters, inferGenderType } = require('./utils/cluster-generator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

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
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 30000,
  });
  return String(res.data);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await College.deleteMany({});
    await Cluster.deleteMany({});

    // Drop legacy unique index on emailDomain (older schema versions created it)
    try {
      await College.collection.dropIndex('emailDomain_1');
    } catch (e) {
      // ignore if index doesn't exist
    }
    // Drop legacy unique index on name (older schema versions created it)
    try {
      await College.collection.dropIndex('name_1');
    } catch (e) {
      // ignore if index doesn't exist
    }

    console.log('Fetching NIRF rankings...');
    // Engineering: top 100 has full ranking, then rank-band pages provide 101-150 and 151-200 as lists.
    const engTop = await fetchNirfRanking(NIRF_ENGINEERING_URL); // should contain ranks 1..100
    const eng150Html = await fetchHtml(NIRF_ENGINEERING_150_URL);
    const eng200Html = await fetchHtml(NIRF_ENGINEERING_200_URL);
    const eng101to150 = parseNirfListHtml(eng150Html, { rankStart: 101 });
    const eng151to200 = parseNirfListHtml(eng200Html, { rankStart: 151 });
    const topEngineering = [
      ...engTop.filter((r) => r.rank >= 1 && r.rank <= 100),
      ...eng101to150.slice(0, 50),
      ...eng151to200.slice(0, 50),
    ].slice(0, 200);

    // Medical: NIRF 2024 publishes top 50 ranking + a participating institutions list (no rank).
    // We'll take top 50 + next 50 unique from the ALL list to reach 100 medical colleges.
    const medTop = await fetchNirfRanking(NIRF_MEDICAL_URL); // should contain ranks 1..50
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

    if (topEngineering.length < 200 || topMedical.length < 100) {
      throw new Error(
        `NIRF parsing returned too few results. Engineering=${topEngineering.length}, Medical=${topMedical.length}. ` +
          `Try again later or set NIRF_*_URL env vars.`
      );
    }

    const collegesToInsert = [
      ...topEngineering.map((r) => ({
        name: r.name,
        category: 'engineering',
        genderType: inferGenderType(r.name),
        location: { city: r.city, state: r.state },
      })),
      ...topMedical.map((r) => ({
        name: r.name,
        category: 'medical',
        genderType: inferGenderType(r.name),
        location: { city: r.city, state: r.state },
      })),
    ];

    const insertedColleges = await College.insertMany(collegesToInsert, { ordered: false });
    console.log(`Inserted ${insertedColleges.length} colleges (200 engineering + 100 medical).`);

    // Generate exactly 100 clusters of 3
    const clustersTriples = generateClusters(insertedColleges, { nearestPool: 30 });
    if (clustersTriples.length !== 100) {
      throw new Error(`Expected 100 clusters, got ${clustersTriples.length}`);
    }

    const createdClusters = [];
    for (let i = 0; i < clustersTriples.length; i++) {
      const triple = clustersTriples[i];
      const cluster = new Cluster({
        name: `Cluster ${i + 1}`,
        colleges: triple.map((c) => c._id),
        isActive: true,
      });
      await cluster.save();
      createdClusters.push(cluster);

      await College.updateMany(
        { _id: { $in: triple.map((c) => c._id) } },
        { $set: { clusterId: cluster._id } }
      );
    }

    console.log(`\n✅ Seeded ${createdClusters.length} clusters and ${insertedColleges.length} colleges`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

