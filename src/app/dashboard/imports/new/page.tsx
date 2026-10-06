"use client";

import { FormEvent, useState } from "react";

type PreviewResponse = {
  filename: string;
  size: number;
  rowCount: number;
  columns: string[];
  preview: Record<string, unknown>[];
  error?: string;
};

export default function NewImportPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PreviewResponse | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !organizationId) return;

    setBusy(true);
    setResult(null);

    const formData = new FormData();
    formData.set("organizationId", organizationId);
    formData.set("file", file);

    const response = await fetch("/api/imports/preview", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as PreviewResponse;
    setResult(data);
    setBusy(false);
  }

  return (
    <main>
      <h1>New financial import</h1>
      <p>Preview validates the file without persisting financial rows.</p>

      <form onSubmit={onSubmit}>
        <label>
          Organization ID
          <input
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            required
          />
        </label>

        <label>
          CSV or XLSX file
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? "Validating..." : "Preview import"}
        </button>
      </form>

      {result?.error ? <p role="alert">{result.error}</p> : null}

      {result && !result.error ? (
        <section>
          <h2>Preview</h2>
          <p>{result.filename} — {result.rowCount} rows</p>
          <p>Columns: {result.columns.join(", ")}</p>
          <pre>{JSON.stringify(result.preview, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}
