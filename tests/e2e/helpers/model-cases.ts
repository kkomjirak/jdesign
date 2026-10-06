// Independent acceptance fixture: preserve exact supplied filenames and ordering.
export const modelProjects = [
  {
    "id": "jd001",
    "files": [
      "jd001_web.glb"
    ]
  },
  {
    "id": "jd003",
    "files": [
      "jd003_web.glb"
    ]
  },
  {
    "id": "jd005_a",
    "files": [
      "jd005_a_web.glb"
    ]
  },
  {
    "id": "jd005_b",
    "files": [
      "jd005_b_web.glb"
    ]
  },
  {
    "id": "jd006",
    "files": [
      "jd006_web.glb"
    ]
  },
  {
    "id": "jd008_b",
    "files": [
      "jd008_b_web.glb"
    ]
  },
  {
    "id": "jd008_c",
    "files": [
      "jd008_c_web.glb"
    ]
  },
  {
    "id": "jd020",
    "files": [
      "jd020_web.glb"
    ]
  },
  {
    "id": "jd026",
    "files": [
      "jd026_web.glb"
    ]
  },
  {
    "id": "jd027",
    "files": [
      "jd027_web.glb"
    ]
  },
  {
    "id": "jd030",
    "files": [
      "jd030_web.glb"
    ]
  },
  {
    "id": "jd004_a",
    "files": [
      "jd004_a_web.glb"
    ]
  },
  {
    "id": "jd004_b",
    "files": [
      "jd004_b_web.glb"
    ]
  },
  {
    "id": "jd008_e",
    "files": [
      "jd008_e_web.glb"
    ]
  },
  {
    "id": "jd011",
    "files": [
      "jd011_web.glb"
    ]
  },
  {
    "id": "jd013",
    "files": [
      "jd013_web.glb"
    ]
  },
  {
    "id": "jd015_a",
    "files": [
      "jd015_a_web.glb"
    ]
  },
  {
    "id": "jd015_c",
    "files": [
      "jd015_c-001_web.glb",
      "jd015_c-002_web.glb"
    ]
  },
  {
    "id": "jd019_a",
    "files": [
      "jd019_a_web.glb"
    ]
  },
  {
    "id": "jd019_b",
    "files": [
      "jd019_b_web.glb"
    ]
  },
  {
    "id": "jd023",
    "files": [
      "jd023-001_web.glb",
      "jd023-002_web.glb",
      "jd023-003_web.glb"
    ]
  },
  {
    "id": "jd025_b",
    "files": [
      "jd025_b_web.glb"
    ]
  },
  {
    "id": "jd025_c",
    "files": [
      "jd025_c_web.glb"
    ]
  },
  {
    "id": "jd034_c",
    "files": [
      "jd034_c_web.glb"
    ]
  },
  {
    "id": "jd035",
    "files": [
      "jd035_web.glb"
    ]
  },
  {
    "id": "jd017_e",
    "files": [
      "jd017_e_web.glb"
    ]
  },
  {
    "id": "jd037",
    "files": [
      "jd037_web.glb"
    ]
  },
  {
    "id": "jd039",
    "files": [
      "jd039_web.glb"
    ]
  },
  {
    "id": "jd040",
    "files": [
      "jd040_web.glb"
    ]
  },
  {
    "id": "jd042",
    "files": [
      "jd042_web.glb"
    ]
  },
  {
    "id": "jd043",
    "files": [
      "jd043_web.glb"
    ]
  },
  {
    "id": "jd044",
    "files": [
      "jd044_web.glb"
    ]
  },
  {
    "id": "jd045",
    "files": [
      "jd045_web.glb"
    ]
  },
  {
    "id": "jd041",
    "files": [
      "jd041-001_web.glb",
      "jd041-002_web.glb"
    ]
  }
];

export const modelCases = modelProjects.flatMap(({ id, files }) =>
  files.map((file, index) => ({ id, file, index, count: files.length })),
);