# Portfolio Image Directory Guide

포트폴리오 페이지 및 상세 페이지에서 사용할 이미지를 배치하는 폴더입니다. 각 프로젝트 코드(예: `jd001`, `jd002` 등)별 개별 폴더에 썸네일과 상세 이미지를 함께 보관합니다.

## 📁 폴더 구조

```text
public/images/portfolio/
├── portfolio_data.json   # 전체 포트폴리오 메타데이터 JSON
├── jd001/                # 프로젝트별 개별 폴더
│   ├── jd001_thumbs.png  # 메인 포트폴리오 목록 카드용 썸네일 이미지
│   ├── jd001_1.png       # 상세 페이지 및 갤러리 이미지 1
│   ├── jd001_2.png       # 상세 페이지 및 갤러리 이미지 2
│   └── ...
└── ...
```

## 🖼️ 이미지 권장 사양 및 명명 규칙

1. **썸네일 이미지 (`{project_id}_thumbs.png`)**:
   - 파일명: `{folder_name}_thumbs.png` (예: `jd001_thumbs.png`)
   - 해상도: `800 x 600px` ~ `1200 x 900px` (WebP / PNG / JPG)

2. **상세 페이지 이미지 (`{project_id}_{number}.png`)**:
   - 파일명: `{folder_name}_1.png`, `{folder_name}_2.png`, ...
   - 해상도: `1920px` 이상 (고화질 목업 및 디자인 시안)

## 🔗 코드 참조 경로
Next.js의 `public` 디렉토리에 위치하므로, 코드에서는 `/images/portfolio/...` 경로로 바로 접근 가능합니다.

- 썸네일 예시: `/images/portfolio/jd001/jd001_thumbs.png`
- 상세 이미지 예시: `/images/portfolio/jd001/jd001_1.png`
