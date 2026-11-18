# Linux Process Monitoring & Control System

## 📌 Project Overview

The **Linux Process Monitoring & Control System** is an operating system-based project developed to monitor and manage running processes in a Linux environment.

The system provides a web-based dashboard that allows users to view process information, monitor CPU and memory usage, and perform process management operations.

It combines Linux system-level programming with a web-based frontend and backend to provide an interactive process monitoring experience.

## 🎯 Objectives

- To understand Linux process management.
- To monitor running processes in real time.
- To display CPU and memory utilization.
- To perform process management operations.
- To understand communication between frontend, backend, and the Linux operating system.

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Operating System | Ubuntu Linux |
| Frontend | React.js, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| System Programming | C |
| Process Information | Linux `/proc` filesystem |

## ✨ Features

- **Process Monitoring:** View currently running processes.
- **Process Search:** Search for specific processes.
- **Process Details:** View detailed process information.
- **CPU Monitoring:** Monitor CPU utilization.
- **Memory Monitoring:** View memory usage.
- **Process Control:** Perform process management operations.
- **Priority Management:** Manage process priorities.
- **Activity Logging:** Maintain process and activity logs.
- **Interactive Dashboard:** Access process information through a web interface.

## 🏗️ Project Architecture

The project consists of three main components:

1. **Frontend:** React-based dashboard for displaying process information and interacting with the system.
2. **Backend:** Node.js and Express.js server that handles requests and communicates with the system-level components.
3. **System Module:** C program that works with Linux process information and management facilities.

## 📂 Project Structure

```text
Cupcake_OSSP_Project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   └── Backend source files
│
├── Process_monitor.c
├── Process_monitor
├── process_log.txt
├── activity_log.txt
└── README.md
```

## ⚙️ Installation and Execution

### Prerequisites

- Ubuntu Linux
- GCC Compiler
- Node.js
- npm
- Visual Studio Code (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/Akshita43/Cupcake_OSSP_Project.git
```

```bash
cd Cupcake_OSSP_Project
```

### 2. Compile the C Program

```bash
gcc Process_monitor.c -o Process_monitor
```

### 3. Run the C Program

```bash
./Process_monitor
```

### 4. Start the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Start the backend using the start script configured in `package.json`.

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal to access the dashboard.

## 🎓 Learning Outcomes

- Understanding Linux process management.
- Learning system programming using C.
- Working with the Linux `/proc` filesystem.
- Understanding frontend and backend integration.
- Learning Node.js and React.js.
- Understanding CPU and memory monitoring.
- Gaining practical experience with Git and GitHub.

## 👩‍💻 Contributors

**Team 9**

Developed as part of the Operating Systems and System Programming (OSSP) course.

## 📜 License

This project is developed for academic and educational purposes.
