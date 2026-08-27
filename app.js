const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

const startTime = Date.now();

app.get('/', (req, res) => {
    const hostname = os.hostname();
    const platform = `${os.platform()} (${os.arch()})`;
    const freeMemMB = Math.round(os.freemem() / (1024 * 1024));
    const totalMemMB = Math.round(os.totalmem() / (1024 * 1024));

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS ECR & ECS Fargate Architecture Guide</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #090a0f;
            --surface-1: #11131c;
            --surface-2: #181b28;
            --border-color: rgba(255, 255, 255, 0.08);
            --border-hover: rgba(255, 153, 0, 0.4);
            
            --text-primary: #f4f4f6;
            --text-secondary: #8d95a5;
            --text-tertiary: #586071;
            
            --aws-amber: #ff9900;
            --aws-amber-dim: rgba(255, 153, 0, 0.12);
            --accent-blue: #38bdf8;
            --accent-green: #10b981;
            --accent-purple: #818cf8;
            --accent-red: #f43f5e;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
            background-size: 28px 28px;
        }

        /* Container */
        .wrapper {
            max-width: 1080px;
            margin: 0 auto;
            padding: 40px 24px 80px 24px;
        }

        /* Top Navbar */
        .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            background: var(--surface-1);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-bottom: 40px;
        }

        .nav-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            font-weight: 600;
        }

        .aws-logo {
            background: var(--aws-amber);
            color: #000;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 3px 7px;
            border-radius: 4px;
        }

        .live-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.25);
            color: var(--accent-green);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
        }

        .pulse-dot {
            width: 6px;
            height: 6px;
            background-color: var(--accent-green);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--accent-green);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        /* Hero Header */
        .hero {
            margin-bottom: 44px;
        }

        .category-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: var(--aws-amber);
            margin-bottom: 10px;
            display: block;
        }

        .hero h1 {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -0.8px;
            margin-bottom: 14px;
            color: #fff;
        }

        .hero p {
            color: var(--text-secondary);
            font-size: 16px;
            max-width: 720px;
            line-height: 1.6;
        }

        /* Telemetry Banner Card */
        .telemetry-card {
            background: var(--surface-1);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 44px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .telemetry-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .telemetry-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--text-tertiary);
            font-weight: 600;
        }

        .telemetry-val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            color: var(--text-primary);
            font-weight: 500;
        }

        .telemetry-val.highlight {
            color: var(--aws-amber);
        }

        /* Section Titles */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }

        /* Architecture Workflow Diagram Grid */
        .workflow-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 48px;
        }

        @media (max-width: 850px) {
            .workflow-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 500px) {
            .workflow-grid { grid-template-columns: 1fr; }
        }

        .workflow-step {
            background: var(--surface-1);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            position: relative;
            transition: border-color 0.2s, transform 0.2s;
        }

        .workflow-step:hover {
            border-color: var(--border-hover);
            transform: translateY(-2px);
        }

        .step-index {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: var(--aws-amber);
            font-weight: 600;
            margin-bottom: 8px;
        }

        .workflow-step h3 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 6px;
            color: #fff;
        }

        .workflow-step p {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        /* Modules Comparison Section */
        .modules-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 48px;
        }

        @media (max-width: 850px) {
            .modules-grid { grid-template-columns: 1fr; }
        }

        .module-card {
            background: var(--surface-1);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            display: flex;
            flex-direction: column;
        }

        .module-badge {
            align-self: flex-start;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 3px 8px;
            border-radius: 4px;
            margin-bottom: 14px;
        }

        .badge-ecr { background: rgba(56, 189, 248, 0.12); color: var(--accent-blue); }
        .badge-ecs { background: var(--aws-amber-dim); color: var(--aws-amber); }
        .badge-fargate { background: rgba(129, 140, 248, 0.12); color: var(--accent-purple); }

        .module-card h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .module-card p {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 18px;
        }

        .specs-list {
            list-style: none;
            margin-top: auto;
        }

        .specs-list li {
            font-size: 13px;
            color: var(--text-secondary);
            padding: 6px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .specs-list li::before {
            content: '•';
            color: var(--aws-amber);
            font-weight: bold;
        }

        /* CLI Interactive Terminal Section */
        .terminal-container {
            background: #0d0e14;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 48px;
        }

        .terminal-header {
            background: #141620;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-color);
        }

        .terminal-tabs {
            display: flex;
            gap: 6px;
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 500;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s;
        }

        .tab-btn:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
            color: var(--aws-amber);
            background: rgba(255, 153, 0, 0.12);
            font-weight: 600;
        }

        .copy-btn {
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: var(--text-secondary);
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.15s;
        }

        .copy-btn:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.15);
        }

        .terminal-body {
            padding: 20px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            line-height: 1.7;
            overflow-x: auto;
        }

        .c-comment { color: #525866; }
        .c-cmd { color: #f4f4f6; }
        .c-var { color: var(--aws-amber); }
        .c-flag { color: var(--accent-blue); }

        /* Gotchas & Checklist Section */
        .gotchas-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 48px;
        }

        @media (max-width: 850px) {
            .gotchas-grid { grid-template-columns: 1fr; }
        }

        .gotcha-card {
            background: var(--surface-1);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
        }

        .gotcha-tag {
            font-size: 11px;
            font-weight: 700;
            color: var(--accent-red);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
            display: block;
        }

        .gotcha-card h4 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .gotcha-card p {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            border-top: 1px solid var(--border-color);
            padding-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--text-tertiary);
            font-size: 12px;
        }
    </style>
</head>
<body>

    <div class="wrapper">
        
        <!-- Top Navbar -->
        <nav class="navbar">
            <div class="nav-brand">
                <span class="aws-logo">AWS</span>
                <span>ECR &amp; ECS Fargate Guide</span>
            </div>
            <div class="live-tag">
                <span class="pulse-dot"></span>
                <span>Fargate Active</span>
            </div>
        </nav>

        <!-- Hero Header -->
        <header class="hero">
            <span class="category-label">Beginner Tutorial Demo</span>
            <h1>AWS ECR &amp; ECS Deployment Guide</h1>
            <p>
                A high-level architectural walkthrough for containerizing a Node.js web application, storing Docker images in AWS ECR, and orchestrating serverless tasks on AWS ECS Fargate.
            </p>
        </header>

        <!-- Live Telemetry Card -->
        <div class="telemetry-card">
            <div class="telemetry-item">
                <span class="telemetry-label">Container Task ID</span>
                <span class="telemetry-val highlight">${hostname}</span>
            </div>
            <div class="telemetry-item">
                <span class="telemetry-label">Launch Type</span>
                <span class="telemetry-val">AWS Fargate (Serverless)</span>
            </div>
            <div class="telemetry-item">
                <span class="telemetry-label">Platform OS</span>
                <span class="telemetry-val">${platform}</span>
            </div>
            <div class="telemetry-item">
                <span class="telemetry-label">Uptime</span>
                <span class="telemetry-val" id="uptime-display">0s</span>
            </div>
        </div>

        <!-- Section 1: Architecture Pipeline -->
        <div class="section-header">
            <h2 class="section-title">Deployment Pipeline Architecture</h2>
        </div>

        <div class="workflow-grid">
            <div class="workflow-step">
                <div class="step-index">01 / DOCKERIZE</div>
                <h3>Build Image</h3>
                <p>Create <code>Dockerfile</code> to bundle application code &amp; runtime dependencies.</p>
            </div>
            <div class="workflow-step">
                <div class="step-index">02 / REGISTRY</div>
                <h3>Push to ECR</h3>
                <p>Authenticate AWS CLI and upload tagged image to Elastic Container Registry.</p>
            </div>
            <div class="workflow-step">
                <div class="step-index">03 / BLUEPRINT</div>
                <h3>Task Definition</h3>
                <p>Define CPU (0.25 vCPU), RAM (0.5 GB), port mappings, and ECR image URI.</p>
            </div>
            <div class="workflow-step">
                <div class="step-index">04 / ORCHESTRATE</div>
                <h3>ECS Service</h3>
                <p>Deploy 24/7 self-healing container task on AWS Fargate infrastructure.</p>
            </div>
        </div>

        <!-- Section 2: Core Concepts -->
        <div class="section-header">
            <h2 class="section-title">Core AWS Services Overview</h2>
        </div>

        <div class="modules-grid">
            
            <div class="module-card">
                <span class="module-badge badge-ecr">Storage Registry</span>
                <h3>AWS ECR</h3>
                <p>Fully managed private Docker container registry offering secure storage and image scanning.</p>
                <ul class="specs-list">
                    <li>Private Image Repositories</li>
                    <li>Vulnerability Image Scanning</li>
                    <li>IAM Access Control Policies</li>
                </ul>
            </div>

            <div class="module-card">
                <span class="module-badge badge-ecs">Orchestrator</span>
                <h3>AWS ECS</h3>
                <p>Fast, highly scalable container management service to run and maintain container fleets.</p>
                <ul class="specs-list">
                    <li>Clusters &amp; Task Definitions</li>
                    <li>Service Auto-Healing</li>
                    <li>Load Balancer Integration</li>
                </ul>
            </div>

            <div class="module-card">
                <span class="module-badge badge-fargate">Serverless Compute</span>
                <h3>AWS Fargate</h3>
                <p>Serverless compute engine for ECS that eliminates the need to provision or manage EC2 servers.</p>
                <ul class="specs-list">
                    <li>No EC2 Node Management</li>
                    <li>Pay-per-second Resource Billing</li>
                    <li>Seamless Elastic Scaling</li>
                </ul>
            </div>

        </div>

        <!-- Section 3: Interactive CLI Snippets -->
        <div class="section-header">
            <h2 class="section-title">CLI Command Cheat Sheet</h2>
        </div>

        <div class="terminal-container">
            <div class="terminal-header">
                <div class="terminal-tabs">
                    <button class="tab-btn active" onclick="switchTab('login', event)">1. ECR Login</button>
                    <button class="tab-btn" onclick="switchTab('build', event)">2. Docker Build</button>
                    <button class="tab-btn" onclick="switchTab('tag', event)">3. Docker Tag</button>
                    <button class="tab-btn" onclick="switchTab('push', event)">4. ECR Push</button>
                </div>
                <button class="copy-btn" onclick="copyCurrentCode()">Copy Command</button>
            </div>
            <div class="terminal-body" id="terminal-content">
                <!-- Injected by JS -->
            </div>
        </div>

        <!-- Section 4: Critical Gotchas -->
        <div class="section-header">
            <h2 class="section-title">Essential Beginner Gotchas</h2>
        </div>

        <div class="gotchas-grid">
            <div class="gotcha-card">
                <span class="gotcha-tag">Architecture Flag</span>
                <h4>Apple Silicon M1/M2/M3</h4>
                <p>Pass <code>--platform linux/amd64</code> during <code>docker build</code> to avoid container exit crashes on x86 Fargate.</p>
            </div>
            <div class="gotcha-card">
                <span class="gotcha-tag">Networking</span>
                <h4>Security Group Ports</h4>
                <p>Ensure inbound rules allow TCP traffic on Port <code>3000</code> or <code>80</code> from source <code>0.0.0.0/0</code>.</p>
            </div>
            <div class="gotcha-card">
                <span class="gotcha-tag">Fargate VPC</span>
                <h4>Auto-Assign Public IP</h4>
                <p>Must be set to <code>ENABLED</code> on public subnets so Fargate tasks can pull images directly from ECR.</p>
            </div>
        </div>

        <!-- Footer -->
        <footer class="footer">
            <span>AWS ECR &amp; ECS Beginner Tutorial Demo</span>
            <span>Running live inside Docker Container</span>
        </footer>

    </div>

    <script>
        // Live Uptime Ticker
        const serverStartTime = ${startTime};
        function updateUptime() {
            const diff = Math.floor((Date.now() - serverStartTime) / 1000);
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            document.getElementById('uptime-display').innerText = (m > 0 ? m + 'm ' : '') + s + 's';
        }
        setInterval(updateUptime, 1000);
        updateUptime();

        // Terminal Code Snippets
        const snippets = {
            login: '<span class="c-comment"># 1. Authenticate local Docker client to AWS ECR</span>\\n<span class="c-cmd">aws ecr get-login-password <span class="c-flag">--region us-east-1</span> | docker login <span class="c-flag">--username AWS --password-stdin</span> <span class="c-var">123456789012</span>.dkr.ecr.us-east-1.amazonaws.com</span>',
            build: '<span class="c-comment"># 2. Build image for x86_64 architecture (Fargate compatibility)</span>\\n<span class="c-cmd">docker build <span class="c-flag">--platform linux/amd64</span> <span class="c-flag">-t</span> <span class="c-var">ecs-demo-app</span> .</span>',
            tag: '<span class="c-comment"># 3. Tag local image with full AWS ECR Repository URI</span>\\n<span class="c-cmd">docker tag <span class="c-var">ecs-demo-app:latest</span> <span class="c-var">123456789012</span>.dkr.ecr.us-east-1.amazonaws.com/<span class="c-var">ecs-demo-app:latest</span></span>',
            push: '<span class="c-comment"># 4. Push tagged image to AWS ECR</span>\\n<span class="c-cmd">docker push <span class="c-var">123456789012</span>.dkr.ecr.us-east-1.amazonaws.com/<span class="c-var">ecs-demo-app:latest</span></span>'
        };

        let currentTabKey = 'login';

        function switchTab(key, event) {
            currentTabKey = key;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            renderCode();
        }

        function renderCode() {
            document.getElementById('terminal-content').innerHTML = snippets[currentTabKey].replace(/\\\\n/g, '<br>');
        }

        function copyCurrentCode() {
            const rawText = snippets[currentTabKey]
                .replace(/<[^>]*>/g, '')
                .replace(/\\\\n/g, '\\n')
                .replace(/#.*\\n/g, '');
            navigator.clipboard.writeText(rawText.trim());
            alert('Command copied to clipboard!');
        }

        renderCode();
    </script>

</body>
</html>
    `);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
