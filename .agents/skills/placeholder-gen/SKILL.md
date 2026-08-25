---
name: placeholder-gen
description: 해상도와 비율이 맞는 미디어 플레이스홀더 이미지/비디오 구조 생성
---

# Placeholder Generator Skill

## 지침
Apple 클론 퍼블리싱 중 원본 고해상도 에셋을 즉시 사용할 수 없을 때 완벽한 비율의 대체 영역을 삽입합니다.
1. **이미지**: `https://placehold.co/{width}x{height}` 등을 활용해 정확한 비율의 더미 이미지를 반환합니다.
2. **비디오**: 로컬 영역에 `<div class="bg-gray-300 w-full h-full flex items-center justify-center">Video Placeholder</div>` 형태의 시맨틱한 박스를 생성하여 UI 레이아웃이 붕괴되지 않도록 방어합니다.
3. 미디어 요소 코드를 생성할 때는 반드시 픽셀 단위의 Width/Height 값 주석을 함께 남깁니다.