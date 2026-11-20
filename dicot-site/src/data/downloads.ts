/**
 * Vision S installers.
 *
 * Keep the ids, file names and sizes in sync with public/download.php — that
 * file re-validates everything server-side and never trusts the form.
 *
 * The ISO files are uploaded to the web root by hand; `updated` is the file's
 * Last-Modified date so the page never claims a build is newer than it is.
 */
export type VisionSBuild = {
  id: "green" | "grey";
  key: string;
  name: string;
  file: string;
  bytes: number;
  size: string;
  updated: string;
  summary: string;
  note: string;
};

export const visionSBuilds: VisionSBuild[] = [
  {
    id: "green",
    key: "Green key",
    name: "Vision S — green key",
    file: "VisionS.iso",
    bytes: 867_434_496,
    size: "827 MB",
    updated: "2025-01-02",
    summary: "Installer for sites running Vision S with a green licence key.",
    note: "Use this build with a green key.",
  },
  {
    id: "grey",
    key: "Grey key",
    name: "Vision S Version 2026 — grey key",
    file: "VisionS_Version_2026.iso",
    bytes: 1_024_167_936,
    size: "977 MB",
    updated: "2026-01-07",
    summary: "Installer for sites running Vision S Version 2026 with a grey licence key.",
    note: "Use this build with a grey key.",
  },
];

/**
 * Wording that the form, the PHP endpoint and the privacy policy must agree on.
 * Bump `consentVersion` whenever the notice text changes; it is stored with
 * every request as the consent record.
 */
export const downloadPolicy = {
  consentVersion: "2026-11-1",
  retention: "24 months from our last contact",
  linkHours: 48,
  pagePath: "/downloads/vision-s/",
  endpoint: "/download.php",
  privacyPath: "/legal/privacy/",
} as const;

export const visionSBuildById = (id: string): VisionSBuild | undefined =>
  visionSBuilds.find((build) => build.id === id);
