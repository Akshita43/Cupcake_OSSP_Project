
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const PROGRAM = path.join(__dirname, "../Process_monitor");
const LOG_PATH = path.join(__dirname, "activity_log.txt");

// Read actual Linux processes
function getProcesses() {
  const processes = [];

  for (const folder of fs.readdirSync("/proc")) {
    if (!/^\d+$/.test(folder)) continue;

    try {
      const status = fs.readFileSync(`/proc/${folder}/status`, "utf8");

      const getValue = (key) => {
        const match = status.match(new RegExp(`^${key}:\\s+(.+)$`, "m"));
        return match ? match[1].trim() : "";
      };

      processes.push({
        pid: Number(folder),
        name: getValue("Name"),
        state: getValue("State"),
        ppid: Number(getValue("PPid")) || 0,
        memory: Number((getValue("VmRSS").match(/\d+/) || [0])[0])
      });
    } catch (error) {
      // Process may disappear while reading.
    }
  }

  return processes;
}

// Save activity logs
function addLog(message) {
  const time = new Date().toLocaleString();
  fs.appendFileSync(LOG_PATH, `[${time}] ${message}\n`);
}

// Process list
app.get("/api/processes", (req, res) => {
  res.json(getProcesses());
});

// Process details
app.get("/api/processes/:pid", (req, res) => {
  const pid = Number(req.params.pid);
  const process = getProcesses().find(p => p.pid === pid);

  if (!process) {
    return res.status(404).json({ error: "Process not found" });
  }

  res.json(process);
});

// System memory
app.get("/api/memory", (req, res) => {
  try {
    const data = fs.readFileSync("/proc/meminfo", "utf8");
    const total = Number(data.match(/MemTotal:\s+(\d+)/)[1]);
    const available = Number(data.match(/MemAvailable:\s+(\d+)/)[1]);

    res.json({
      total,
      used: total - available,
      percentage: Number(((total - available) / total * 100).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: "Could not read memory" });
  }
});

// Stop, resume, terminate or force-kill a process

app.post("/api/action", (req, res) => {
  const { action, pid } = req.body;
  const allowed = ["stop", "resume", "terminate", "kill"];

  if (
    !allowed.includes(action) ||
    !Number.isInteger(Number(pid)) ||
    Number(pid) <= 0
  ) {
    return res.status(400).json({ error: "Invalid action or PID" });
  }

  execFile(PROGRAM, [action, String(pid)], (error, stdout, stderr) => {
    const output = (stdout || "").trim();
    const errorOutput = (stderr || "").trim();

    if (error || errorOutput) {
      const reason = errorOutput || error.message;

      addLog(`FAILED: ${action} on PID ${pid} - ${reason}`);

      return res.status(400).json({ error: reason });
    }

    const result = output || `${action} completed`;

    addLog(`SUCCESS: ${action} on PID ${pid} - ${result}`);

    res.json({ message: result });
  });
});


// Change process priority
app.post("/api/priority", (req, res) => {
  const { pid, priority } = req.body;

  if (
    !Number.isInteger(Number(pid)) || Number(pid) <= 0 ||
    !Number.isInteger(Number(priority)) ||
    Number(priority) < -20 || Number(priority) > 19
  ) {
    return res.status(400).json({ error: "Invalid PID or priority" });
  }

  execFile(PROGRAM, ["priority", String(pid), String(priority)], (error, stdout, stderr) => {
    if (error) {
      return res.status(400).json({ error: stderr || error.message });
    }

    addLog(`Priority changed for PID ${pid} to ${priority}`);
    res.json({ message: stdout.trim() || "Priority updated" });
  });
});

// Recent activity
app.get("/api/logs", (req, res) => {
  const logs = fs.existsSync(LOG_PATH)
    ? fs.readFileSync(LOG_PATH, "utf8").split("\n").filter(Boolean).reverse().slice(0, 50)
    : [];

  res.json(logs);
});

app.listen(5000, "127.0.0.1", () => {
  console.log("Backend running at http://localhost:5000");
});
