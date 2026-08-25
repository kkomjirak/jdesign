# Apple Korea Clone - Design System & Guidelines

## 1. Typography
- **Primary Font**: `SF Pro KR`, `SF Pro Display`, `SF Pro Text`
- **Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Characteristics**: 
  - 타이틀은 두껍고 큼직하게(Bold/Semibold), 본문은 얇고 명확하게(Regular/Medium).
  - 영문과 국문 혼용 시 베이스라인과 자간 간격에 유의할 것.

## 2. Color Palette
- **Background**: `#F5F5F7` (Light Mode), `#000000` (Dark Mode)
- **Text**: `#1D1D1F` (Light Mode), `#F5F5F7` (Dark Mode)
- **Accent/Link**: `#0066CC` (Apple Blue)
- **Promo Cards**: `#FFFFFF` 또는 어두운 그레이톤 커스텀 배경

## 3. Layout Structure
- **GNB (Global Navigation Bar)**: 
  - Height: `44px`
  - 스크롤 시 반투명 블러 효과(backdrop-filter: blur) 적용.
- **Hero Section**: 
  - `100vh` 또는 화면 비율에 맞춘 꽉 찬 섹션.
  - 텍스트는 상단 중앙에 배치, 제품 이미지는 하단에서 올라오는 구조.
- **Promo Grid**: 
  - 2열 구조의 그리드. 각 카드는 `overflow: hidden` 처리 및 hover 시 미세한 scale up 또는 텍스트 애니메이션.

## 4. Animation Principles
- **Easing**: `cubic-bezier(0.25, 0.1, 0.25, 1)` (부드럽고 자연스러운 감속).
- **Performance**: 레이아웃 리페인팅을 유발하는 `width`, `top` 등의 속성 애니메이션은 금지. 오직 `transform`과 `opacity`만 사용.