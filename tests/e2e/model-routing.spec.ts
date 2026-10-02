import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import portfolioData from "../../public/images/portfolio/portfolio_data.json";
import { getProjectModelPath } from "../../src/lib/portfolioModels";

const modelIds = ["jd001", "jd003", "jd005_a", "jd005_b", "jd006", "jd008_b", "jd008_c", "jd020", "jd026", "jd027", "jd030"];

// Execute the real server-page selection without importing client-only CSS/GSAP.
// Client children are not rendered: their props expose the selected projects.
function homeProjectIds(): string[] {
  const filename = path.join(process.cwd(), "src/app/page.tsx");
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports: { default?: () => { props: { children: { props: { children: { props: { projects: { id: string }[] } } } }[] } } } = {};
  vm.runInNewContext(compiled, {
    exports,
    process,
    require: (id: string) => {
      if (id === "react/jsx-runtime") return jsxRuntime;
      if (id === "node:fs") return fs;
      if (id === "node:path") return path;
      if (id === "@/lib/portfolioModels") return { getProjectModelPath };
      if (id.endsWith("portfolio_data.json")) return portfolioData;
      if (id === "@/components/home/Hero" || id === "@/components/home/PromoGrid") return () => null;
      throw new Error(`Unexpected home-page dependency: ${id}`);
    },
  }, { filename });
  const page = exports.default!();
  return page.props.children[1].props.children.props.projects.map((project) => project.id);
}

function withAssetAvailability<T>(available: (assetPath: string) => boolean, run: () => T): T {
  const original = fs.existsSync;
  fs.existsSync = ((assetPath) => available(String(assetPath))) as typeof fs.existsSync;
  try { return run(); }
  finally { fs.existsSync = original; }
}

test("model routing maps exactly the eleven supplied web assets", () => {
  expect(modelIds.map((id) => getProjectModelPath(id))).toEqual(
    modelIds.map((id) => `/images/glb/${id}_web.glb`),
  );
});

test("model routing allowlist matches eleven existing metadata folders", () => {
  const withModels = portfolioData.filter((project) => getProjectModelPath(project.folder));
  expect(withModels.map((project) => project.id).sort()).toEqual([...modelIds].sort());
  for (const id of modelIds) {
    const projects = portfolioData.filter((project) => project.id === id);
    expect(projects).toHaveLength(1);
    expect(projects[0].folder).toBe(id);
    expect(fs.statSync(path.join(process.cwd(), "public/images/portfolio", projects[0].folder)).isDirectory()).toBe(true);
  }
});

test("model routing returns null for unlisted IDs even when files exist", () => {
  withAssetAvailability(() => true, () => {
    for (const id of ["jd002", "jd999", "../jd003", "jd003_web", "constructor", "__proto__", "toString"]) {
      expect(getProjectModelPath(id), id).toBeNull();
    }
  });
});

test("model routing returns null for a missing web asset without a legacy fallback", () => {
  withAssetAvailability((assetPath) => !assetPath.endsWith("jd003_web.glb"), () => {
    expect(getProjectModelPath("jd003")).toBeNull();
  });
});

test("home featured projects resolve web assets even without legacy GLBs", () => {
  withAssetAvailability((assetPath) => assetPath.includes(`${path.sep}images${path.sep}glb${path.sep}`), () => {
    expect(homeProjectIds()).toEqual(["jd003", "jd005_a", "jd026", "jd030"]);
  });
});

test("home featured projects omit a missing web asset despite existing legacy GLBs", () => {
  withAssetAvailability((assetPath) => !assetPath.endsWith("jd026_web.glb"), () => {
    expect(homeProjectIds()).toEqual(["jd003", "jd005_a", "jd030"]);
  });
});
