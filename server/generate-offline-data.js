const fs = require('fs');
const path = require('path');
const { fetchNirfRanking, parseNirfListHtml } = require('./utils/nirf');
const { generateClusters, inferGenderType } = require('./utils/cluster-generator');
const axios = require('axios');

const OUT_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

const NIRF_ENGINEERING_URL = 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking.html';
const NIRF_ENGINEERING_150_URL = 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking150.html';
const NIRF_ENGINEERING_200_URL = 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking200.html';
const NIRF_MEDICAL_URL = 'https://www.nirfindia.org/Rankings/2024/MedicalRanking.html';
const NIRF_MEDICAL_ALL_URL = 'https://www.nirfindia.org/Rankings/2024/MedicalRankingALL.html';

async function fetchHtml(url) {
    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000,
        });
        return String(res.data);
    } catch (e) {
        console.warn(`Failed to fetch ${url}: ${e.message}`);
        return '';
    }
}

async function generate() {
    try {
        console.log('Fetching NIRF rankings...');
        const engTop = await fetchNirfRanking(NIRF_ENGINEERING_URL);

        // For simplicity, if secondary pages fail, just use what we have or mock.
        // Fetching secondary pages...
        const eng150Html = await fetchHtml(NIRF_ENGINEERING_150_URL);
        const eng200Html = await fetchHtml(NIRF_ENGINEERING_200_URL);

        let eng101to150 = [];
        let eng151to200 = [];

        if (eng150Html) eng101to150 = parseNirfListHtml(eng150Html, { rankStart: 101 });
        if (eng200Html) eng151to200 = parseNirfListHtml(eng200Html, { rankStart: 151 });

        const topEngineering = [
            ...engTop.filter((r) => r.rank >= 1 && r.rank <= 100),
            ...eng101to150.slice(0, 50),
            ...eng151to200.slice(0, 50),
        ].slice(0, 200);

        const medTop = await fetchNirfRanking(NIRF_MEDICAL_URL);
        const medAllHtml = await fetchHtml(NIRF_MEDICAL_ALL_URL);
        let medAll = [];
        if (medAllHtml) medAll = parseNirfListHtml(medAllHtml);

        const medTop50 = medTop.filter((r) => r.rank >= 1 && r.rank <= 50).slice(0, 50);
        const seenMed = new Set(medTop50.map((r) => r.name.toLowerCase()));
        const medNext = [];
        for (const r of medAll) {
            if (seenMed.has(r.name.toLowerCase())) continue;
            medNext.push({ ...r, rank: 50 + medNext.length + 1 });
            if (medNext.length === 50) break;
        }
        const topMedical = [...medTop50, ...medNext].slice(0, 100);

        const colleges = [
            ...topEngineering.map((r) => ({
                _id: 'eng_' + r.rank,
                name: r.name,
                category: 'engineering',
                genderType: inferGenderType(r.name),
                location: { city: r.city, state: r.state },
            })),
            ...topMedical.map((r) => ({
                _id: 'med_' + r.rank,
                name: r.name,
                category: 'medical',
                genderType: inferGenderType(r.name),
                location: { city: r.city, state: r.state },
            })),
        ];

        console.log(`Generated ${colleges.length} colleges.`);

        let clusters = [];
        try {
            const clustersTriples = generateClusters(colleges, { nearestPool: 30 });
            clusters = clustersTriples.map((triple, i) => ({
                _id: 'cluster_' + (i + 1),
                name: `Cluster ${i + 1}`,
                colleges: triple.map(c => c._id),
                isActive: true,
                populatedColleges: triple
            }));

            colleges.forEach(c => {
                const cluster = clusters.find(cl => cl.colleges.includes(c._id));
                if (cluster) c.clusterId = cluster._id;
            });
        } catch (e) {
            console.warn('Cluster generation failed, saving colleges without clusters:', e.message);
        }

        fs.writeFileSync(path.join(OUT_DIR, 'colleges.json'), JSON.stringify(colleges, null, 2));
        if (clusters.length > 0) {
            fs.writeFileSync(path.join(OUT_DIR, 'clusters.json'), JSON.stringify(clusters, null, 2));
        }
        console.log('✅ Offline data generated in server/data/');

    } catch (error) {
        console.error('Generation error:', error);
    }
}

generate();
