import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const COMTRADE_API_KEY = process.env["COMTRADE_API_KEY"] || '';
const BASE_URL = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';

// 데이터 수집 대상 정의
const TARGET_MINERALS = {
    LITHIUM: '282520', // 리튬 탄산염 및 산화물
    COPPER: '740311',  // 정제된 구리
    GRAPHITE: '250410' // 천연 흑연
};

/**
 * UN Comtrade API로부터 특정 HS 코드에 대한 수출 데이터를 페칭하는 함수
 * @param hsCode - HS 코드 (예: '282520' for Lithium Carbonate)
 * @param period - 데이터 조회 기간
 * @returns API 응답 JSON 객체 또는 null (오류 발생 시)
 */
async function fetchRawComtradeData(hsCode: string, period: string = '2025'): Promise<any> {
    const params = new URLSearchParams({
        cmdCode: hsCode,
        partnerCode: '0',     // 1단계: 총 수출국 식별을 위해 World(0) 지정
        period: period,
        flowCode: 'X',        // Export (수출)
        'subscription-key': COMTRADE_API_KEY
    });

    const requestUrl = `${BASE_URL}?${params.toString()}`;
    console.log(`[API Request] ${requestUrl}`);

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP 에러 발생 상태코드: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Fetch Fault] HS Code ${hsCode} 호출 중 예외 발생:`, error);
        return null;
    }
}

async function runPipeline() {
    console.log('UN Comtrade 데이터 추출(Extract) 파이프라인 시작...');
    const targetPeriod = '2025';

    for (const [mineralName, hsCode] of Object.entries(TARGET_MINERALS)) {
        console.log(`\n--- [${mineralName}] 수집 시작 ---`);

        const rawResult = await fetchRawComtradeData(hsCode, targetPeriod);

        if (rawResult && rawResult.data) {
            console.log(`[${mineralName}] 레코드 수: ${rawResult.data.length}건 수집 완료.`);

            // 파일 저장
            const outputFileName = `raw-comtrade-${mineralName.toLowerCase()}-${targetPeriod}.json`;
            const outputPath = path.join(__dirname, '../raw-inputs', outputFileName);

            fs.writeFileSync(outputPath, JSON.stringify(rawResult, null, 2), 'utf-8');
            console.log(`[File Saved] 데이터 백업 완료: ${outputPath}`);
        } else {
            console.error(`[Warning] ${mineralName} 데이터를 받아오지 못했거나 응답이 비어있습니다.`);
        }
    }

    console.log('\n모든 핵심 광물의 1단계 데이터 페칭이 완료되었습니다.');
}

runPipeline().catch(console.error);