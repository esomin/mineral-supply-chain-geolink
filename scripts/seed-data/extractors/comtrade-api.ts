import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const COMTRADE_API_KEY = process.env["COMTRADE_API_KEY"] || '';
const BASE_URL = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';

const TARGET_MINERALS = {
    // LITHIUM: '282520', // 수산화/탄산 리튬
    LITHIUM: '283691', // 산화 리튬 (Lithium oxide)
};


async function fetchRawComtradeData(hsCode: string, period: string = '2025'): Promise<any> {
    const params = new URLSearchParams({
        cmdCode:            hsCode,
        partnerCode:        '0',
        period:             period,
        flowCode:           'X',
        'subscription-key': COMTRADE_API_KEY,
    });

    const requestUrl = `${BASE_URL}?${params.toString()}`;
    console.log(`[API Request] ${requestUrl}`);

    try {
        const response = await fetch(requestUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error(`HTTP 에러 상태코드: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`[API Fetch Fault] HS Code ${hsCode} 호출 중 예외 발생:`, error);
        return null;
    }
}

type ReporterReference = {
    reporterCode: number;
    reporterDesc: string;
};

function loadReporterDescMap(referencePath: string): Map<number, string> {
    const references = JSON.parse(fs.readFileSync(referencePath, 'utf-8')) as ReporterReference[];
    return new Map(references.map(({ reporterCode, reporterDesc }) => [reporterCode, reporterDesc]));
}

// ────────────────────────────────────────────
// 주요국 추출 — 전처리 전용, 정확도 불요
// ────────────────────────────────────────────
function extractTopExporters(rawData: any[], reporterDescMap: Map<number, string>, top: number = 10) {

    // 1. 국가별로 primaryValue 합산 (중복 제거)
    const byCountry = new Map<number, number>();

    for (const r of rawData) {
        if (!r.primaryValue || r.primaryValue <= 0) continue;
        const prev = byCountry.get(r.reporterCode) ?? 0;
        byCountry.set(r.reporterCode, prev + r.primaryValue);
    }

    // 2. 합산 기준 내림차순 정렬 → 상위 N개
    return [...byCountry.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, top)
        .map(([reporterCode, primaryValue], idx) => ({
            rank:         idx + 1,
            reporterCode,
            reporterDesc: reporterDescMap.get(reporterCode) ?? null,
            primaryValue,
            qty:          rawData.find(r => r.reporterCode === reporterCode)?.altQty
                ?? rawData.find(r => r.reporterCode === reporterCode)?.netWgt
                ?? 0,
        }));
}

async function runPipeline() {
    console.log('UN Comtrade 데이터 추출 파이프라인 시작...');
    const targetPeriod = '2025';

    const outputDir = path.join(__dirname, '../raw-inputs');
    const reporterReferencePath = path.join(outputDir, 'ListOfreferenceReporter.json');
    const reporterDescMap = loadReporterDescMap(reporterReferencePath);

    for (const [mineralName, hsCode] of Object.entries(TARGET_MINERALS)) {
        console.log(`\n--- [${mineralName}] 수집 시작 ---`);

        const rawResult = await fetchRawComtradeData(hsCode, targetPeriod);

        if (!rawResult?.data) {
            console.error(`[Warning] ${mineralName} 데이터 없음`);
            continue;
        }

        console.log(`[${mineralName}] 전체 레코드: ${rawResult.data.length}건`);

        // 1 원본 전체 백업
        const rawPath = path.join(outputDir, `raw-comtrade-${mineralName.toLowerCase()}-${targetPeriod}.json`);
        fs.writeFileSync(rawPath, JSON.stringify(rawResult, null, 2), 'utf-8');
        console.log(`[File Saved] 원본: ${rawPath}`);

        // 2 상위 10개국 추출
        const topExporters = extractTopExporters(rawResult.data, reporterDescMap, 10);
        const topPath = path.join(outputDir, `top-exporters-${mineralName.toLowerCase()}-${targetPeriod}.json`);

        fs.writeFileSync(topPath, JSON.stringify(topExporters, null, 2), 'utf-8');
        console.log(`[File Saved] 상위 10개국: ${topPath}`);
        console.log(`[Top Exporters]`);
        topExporters.forEach(r =>
            console.log(`  ${r.rank}. code=${r.reporterCode} (${r.reporterDesc ?? 'Unknown'})  $${(r.primaryValue/1e6).toFixed(1)}M`)
        );
    }

    console.log('\n완료.');
}

runPipeline().catch(console.error);