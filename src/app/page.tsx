'use client';

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type TestStatus = "pending" | "pass" | "fail";

type TestCase = {
  id: string;
  title: string;
  description: string;
  expected: string;
  status: TestStatus;
  lastRun?: string;
};

type FilterOption = "all" | TestStatus;
type TestStats = { total: number } & Record<TestStatus, number>;

const defaultTests: TestCase[] = [
  {
    id: "auth-flow",
    title: "Authentication Flow",
    description:
      "Validate that a new user can register, receive a confirmation email, and sign in successfully.",
    expected:
      "User lands on dashboard with a welcome toast and access token stored.",
    status: "pending",
  },
  {
    id: "payments",
    title: "Payment Capture",
    description:
      "Charge an existing customer for a saved card using the hosted checkout form.",
    expected: "Charge completes with status `succeeded` in Stripe dashboard.",
    status: "pass",
    lastRun: "2024-04-08 14:12",
  },
  {
    id: "webhooks",
    title: "Webhook Retries",
    description:
      "Force a webhook to fail once and confirm the retry logic delivers the payload on the second attempt.",
    expected: "Delivery log shows two attempts and final status `delivered`.",
    status: "fail",
    lastRun: "2024-04-07 09:34",
  },
];

export default function Home() {
  const [tests, setTests] = useState<TestCase[]>(defaultTests);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expected, setExpected] = useState("");

  const filteredTests = useMemo(() => {
    if (filter === "all") {
      return tests;
    }
    return tests.filter((test) => test.status === filter);
  }, [tests, filter]);

  const stats = useMemo<TestStats>(() => {
    return tests.reduce<TestStats>(
      (acc, test) => {
        acc.total += 1;
        acc[test.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, pass: 0, fail: 0 },
    );
  }, [tests]);

  const handleAddTest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newTest: TestCase = {
      id: `${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "No description provided.",
      expected: expected.trim() || "No expected result documented.",
      status: "pending",
    };

    setTests((current) => [newTest, ...current]);
    setTitle("");
    setDescription("");
    setExpected("");
    setFilter("all");
  };

  const handleUpdateStatus = (id: string, status: TestStatus) => {
    setTests((current) =>
      current.map((test) =>
        test.id === id
          ? {
              ...test,
              status,
              lastRun: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : test,
      ),
    );
  };

  const handleRemove = (id: string) => {
    setTests((current) => current.filter((test) => test.id !== id));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <h1>Test Run Control Center</h1>
            <p>
              Track manual regression passes, capture notes, and keep your team
              on the same page for the next deployment window.
            </p>
          </div>
          <div className={styles.metrics}>
            <div>
              <span>Total</span>
              <strong>{stats.total}</strong>
            </div>
            <div className={styles.pass}>
              <span>Passing</span>
              <strong>{stats.pass}</strong>
            </div>
            <div className={styles.pending}>
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
            <div className={styles.fail}>
              <span>Failing</span>
              <strong>{stats.fail}</strong>
            </div>
          </div>
        </section>

        <section className={styles.content}>
          <form className={styles.form} onSubmit={handleAddTest}>
            <h2>Create a Quick Test</h2>
            <div className={styles.field}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                placeholder="Checkout smoke test"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="description">Steps & Notes</label>
              <textarea
                id="description"
                name="description"
                placeholder="1. Open checkout\n2. Submit card 4242 4242 4242 4242\n3. Confirm success toast"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="expected">Expected Result</label>
              <textarea
                id="expected"
                name="expected"
                placeholder="Payment appears in dashboard under latest charges."
                rows={2}
                value={expected}
                onChange={(event) => setExpected(event.target.value)}
              />
            </div>
            <div className={styles.formFooter}>
              <button type="submit">Add Test</button>
            </div>
          </form>

          <div className={styles.testsPanel}>
            <header className={styles.testsHeader}>
              <h2>Active Test Suite</h2>
              <div className={styles.filters}>
                {(["all", "pending", "pass", "fail"] as FilterOption[]).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={
                        filter === option ? styles.filterActive : undefined
                      }
                    >
                      {option === "all"
                        ? "All"
                        : option === "pass"
                          ? "Pass"
                          : option === "fail"
                            ? "Fail"
                            : "Pending"}
                    </button>
                  ),
                )}
              </div>
            </header>

            {filteredTests.length === 0 ? (
              <p className={styles.emptyState}>
                No tests match the current filter. Add a new one or toggle the
                view.
              </p>
            ) : (
              <ul className={styles.testList}>
                {filteredTests.map((test) => (
                  <li key={test.id} className={styles.testCard}>
                    <div className={styles.testHeader}>
                      <div>
                        <span
                          className={`${styles.badge} ${
                            styles[`badge-${test.status}`]
                          }`}
                        >
                          {test.status.toUpperCase()}
                        </span>
                        <h3>{test.title}</h3>
                      </div>
                      <button
                        type="button"
                        className={styles.delete}
                        onClick={() => handleRemove(test.id)}
                        aria-label={`Remove ${test.title}`}
                      >
                        ×
                      </button>
                    </div>
                    <p className={styles.description}>{test.description}</p>
                    <div className={styles.expected}>
                      <span>Expected</span>
                      <p>{test.expected}</p>
                    </div>
                    <footer className={styles.testFooter}>
                      <div className={styles.timestamp}>
                        {test.lastRun ? (
                          <span>Last run {test.lastRun}</span>
                        ) : (
                          <span>Not run yet</span>
                        )}
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(test.id, "pending")}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(test.id, "pass")}
                        >
                          Mark Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(test.id, "fail")}
                        >
                          Mark Fail
                        </button>
                      </div>
                    </footer>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
