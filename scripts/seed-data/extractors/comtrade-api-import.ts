import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const COMTRADE_API_KEY = process.env['COMTRADE_API_KEY'] || '';
const BASE_URL = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';
const KOREA_REPORTER_CODE = '410';

const TARGET_MINERALS = {
    LITHIUM_H: '282520', // 수산화/산화 리튬
    LITHIUM_C: '283691', // 탄산 리튬
};

type PartnerReference = {
    PartnerCode: number;
    PartnerDesc: string;
};

function loadPartnerDescMap(referencePath: string): Map<number, string> {
    const references = JSON.parse(fs.readFileSync(referencePath, 'utf-8')) as PartnerReference[];
    return new Map(references.map(({ PartnerCode, PartnerDesc }) => [PartnerCode, PartnerDesc]));
}

async function fetchRawComtradeData(hsCode: string, period: string = '2025'): Promise<any> {
    // API 호출 전 2초 대기
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(2000);

    const params = new URLSearchParams({
        cmdCode: hsCode,
        //reporterCode: KOREA_REPORTER_CODE,
        reporterCode:      '410,392', // 한국, 일본
        partnerCode:       '842,156,152', // 미국, 중국, 칠레
        period,
        flowCode: 'M',
        'subscription-key': COMTRADE_API_KEY,
    });

    const requestUrl = `${BASE_URL}?${params.toString()}`;
    console.log(`[API Request] ${requestUrl}`);

    try {
        const response = await fetch(requestUrl, { method: 'GET', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`[API Fetch Fault] HS Code ${hsCode} failed:`, error);
        return null;
    }
}

function extractTopImportPartnersForKorea(rawData: any[], partnerDescMap: Map<number, string>, top: number = 10) {
    return rawData
        .filter(r => r?.primaryValue && r.primaryValue > 0 && r.partnerCode !== 0)
        .sort((a, b) => b.primaryValue - a.primaryValue)
        .slice(0, top)
        .map((r, idx) => ({
            rank:         idx + 1,
            partnerCode:  r.partnerCode,
            partnerDesc:  partnerDescMap.get(r.partnerCode) ?? null,
            primaryValue: r.primaryValue,
            qty:          r.altQty ?? r.netWgt ?? 0,
        }));
}

async function runPipeline() {
    console.log('UN Comtrade pipeline for top import partners of Korea has started...');
    const targetPeriod = '2025';
    const outputDir = path.join(__dirname, '../raw-inputs');

    const partnerReferencePath = path.join(outputDir, 'ListOfreferencePartner.json');
    const partnerDescMap = loadPartnerDescMap(partnerReferencePath);

    for (const [mineralName, hsCode] of Object.entries(TARGET_MINERALS)) {
        console.log(`\n--- [${mineralName}] collecting Korea import partners ---`);

        const rawResult = await fetchRawComtradeData(hsCode, targetPeriod);

        if (!rawResult?.data) {
            console.error(`[Warning] ${mineralName} 데이터 없음`);
            continue;
        }

        console.log(`[${mineralName}] 전체 레코드: ${rawResult.data.length}건`);

        const rawPath = path.join(outputDir, `raw-comtrade-${mineralName.toLowerCase()}-${targetPeriod}.json`);
        fs.writeFileSync(rawPath, JSON.stringify(rawResult, null, 2), 'utf-8');
        console.log(`[File Saved] 원본: ${rawPath}`);

        const topPartners = extractTopImportPartnersForKorea(rawResult.data, partnerDescMap, 10);
        const topPath = path.join(outputDir, `top-exporters-${mineralName.toLowerCase()}-${targetPeriod}.json`);
        fs.writeFileSync(topPath, JSON.stringify(topPartners, null, 2), 'utf-8');

        console.log(`[File Saved] 한국 수입 Top10: ${topPath}`);
        console.log('[Top Import Partners For Korea]');
        topPartners.forEach(r =>
            console.log(`  ${r.rank}. code=${r.partnerCode} (${r.partnerDesc ?? 'Unknown'})  $${(r.primaryValue / 1e6).toFixed(1)}M`)
        );
    }

    console.log('\nDone.');
}

runPipeline().catch(console.error);
