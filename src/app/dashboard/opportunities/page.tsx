"use client";

import { FormEvent, useEffect, useState } from "react";

type OrganizationItem = {
  organization: { id: string; name: string } | null;
};

type Finding = {
  id: string;
  title: string;
  description: string;
  status: string;
  estimated_annual_value: number | null;
};

export default function OpportunitiesPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const [title, setTitle] = useState("");
  const [baselineValue, setBaselineValue] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [attributedValue, setAttributedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => response.json())
      .then((data) => {
        const items = (data.organizations ?? []) as OrganizationItem[];
        setOrganizations(items);
        if (items[0]?.organization?.id) setOrganizationId(items[0].organization.id);
      });
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    loadFindings();
  }, [organizationId]);

  async function loadFindings() {
    const response = await fetch("/api/findings?organizationId=" + encodeURIComponent(organizationId));
    const data = await response.json();
    if (response.ok) setFindings(data.findings ?? []);
  }

  async function setStatus(findingId: string, status: "approved" | "rejected") {
    const response = await fetch("/api/findings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ findingId, organizationId, status })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "finding_update_failed");
      return;
    }

    setMessage("Opportunity updated.");
    await loadFindings();
  }

  async function recordResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        organizationId,
        findingId: selectedFindingId,
        title,
        baselineValue: baselineValue === "" ? undefined : Number(baselineValue),
        resultValue: resultValue === "" ? undefined : Number(resultValue),
        attributedValue: attributedValue === "" ? undefined : Number(attributedValue),
        notes
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "result_create_failed");
      return;
    }

    setMessage("Result and attributed value documented.");
    setTitle("");
    setBaselineValue("");
    setResultValue("");
    setAttributedValue("");
    setNotes("");
    await loadFindings();
  }

  return (
    <main>
      <h1>Opportunities & Results</h1>

      <label>
        Organization
        <select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>
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

      {message ? <p>{message}</p> : null}

      <section>
        <h2>Profit Audit Opportunities</h2>
        <ul>
          {findings.map((finding) => (
            <li key={finding.id}>
              <strong>{finding.title}</strong> — {finding.status}
              <p>{finding.description}</p>
              {finding.status === "identified" ? (
                <>
                  <button type="button" onClick={() => setStatus(finding.id, "approved")}>Approve</button>
                  <button type="button" onClick={() => setStatus(finding.id, "rejected")}>Reject</button>
                </>
              ) : null}
              {finding.status === "approved" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFindingId(finding.id);
                    setTitle(finding.title);
                  }}
                >
                  Document result
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {selectedFindingId ? (
        <section>
          <h2>Result / Value Attribution</h2>
          <form onSubmit={recordResult}>
            <label>
              Result title
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              Baseline value
              <input type="number" step="0.01" value={baselineValue} onChange={(event) => setBaselineValue(event.target.value)} />
            </label>
            <label>
              Result value
              <input type="number" step="0.01" value={resultValue} onChange={(event) => setResultValue(event.target.value)} />
            </label>
            <label>
              Value attributed to Gainora
              <input type="number" step="0.01" value={attributedValue} onChange={(event) => setAttributedValue(event.target.value)} />
            </label>
            <label>
              Documentation
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
            <button type="submit">Save documented result</button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
