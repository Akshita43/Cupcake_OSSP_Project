
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [processes, setProcesses] = useState([]);
  const [memory, setMemory] = useState(null);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [processResponse, memoryResponse, logsResponse] =
        await Promise.all([
          fetch(`${API}/processes`),
          fetch(`${API}/memory`),
          fetch(`${API}/logs`)
        ]);

      if (!processResponse.ok || !memoryResponse.ok || !logsResponse.ok) {
        throw new Error("Could not load dashboard data");
      }

      const processData = await processResponse.json();
      const memoryData = await memoryResponse.json();
      const logsData = await logsResponse.json();

      setProcesses(processData);
      setMemory(memoryData);
      setLogs(logsData);
      setLoading(false);
    } catch (error) {
      setMessage("Cannot connect to backend. Make sure server.js is running.");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 3000);
    return () => clearInterval(timer);
  }, []);

  async function controlProcess(pid, action) {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} process ${pid}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid, action })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setMessage(result.message);
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changePriority(pid) {
    const value = window.prompt(
      "Enter priority between -20 and 19:",
      "0"
    );

    if (value === null) return;

    const priority = Number(value);

    if (!Number.isInteger(priority) || priority < -20 || priority > 19) {
      setMessage("Enter a valid priority between -20 and 19.");
      return;
    }

    try {
      const response = await fetch(`${API}/priority`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid, priority })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setMessage(result.message);
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(search.toLowerCase()) ||
    String(process.pid).includes(search)
  );

  const runningCount = processes.filter(
    (process) => process.state.startsWith("R")
  ).length;

  const sleepingCount = processes.filter(
    (process) => process.state.startsWith("S")
  ).length;

  function formatMemory(kb) {
    if (kb >= 1024 * 1024) {
      return `${(kb / (1024 * 1024)).toFixed(2)} GB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <h2>Process<span>Monitor</span></h2>
            <small>Linux System Dashboard</small>
          </div>
        </div>

        <nav>
          <a className="nav-link active" href="#overview">▦ Overview</a>
          <a className="nav-link" href="#processes">▤ Processes</a>
          <a className="nav-link" href="#memory">▥ Memory</a>
          <a className="nav-link" href="#logs">◷ Activity Logs</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <span>Linux backend</span>
          <small>Connected when API responds</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Monitor and manage your Linux processes.</p>
          </div>

          <button className="refresh-btn" onClick={loadData}>
            ↻ Refresh
          </button>
        </header>

        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <section id="overview" className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Processes</p>
            <h2>{processes.length}</h2>
            <small>Detected in Linux /proc</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">▶</div>
            <p>Running Processes</p>
            <h2>{runningCount}</h2>
            <small>Currently running</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Sleeping Processes</p>
            <h2>{sleepingCount}</h2>
            <small>Waiting or sleeping</small>
          </div>

          <div className="stat-card" id="memory">
            <div className="stat-icon blue">▥</div>
            <p>Memory Usage</p>
            <h2>{memory ? `${memory.percentage}%` : "--"}</h2>
            <small>
              {memory
                ? `${formatMemory(memory.used)} used of ${formatMemory(memory.total)}`
                : "Loading memory..."}
            </small>
          </div>
        </section>

        <section id="processes" className="panel">
          <div className="panel-heading">
            <div>
              <h2>Process Management</h2>
              <p>Live process information from your Linux system</p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search name or PID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <p className="empty">Loading processes...</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PID</th>
                    <th>Process Name</th>
                    <th>State</th>
                    <th>Parent PID</th>
                    <th>Memory</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProcesses.slice(0, 100).map((process) => (
                    <tr key={process.pid}>
                      <td>{process.pid}</td>
                      <td className="process-name">{process.name}</td>
                      <td>
                        <span className="state-tag">{process.state}</span>
                      </td>
                      <td>{process.ppid}</td>
                      <td>{formatMemory(process.memory)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={() => setSelected(process)}
                          >
                            View
                          </button>

                          <button
                            className="stop-btn"
                            onClick={() => controlProcess(process.pid, "stop")}
                          >
                            Stop
                          </button>

                          <button
                            className="resume-btn"
                            onClick={() => controlProcess(process.pid, "resume")}
                          >
                            Resume
                          </button>

                          <button
                            className="priority-btn"
                            onClick={() => changePriority(process.pid)}
                          >
                            Priority
                          </button>

                          <button
                            className="terminate-btn"
                            onClick={() => controlProcess(process.pid, "terminate")}
                          >
                            Terminate
                          </button>

                          <button
                            className="kill-btn"
                            onClick={() => controlProcess(process.pid, "kill")}
                          >
                            Kill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProcesses.length === 0 && (
                <p className="empty">No matching processes found.</p>
              )}

              {filteredProcesses.length > 100 && (
                <p className="table-note">
                  Showing the first 100 matching processes.
                </p>
              )}
            </div>
          )}
        </section>

        <section id="logs" className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Actions recorded by the backend</p>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="empty">No activity recorded yet.</p>
          ) : (
            <div className="logs-list">
              {logs.map((log, index) => (
                <div className="log-item" key={index}>
                  <span className="log-dot"></span>
                  {log}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer>
          Linux Process Monitoring and Control System
        </footer>
      </main>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              ×
            </button>

            <h2>Process Details</h2>
            <p><strong>PID:</strong> {selected.pid}</p>
            <p><strong>Name:</strong> {selected.name}</p>
            <p><strong>State:</strong> {selected.state}</p>
            <p><strong>Parent PID:</strong> {selected.ppid}</p>
            <p><strong>Memory:</strong> {formatMemory(selected.memory)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
