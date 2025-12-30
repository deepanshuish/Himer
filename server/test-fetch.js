const { fetchNirfRanking, parseNirfListHtml } = require('./utils/nirf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const NIRF_ENGINEERING_URL = 'https://www.nirfindia.org/Rankings/2024/EngineeringRanking.html';

async function test() {
    try {
        console.log('Fetching...');
        const data = await fetchNirfRanking(NIRF_ENGINEERING_URL);
        console.log(`Fetched ${data.length} colleges.`);
        if (data.length > 0) {
            console.log('Sample:', data[0]);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
