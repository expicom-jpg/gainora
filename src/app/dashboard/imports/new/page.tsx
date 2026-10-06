"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type OrganizationItem = {
  role: string;
  organization: { id: string; name: string; created_at: string } | null;
};

type Mapping = {
  date?: string;
  account?: string;
  description?: string;
  amount?: string;
};

type PreviewResponse = {
  filename: string;
  size: number;
  rowCount: number;
  columns: string[];
  mapping: Mapping;
  preview: Record<string, string | number | null>[];
  rows: Record<string, string | number | null>[];
  error?: string;
};

export default function NewImportPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [auditFindings, setAuditFindings] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => response.json())
      .then((data) => {
        const items = (data.organizations ?? []) as OrganizationItem[];
        setOrganizations(items);
        if (items[0]?.organization?.id) setOrganizationId(items[0].organization.id);
      })
      .catch(() => setMessage("Could not load organizations."));
  }, []);

  const completeMapping = useMemo(
    () => Boolean(mapping.date && mapping.account && mapping.description && mapping.amount),
    [mapping]
  );

  async function previewFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !organizationId) return;

    setBusy(true);
    setMessage(null);
    setAuditFindings([]);

    try {
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      formData.set("file", file);

      const response = await fetch("/api/imports/preview", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as PreviewResponse;
      if (!response.ok) throw new Error(data.error ?? "preview_failed");

      setPreview(data);
      setMapping(data.mapping ?? {});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "preview_failed");
    } finally {
      setBusy(false);
    }
  }

  async function commitAndAudit() {
    if (!preview || !completeMapping) return;

    setBusy(true);
    setMessage(null);

    try {
      const commitResponse = await fetch("/api/imports/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationId,
          filename: preview.filename,
          synthetic: true,
          mapping,
          rows: preview.rows
        })
      });

      const commitData = await commitResponse.json();
      if (!commitResponse.ok) throw new Error(commitData.error ?? "import_commit_failed");

      const auditResponse = await fetch("/api/profit-audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationId,
          importId: commitData.importId
        })
      });

      const auditData = await auditResponse.json();
      if (!auditResponse.ok) throw new Error(auditData.error ?? "profit_audit_failed");

      setAuditFindings(auditData.findings ?? []);
      setMessage(`Synthetic import committed: ${commitData.rowsCommitted} rows.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "import_failed");
    } finally {
      setBusy(false);
    }
  }

  function mappingSelect(field: keyof Mapping, value: string) {
    setMapping((current) => ({ ...current, [field]: value }));
  }

  return (
    <main>
      <h1>Financial import</h1>
      <p>This pilot flow only commits synthetic/test data while the production readiness gate is closed.</p>

      <form onSubmit={previewFile}>
        <label>
          Organization
          <select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} required>
            <option value="">Select organization</option>
            {organizations.map((item) =>
              item.organization ? (
                <option key={item.organization.id} value={item.organization.id}>
                  {item.organization.name}
                </option>
              ) : null
            )}
          </select>
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

        <button type="submit" disabled={busy || !organizationId}>
          {busy ? "Working..." : "Preview import"}
        </button>
      </form>

      {message ? <p>{message}</p> : null}

      {preview ? (
        <section>
          <h2>Column mapping</h2>
          <p>{preview.filename} — {preview.rowCount} rows</p>

          {(["date", "account", "description", "amount"] as const).map((field) => (
            <label key={field}>
              {field}
              <select
                value={mapping[field] ?? ""}
                onChange={(event) => mappingSelect(field, event.target.value)}
              >
                <option value="">Select column</option>
                {preview.columns.map((column) => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
            </label>
          ))}

          <h2>Preview</h2>
          <pre>{JSON.stringify(preview.preview, null, 2)}</pre>

          <button type="button" disabled={busy || !completeMapping} onClick={commitAndAudit}>
            Commit synthetic import and run Profit Audit
          </button>
        </section>
      ) : null}

      {auditFindings.length > 0 ? (
        <section>
          <h2>Profit Audit findings</h2>
          <ul>
            {auditFindings.map((finding, index) => (
              <li key={index}>
                <strong>{finding.title}</strong>
                <p>{finding.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
