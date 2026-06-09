```
mineral-supply-chain-geolink/           # [Root] 프로젝트 최상단 디렉토리
├── apps/                               # [Applications] 실제 실행 및 배포되는 독립된 서비스
│   ├── api/                            # 백엔드 서비스 (NestJS / TypeScript)
│   │   ├── src/
│   │   │   ├── config/                 # Neo4j, Pinecone, LLM 환경 변수 및 설정
│   │   │   ├── common/                 # 공통 가드, 인터셉터, 예외 처리 필터
│   │   │   ├── modules/
│   │   │   │   ├── supply-chain/       # Neo4j 연동 및 공급망 그래프 토폴로지 API
│   │   │   │   ├── risk/               # USGS, IEA 데이터 가공 및 리스크 점수 산정 엔진
│   │   │   │   ├── simulation/         # 셧다운 시나리오 및 리스크 전파 알고리즘
│   │   │   │   ├── search/             # Pinecone 연동 규제/정책 문서 벡터 검색
│   │   │   │   └── insight/            # LangChain.js 기반 LLM 오케스트레이션 및 AI 리포트
│   │   │   └── main.ts                 # 애플리케이션 진입점 (Express/FastAPI 구동)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                            # 프런트엔드 대시보드 (Next.js 15 App Router)
│       ├── src/
│       │   ├── app/                    # Next.js App Router (페이지 레이아웃 및 라우팅)
│       │   │   ├── layout.tsx          # 글로벌 레이아웃 (Theme, Providers)
│       │   │   ├── page.tsx            # 메인 대시보드 스크린
│       │   │   └── api/                # 프런트엔드 전용 프록시 라우트
│       │   ├── components/             # 재사용 가능한 UI 컴포넌트 (Shadcn/Mantine)
│       │   │   ├── graph/              # react-force-graph 기반 시각화 컴포넌트
│       │   │   ├── map/                # Mapbox GL JS / Deck.gl 3D 지구본 컴포넌트
│       │   │   ├── dashboard/          # 필터 바, 리스크 리스트, 통계 패널
│       │   │   └── insight/            # AI 대화형 질의 및 대안 추천 사이드바 패널
│       │   ├── store/                  # Zustand 기반 전역 상태 관리 (필터, 선택 노드 상태)
│       │   ├── workers/                # 그래프 레이아웃 및 최단 경로 연산용 Web Worker
│       │   └── hooks/                  # TanStack Query (API 데이터 페칭 Custom Hooks)
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                           # [Shared Packages] 내부 앱들이 공유하는 공통 모듈
│   ├── types/                          # 공통 도메인 데이터 타입 패키지
│   │   ├── index.ts                    # 타입 Export 통합 관리
│   │   ├── supply-chain.ts             # Node, Edge, 공급망 토폴로지 관련 인터페이스
│   │   ├── risk.ts                     # 리스크 점수, 시나리오 매개변수 타입
│   │   └── package.json                # 독립적인 모듈 배포용 패키지 설정
│   │
│   ├── tsconfig/                       # 공통 TypeScript 설정 배포 패키지
│   │   ├── base.json                   # 기본 TS 빌드 옵션
│   │   ├── nextjs.json                 # Next.js 프런트엔드 최적화 빌드 옵션
│   │   ├── nestjs.json                 # NestJS 백엔드 최적화 빌드 옵션
│   │   └── package.json
│   │
│   └── eslint-config/                  # 코드 린트 규칙 공유 패키지
│       ├── base.js
│       └── package.json
│
├── scripts/                            # [NEW] 독립 실행형 스크립트 공간
│   └── seed-data/                      # 초기 데이터 수집 및 파이프라인
│       ├── raw-inputs/                 # 수동 다운로드 파일 (USGS PDF, Pink Sheet 엑셀 등)
│       ├── extractors/                 # 소스별 파싱 스크립트 (TypeScript 기반 tsx 또는 Python)
│       │   ├── usgs-parser.ts          # USGS MRDS 및 MCS 데이터 추출기
│       │   ├── worldbank-parser.ts     # Pink Sheet 시세 및 WGI 정치안정성 지수 추출기
│       │   └── comtrade-api.ts         # UN Comtrade API 연동 스크립트
│       ├── parsed-outputs/             # 정규화 완료된 최종 JSON (Neo4j Import 용도)
│       │   ├── nodes.json              # 국가(ISO-3), 광산, 시설 노드 모음
│       │   └── edges.json              # 무역 흐름(가중치 포함), 소유권 엣지 모음
│       └── validator.ts                # 노드-엣지 정합성 및 무결성 검증 스크립트
│
├── pnpm-workspace.yaml                 # pnpm 워크스페이스 범위 정의 파일
├── turbo.json                          # Turborepo 빌드 파이프라인 및 캐싱 제어 파일
├── package.json                        # 모노레포 루트 패키지 설정 (전체 lint, 테스팅 스크립트)
└── .gitignore
```