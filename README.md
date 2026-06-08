# 3D 공간 정보 기반의 공급망 리스크 시뮬레이터 : mineral-supply-chain-geolink

`mineral-supply-chain-geolink`는 고성능 지리 공간 시각화 기술(WebGL/D3.js/Mapbox)과 대형 언어 모델(LLM)을 결합하여 전 세계 핵심 광물 및 에너지 공급망을 실시간으로 추적하는 웹 기반 B2B 엔터프라이즈 지능형 SaaS 솔루션입니다.

자원 보호주의 규제에 대응하여 공급망의 취약점을 시각화하고, 위기 상황을 가상 시뮬레이션하여 최적의 우회 대안 경로를 도출합니다.

---

## 1. 대상 (Target)

* **엔터프라이즈 SCM 및 리스크 관리 부서:** 미국 IRA(인플레이션 감축법), 유럽 CRMA(핵심원자재법) 등 글로벌 자원 안보 규제에 직접적으로 노출된 이차전지·배터리 제조사, 자동차 OEM 기업, 반도체 대기업
* **정부 부처 및 국책 연구기관 정책 입안자:** 특정 국가의 원자재 수출 통제 및 자원 무기화 조치에 따른 산업별 타격 지점을 선제적으로 진단하고 자원 안보 정책을 수립하는 전문가 (예: 산업통상자원부 등)

---

## 2. 핵심 기능 (Feature)

### 멀티모달 데이터 통합 및 지식 그래프 구축

* **정량 데이터 스토어 (Graph DB):** USGS, IEA, LME, UN Comtrade 등 공인 기관의 원천 데이터(광산 위치, 제련소 가동률, 무역량, 실시간 시세)를 수집하여 자원의 채굴부터 최종 소비지까지의 계층 구조 매핑
* **정성 데이터 스토어 (Vector DB):** 국가별 자원 안보 정책, 기술 리포트, 지질학 논문 등을 청킹 및 인덱싱하여 연동

### 옵시디언 스타일의 인터랙티브 시각화 (WebGL / GIS)

* **네트워크 그래프 뷰:** 대용량 노드(광산, 제련소, 공장, 국가)와 엣지(물류 경로, 지분 및 계약 관계)를 Canvas/WebGL 기반 물리 엔진으로 시각화하여 데이터의 연결성과 특정 거점 편중도를 직관적으로 파악
* **3D Geo-Spatial 지구본 뷰:** Mapbox GL JS와 Deck.gl을 활용하여 실제 지리적 좌표 기반의 글로벌 물류 흐름 레이어와 3D 베지에 곡선 아크(Arc) 렌더링 (LOD 최적화 적용)

### AI 기반 충격 시뮬레이션 및 우회 경로 추론

* **연쇄 피해 실시간 추적:** 특정 국가의 수출 규제나 광산 파업 등 가상 시나리오 가동 시, 시뮬레이션 엔진이 하위 공급망에 미치는 자원 결손(Deficit) 경로를 실시간 추적 및 시각적 하이라이트
* **LLM 맥락 기반 대안 제안:** 그래프 토폴로지와 규제 문서 맥락을 융합 분석하여, 타당성 점수(Feasibility Score)가 포함된 최적의 대체 공급선과 대안 시나리오를 한국어 자연어 리포트로 생성

---

## 3. 핵심 가치 (Benefit)

* **원자재 수급 리스크의 선제적 차단:** 파편화되어 블랙박스 형태로 존재하던 글로벌 공급망의 취약점과 아킬레스건을 직관적으로 확인하고 시뮬레이션하여 수천억 원대 원자재 공급 중단 사태를 사전 예방
* **신속하고 객관적인 의사결정 지원:** 공급망 리스크 발생 시 복잡한 DB 쿼리나 수작업 문서 대조 없이, AI가 데이터와 규제 문서를 자동 융합 분석하여 최적의 대안을 제안함으로써 소싱 전략 수립 시간을 혁신적으로 단축
* **글로벌 규제 완벽 대응 (Traceability):** 최종 제품부터 원재료 광산까지의 Upstream 경로를 역추적(Traceability)하여 공급망 실사법 및 환경 규제 위반 리스크를 헤지하고 ESG 원산지 증명을 자동화

---

## 4. 시스템 아키텍처 (Technical Architecture)

```
[클라이언트: React / Next.js 15 (TypeScript)]
       │
       ▼ (REST API / WebSockets)
[API 게이트웨이 및 오케스트레이터: NestJS / Express (TypeScript)]
       │
       ├─► [Graph DB: Neo4j] ───► 물리적 공급망 계층 & 인과 관계 추론
       ├─► [Vector DB: Pinecone] ──► 정책 및 기술 문서 시맨틱 검색
       └─► [LLM 인프라] ─────────► LangChain.js 기반 시나리오 분석 및 대안 리포트 생성

```

* **Frontend:** React, Next.js 15, TypeScript, Zustand, React Force Graph, Mapbox GL JS, Deck.gl, Tailwind CSS
* **Backend:** Node.js, NestJS (또는 Express), TypeScript, LangChain.js (LLM Orchestration)
* **Database:** Neo4j (Graph DB), Pinecone (또는 Milvus) (Vector DB)  
[폴더 구조 아키텍처](./DIRECTORY.md) 참조
---

## 5. 프로젝트 로드맵 (Roadmap)

### Phase 1: MVP (기본 시각화 및 데이터 모델링)

* [ ] 핵심 3대 광물(리튬, 코발트, 니켈) 중심 공급망 데이터 모델링 및 JSON 스키마 규격화
* [ ] Canvas 기반의 고성능 기본 Force-directed 그래프 뷰 구현
* [ ] 노드/엣지별 리스크 점수(Risk Score) 산정 알고리즘 연동 및 툴팁 데이터 매핑
* [ ] 백그라운드 물리 연산을 위한 Web Worker 아키텍처 도입

### Phase 2: Interactive (인터랙티브 탐색 및 AI 고도화)

* [ ] Mapbox GL JS 연동 및 2D 지도/3D 지구본 레이어 전환 기능 구현
* [ ] 특정 노드 셧다운 시 시뮬레이션 엔진을 통한 하위 리스크 전파 애니메이션 구현
* [ ] 정책 문서 임베딩 파이프라인 구축 및 Vector DB 시맨틱 검색 연동
* [ ] AI_Insight_Panel 개발: 멀티턴 대화형 쿼리 인터페이스 및 대체 소싱 추천 에이전트 탑재
* [ ] 최종 생성품 기준 Upstream 원산지 역추적(Traceability) 리포트 출력 기능