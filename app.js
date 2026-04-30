const trackerData = window.TRACKER_DATA || {
  reportingWeek: "",
  deckName: "",
  projects: [],
  blockers: [],
  highlights: [],
  metrics: [],
  jiraRows: [],
  briefPath: "outputs/leadership_brief.md",
};

const projectHeaders = [
  "Reporting Week",
  "Workstream",
  "Project",
  "Status",
  "Owner",
  "Target Date",
  "This Week Update",
  "Next Milestone",
  "Business Impact",
  "Blocker or Risk",
  "Leadership Ask",
  "Help Needed",
  "Jira Key/Epic",
  "Jira URL",
  "Source Slide",
  "Source Deck",
  "Last Updated",
];

const defaultStatuses = ["Completed", "On Track", "Monitoring", "At Risk", "Blocked", "Upcoming"];
const askOptions = ["No", "Yes", "Review"];
const storageKey = `fulfillment-tracker:${trackerData.reportingWeek || "current"}`;

const baseProjects = (trackerData.projects || []).map((row, index) => normalizeProject(row, index, "deck"));
const highlights = (trackerData.highlights || []).map((row, index) => normalizeHighlight(row, index));
const metrics = (trackerData.metrics || []).map((row, index) => normalizeMetric(row, index));
const jiraRows = (trackerData.jiraRows || []).filter((row) => row["Issue Key"]).map((row, index) => normalizeJira(row, index));

const localState = loadLocalState();
const state = {
  activeView: localState.activeView || "projects",
  selectedProjectId: localState.selectedProjectId || "",
  selectedHighlightId: localState.selectedHighlightId || (highlights[0] && highlights[0].id) || "",
  selectedMetricId: localState.selectedMetricId || (metrics[0] && metrics[0].id) || "",
  selectedJiraId: localState.selectedJiraId || (jiraRows[0] && jiraRows[0].id) || "",
  search: "",
  workstreamFilter: "all",
  statusFilter: "all",
  attentionOnly: false,
};

const elements = {
  sidebarWeek: document.getElementById("sidebarWeek"),
  sidebarDeck: document.getElementById("sidebarDeck"),
  workstreamSummary: document.getElementById("workstreamSummary"),
  statusSummary: document.getElementById("statusSummary"),
  metricsGrid: document.getElementById("metricsGrid"),
  attentionList: document.getElementById("attentionList"),
  attentionCount: document.getElementById("attentionCount"),
  searchInput: document.getElementById("searchInput"),
  workstreamFilter: document.getElementById("workstreamFilter"),
  statusFilter: document.getElementById("statusFilter"),
  attentionOnly: document.getElementById("attentionOnly"),
  primaryList: document.getElementById("primaryList"),
  detailPane: document.getElementById("detailPane"),
  mainEyebrow: document.getElementById("mainEyebrow"),
  mainTitle: document.getElementById("mainTitle"),
  resultCount: document.getElementById("resultCount"),
  openBrief: document.getElementById("openBrief"),
  exportCsv: document.getElementById("exportCsv"),
  updateDialog: document.getElementById("updateDialog"),
  updateForm: document.getElementById("updateForm"),
  openUpdateDialog: document.getElementById("openUpdateDialog"),
  closeUpdateDialog: document.getElementById("closeUpdateDialog"),
  cancelUpdateDialog: document.getElementById("cancelUpdateDialog"),
  newWorkstream: document.getElementById("newWorkstream"),
  newStatus: document.getElementById("newStatus"),
  newAsk: document.getElementById("newAsk"),
};

init();

function init() {
  elements.sidebarWeek.textContent = trackerData.reportingWeek || "Not set";
  elements.sidebarDeck.textContent = trackerData.deckName || "No deck loaded";
  elements.openBrief.href = `./${trackerData.briefPath || "outputs/leadership_brief.md"}`;
  ensureSelections();
  populateFilters();
  bindEvents();
  render();
}

function bindEvents() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      localState.activeView = state.activeView;
      persistLocalState();
      render();
    });
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderPrimaryList();
  });

  elements.workstreamFilter.addEventListener("change", (event) => {
    state.workstreamFilter = event.target.value;
    renderPrimaryList();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderPrimaryList();
  });

  elements.attentionOnly.addEventListener("change", (event) => {
    state.attentionOnly = event.target.checked;
    renderPrimaryList();
  });

  elements.openUpdateDialog.addEventListener("click", () => {
    elements.updateForm.reset();
    elements.newStatus.value = "On Track";
    elements.newAsk.value = "No";
    elements.updateDialog.showModal();
  });

  [elements.closeUpdateDialog, elements.cancelUpdateDialog].forEach((button) => {
    button.addEventListener("click", () => elements.updateDialog.close());
  });

  elements.updateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.updateForm);
    const now = new Date().toISOString().slice(0, 10);
    const manualProject = {
      id: `manual-${Date.now()}`,
      reportingWeek: trackerData.reportingWeek || now,
      workstream: String(formData.get("workstream") || ""),
      project: String(formData.get("project") || "").trim(),
      status: String(formData.get("status") || "On Track"),
      owner: String(formData.get("owner") || "").trim(),
      targetDate: String(formData.get("targetDate") || "").trim(),
      update: String(formData.get("update") || "").trim(),
      nextMilestone: "",
      impact: String(formData.get("impact") || "").trim(),
      risk: String(formData.get("risk") || "").trim(),
      ask: String(formData.get("ask") || "No"),
      help: String(formData.get("help") || "").trim(),
      jiraKey: String(formData.get("jiraKey") || "").trim(),
      jiraUrl: "",
      sourceSlide: "Manual",
      sourceDeck: "",
      lastUpdated: now,
      sourceType: "manual",
    };

    localState.manualProjects.unshift(manualProject);
    state.selectedProjectId = manualProject.id;
    state.activeView = "projects";
    localState.selectedProjectId = manualProject.id;
    localState.activeView = "projects";
    persistLocalState();
    populateFilters();
    elements.updateDialog.close();
    render();
  });

  elements.exportCsv.addEventListener("click", exportProjectsCsv);
}

function populateFilters() {
  const workstreams = getWorkstreams();
  elements.workstreamFilter.innerHTML = [
    `<option value="all">All workstreams</option>`,
    ...workstreams.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`),
  ].join("");
  elements.workstreamFilter.value = workstreams.includes(state.workstreamFilter) ? state.workstreamFilter : "all";

  const statuses = getStatuses();
  elements.statusFilter.innerHTML = [
    `<option value="all">All statuses</option>`,
    ...statuses.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`),
  ].join("");
  elements.statusFilter.value = statuses.includes(state.statusFilter) ? state.statusFilter : "all";

  elements.newWorkstream.innerHTML = getWorkstreams().map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("");
  elements.newStatus.innerHTML = defaultStatuses.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("");
  elements.newAsk.innerHTML = askOptions.map((item) => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join("");
}

function render() {
  ensureSelections();
  renderNav();
  renderDashboardMetrics();
  renderAttentionQueue();
  renderSidebarSummary();
  renderPrimaryList();
  renderDetailPane();
}

function renderNav() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });
}

function renderDashboardMetrics() {
  const allProjects = getProjects();
  const attention = allProjects.filter(isAttentionProject).length;
  const completed = allProjects.filter((item) => item.status === "Completed").length;
  const onTrack = allProjects.filter((item) => item.status === "On Track").length;
  const cards = [
    { label: "Projects", value: allProjects.length, note: `${onTrack} on track`, tone: "neutral" },
    { label: "Leadership asks", value: attention, note: "active attention", tone: attention ? "risk" : "ready" },
    { label: "Completed", value: completed, note: "closed updates", tone: "ready" },
    { label: "Business highlights", value: highlights.length, note: `${metrics.length} metrics`, tone: "progress" },
  ];

  elements.metricsGrid.innerHTML = cards.map((card) => `
    <article class="metric-card">
      <span class="pill ${card.tone}">${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(String(card.value))}</strong>
      <small>${escapeHtml(card.note)}</small>
    </article>
  `).join("");
}

function renderAttentionQueue() {
  const attentionItems = getProjects()
    .filter(isAttentionProject)
    .sort((a, b) => severityScore(b) - severityScore(a))
    .slice(0, 8);
  elements.attentionCount.textContent = String(attentionItems.length);
  elements.attentionList.innerHTML = attentionItems.length ? attentionItems.map((project) => `
    <button class="attention-item ${project.id === state.selectedProjectId ? "active" : ""}" data-project-id="${escapeAttribute(project.id)}">
      <div class="attention-copy">
        <strong>${escapeHtml(project.project)}</strong>
        <p>${escapeHtml(project.risk || project.help || project.update || "Needs review.")}</p>
      </div>
      <span class="pill ${statusPillClass(project.status)}">${escapeHtml(project.status)}</span>
    </button>
  `).join("") : `<div class="empty-state">No leadership attention items.</div>`;

  elements.attentionList.querySelectorAll(".attention-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "projects";
      state.selectedProjectId = button.dataset.projectId;
      localState.activeView = state.activeView;
      localState.selectedProjectId = state.selectedProjectId;
      persistLocalState();
      render();
    });
  });
}

function renderSidebarSummary() {
  const allProjects = getProjects();
  const workstreams = getWorkstreams();
  const maxWorkstreamCount = Math.max(1, ...workstreams.map((name) => allProjects.filter((project) => project.workstream === name).length));
  elements.workstreamSummary.innerHTML = workstreams.map((name) => {
    const count = allProjects.filter((project) => project.workstream === name).length;
    const width = Math.round((count / maxWorkstreamCount) * 100);
    return `
      <div>
        <div class="queue-item"><span>${escapeHtml(name)}</span><span class="pill neutral">${count}</span></div>
        <div class="bar" style="--bar-width: ${width}%"><span></span></div>
      </div>
    `;
  }).join("");

  const statuses = getStatuses();
  const maxStatusCount = Math.max(1, ...statuses.map((status) => allProjects.filter((project) => project.status === status).length));
  elements.statusSummary.innerHTML = statuses.map((status) => {
    const count = allProjects.filter((project) => project.status === status).length;
    const width = Math.round((count / maxStatusCount) * 100);
    return `
      <div class="status-item"><span>${escapeHtml(status)}</span><span class="pill ${statusPillClass(status)}">${count}</span></div>
      <div class="bar" style="--bar-width: ${width}%"><span></span></div>
    `;
  }).join("");
}

function renderPrimaryList() {
  const viewCopy = {
    projects: ["Portfolio", "Projects"],
    highlights: ["Business", "Highlights"],
    metrics: ["Operations", "Metrics"],
    jira: ["Delivery", "Jira"],
  };
  elements.mainEyebrow.textContent = viewCopy[state.activeView][0];
  elements.mainTitle.textContent = viewCopy[state.activeView][1];

  const projectMode = state.activeView === "projects";
  elements.workstreamFilter.disabled = !projectMode;
  elements.statusFilter.disabled = !projectMode;
  elements.attentionOnly.disabled = !projectMode;

  if (state.activeView === "projects") renderProjectList();
  if (state.activeView === "highlights") renderHighlightList();
  if (state.activeView === "metrics") renderMetricList();
  if (state.activeView === "jira") renderJiraList();
}

function renderProjectList() {
  const rows = getFilteredProjects();
  elements.resultCount.textContent = String(rows.length);
  elements.primaryList.innerHTML = rows.length ? rows.map((project) => `
    <button class="project-row ${project.id === state.selectedProjectId ? "active" : ""}" data-project-id="${escapeAttribute(project.id)}">
      <div class="row-main">
        <strong>${escapeHtml(project.project)}</strong>
        <p>${escapeHtml(snippet(project.update || project.impact || project.risk, 150))}</p>
        <div class="row-meta">
          <span>${escapeHtml(project.workstream)}</span>
          <span>${escapeHtml(project.owner || "Unassigned")}</span>
          <span>${escapeHtml(project.targetDate || "No target")}</span>
        </div>
      </div>
      <div class="pill-row">
        ${project.ask === "Yes" ? `<span class="pill risk">Ask</span>` : ""}
        <span class="pill ${statusPillClass(project.status)}">${escapeHtml(project.status)}</span>
      </div>
    </button>
  `).join("") : `<div class="empty-state">No projects match the current filters.</div>`;

  elements.primaryList.querySelectorAll(".project-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedProjectId = button.dataset.projectId;
      localState.selectedProjectId = state.selectedProjectId;
      persistLocalState();
      renderProjectList();
      renderDetailPane();
    });
  });
}

function renderHighlightList() {
  const rows = highlights.filter(matchesSearch);
  elements.resultCount.textContent = String(rows.length);
  elements.primaryList.innerHTML = rows.length ? rows.map((highlight) => `
    <button class="highlight-row ${highlight.id === state.selectedHighlightId ? "active" : ""}" data-highlight-id="${escapeAttribute(highlight.id)}">
      <div class="row-main">
        <strong>${escapeHtml(highlight.highlight)}</strong>
        <p>${escapeHtml(snippet(highlight.context, 160))}</p>
      </div>
      <div class="pill-row">
        <span class="pill neutral">${escapeHtml(highlight.category || "Business")}</span>
      </div>
    </button>
  `).join("") : `<div class="empty-state">No highlights match the current search.</div>`;

  elements.primaryList.querySelectorAll(".highlight-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedHighlightId = button.dataset.highlightId;
      localState.selectedHighlightId = state.selectedHighlightId;
      persistLocalState();
      renderHighlightList();
      renderDetailPane();
    });
  });
}

function renderMetricList() {
  const rows = metrics.filter(matchesSearch);
  elements.resultCount.textContent = String(rows.length);
  elements.primaryList.innerHTML = rows.length ? rows.map((metric) => `
    <button class="metric-row ${metric.id === state.selectedMetricId ? "active" : ""}" data-metric-id="${escapeAttribute(metric.id)}">
      <div class="row-main">
        <strong>${escapeHtml(metric.metric)}</strong>
        <p>${escapeHtml(metric.context || metric.unit || "Metric")}</p>
      </div>
      <div class="pill-row">
        <span class="pill progress">${escapeHtml(metric.value || "-")}</span>
      </div>
    </button>
  `).join("") : `<div class="empty-state">No metrics match the current search.</div>`;

  elements.primaryList.querySelectorAll(".metric-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMetricId = button.dataset.metricId;
      localState.selectedMetricId = state.selectedMetricId;
      persistLocalState();
      renderMetricList();
      renderDetailPane();
    });
  });
}

function renderJiraList() {
  const rows = jiraRows.filter(matchesSearch);
  elements.resultCount.textContent = String(rows.length);
  elements.primaryList.innerHTML = rows.length ? rows.map((issue) => `
    <button class="jira-row ${issue.id === state.selectedJiraId ? "active" : ""}" data-jira-id="${escapeAttribute(issue.id)}">
      <div class="row-main">
        <strong>${escapeHtml(issue.key)} - ${escapeHtml(issue.summary)}</strong>
        <p>${escapeHtml([issue.assignee, issue.priority, issue.updated].filter(Boolean).join(" | "))}</p>
      </div>
      <div class="pill-row">
        <span class="pill ${statusPillClass(issue.status)}">${escapeHtml(issue.status || "Unknown")}</span>
      </div>
    </button>
  `).join("") : `<div class="empty-state">No Jira rows in this refresh.</div>`;

  elements.primaryList.querySelectorAll(".jira-row").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedJiraId = button.dataset.jiraId;
      localState.selectedJiraId = state.selectedJiraId;
      persistLocalState();
      renderJiraList();
      renderDetailPane();
    });
  });
}

function renderDetailPane() {
  if (state.activeView === "projects") renderProjectDetail();
  if (state.activeView === "highlights") renderHighlightDetail();
  if (state.activeView === "metrics") renderMetricDetail();
  if (state.activeView === "jira") renderJiraDetail();
}

function renderProjectDetail() {
  const project = getProjects().find((item) => item.id === state.selectedProjectId);
  if (!project) {
    elements.detailPane.innerHTML = `<div class="empty-state">Select a project.</div>`;
    return;
  }

  elements.detailPane.innerHTML = `
    <div class="detail-stack">
      <div class="detail-title">
        <div class="panel-header">
          <div>
            <p class="eyebrow">${escapeHtml(project.workstream)}</p>
            <h3>${escapeHtml(project.project)}</h3>
          </div>
          <span class="pill ${statusPillClass(project.status)}">${escapeHtml(project.status)}</span>
        </div>
        <p class="detail-lead">${escapeHtml(project.update || "No weekly update recorded.")}</p>
      </div>

      <div class="detail-grid">
        ${metaRow("Owner", project.owner || "Unassigned")}
        ${metaRow("Target", project.targetDate || "Not set")}
        ${metaRow("Ask", project.ask || "No")}
        ${metaRow("Source", project.sourceSlide ? `Slide ${project.sourceSlide}` : project.sourceType)}
        ${project.jiraKey ? metaRow("Jira", project.jiraKey) : ""}
        ${project.nextMilestone ? metaRow("Milestone", project.nextMilestone) : ""}
      </div>

      <div class="detail-section">
        <h4>Business Impact</h4>
        <p class="detail-note">${escapeHtml(project.impact || "Not recorded.")}</p>
      </div>

      <div class="detail-section">
        <h4>Blocker or Risk</h4>
        <p class="detail-note">${escapeHtml(project.risk || "No blocker recorded.")}</p>
      </div>

      <div class="detail-section">
        <h4>Help Needed</h4>
        <p class="detail-note">${escapeHtml(project.help || "No leadership action recorded.")}</p>
      </div>

      <form id="detailEditForm" class="detail-edit">
        <div class="form-grid">
          <label>
            Status
            <select name="status">${defaultStatuses.map((status) => `<option value="${escapeAttribute(status)}" ${status === project.status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select>
          </label>
          <label>
            Leadership ask
            <select name="ask">${askOptions.map((ask) => `<option value="${escapeAttribute(ask)}" ${ask === project.ask ? "selected" : ""}>${escapeHtml(ask)}</option>`).join("")}</select>
          </label>
        </div>
        <label>
          This week update
          <textarea name="update" rows="4">${escapeHtml(project.update)}</textarea>
        </label>
        <label>
          Blocker or risk
          <textarea name="risk" rows="3">${escapeHtml(project.risk)}</textarea>
        </label>
        <label>
          Help needed
          <input type="text" name="help" value="${escapeAttribute(project.help)}" />
        </label>
        <div class="detail-actions">
          ${project.jiraUrl ? `<a class="button secondary" href="${escapeAttribute(project.jiraUrl)}">Open Jira</a>` : ""}
          ${project.sourceType === "manual" ? `<button class="button danger" id="deleteManualProject" type="button">Delete</button>` : ""}
          <button class="button primary" type="submit">Save Detail</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("detailEditForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateProject(project.id, {
      status: String(formData.get("status") || project.status),
      ask: String(formData.get("ask") || project.ask),
      update: String(formData.get("update") || ""),
      risk: String(formData.get("risk") || ""),
      help: String(formData.get("help") || ""),
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
  });

  const deleteButton = document.getElementById("deleteManualProject");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      localState.manualProjects = localState.manualProjects.filter((item) => item.id !== project.id);
      state.selectedProjectId = "";
      localState.selectedProjectId = "";
      persistLocalState();
      populateFilters();
      render();
    });
  }
}

function renderHighlightDetail() {
  const highlight = highlights.find((item) => item.id === state.selectedHighlightId);
  if (!highlight) {
    elements.detailPane.innerHTML = `<div class="empty-state">Select a highlight.</div>`;
    return;
  }

  elements.detailPane.innerHTML = `
    <div class="detail-stack">
      <div class="detail-title">
        <div class="panel-header">
          <div>
            <p class="eyebrow">${escapeHtml(highlight.category || "Business")}</p>
            <h3>${escapeHtml(highlight.highlight)}</h3>
          </div>
          <span class="pill neutral">${escapeHtml(highlight.timing || "Timing")}</span>
        </div>
        <p class="detail-lead">${escapeHtml(highlight.context || "No business context recorded.")}</p>
      </div>
      <div class="detail-grid">
        ${metaRow("Impact", highlight.impact || "Not recorded")}
        ${metaRow("Week", highlight.reportingWeek || trackerData.reportingWeek || "Not set")}
        ${metaRow("Source", highlight.sourceSlide ? `Slide ${highlight.sourceSlide}` : "Deck")}
      </div>
      <div class="detail-section">
        <h4>Leadership Note</h4>
        <p class="detail-note">${escapeHtml(highlight.note || "Not recorded.")}</p>
      </div>
    </div>
  `;
}

function renderMetricDetail() {
  const metric = metrics.find((item) => item.id === state.selectedMetricId);
  if (!metric) {
    elements.detailPane.innerHTML = `<div class="empty-state">Select a metric.</div>`;
    return;
  }

  elements.detailPane.innerHTML = `
    <div class="detail-stack">
      <div class="detail-title">
        <div class="panel-header">
          <div>
            <p class="eyebrow">${escapeHtml(metric.area || "Metric")}</p>
            <h3>${escapeHtml(metric.metric)}</h3>
          </div>
          <span class="pill progress">${escapeHtml(metric.value || "-")}</span>
        </div>
        <p class="detail-lead">${escapeHtml(metric.context || "No context recorded.")}</p>
      </div>
      <div class="detail-grid">
        ${metaRow("Period", metric.period || "Not set")}
        ${metaRow("Breakdown", metric.unit || "Not recorded")}
        ${metaRow("Source", metric.sourceSlide ? `Slide ${metric.sourceSlide}` : "Deck")}
      </div>
    </div>
  `;
}

function renderJiraDetail() {
  const issue = jiraRows.find((item) => item.id === state.selectedJiraId);
  if (!issue) {
    elements.detailPane.innerHTML = `<div class="empty-state">Connect Jira to populate issue detail.</div>`;
    return;
  }

  elements.detailPane.innerHTML = `
    <div class="detail-stack">
      <div class="detail-title">
        <div class="panel-header">
          <div>
            <p class="eyebrow">${escapeHtml(issue.key)}</p>
            <h3>${escapeHtml(issue.summary)}</h3>
          </div>
          <span class="pill ${statusPillClass(issue.status)}">${escapeHtml(issue.status || "Unknown")}</span>
        </div>
      </div>
      <div class="detail-grid">
        ${metaRow("Assignee", issue.assignee || "Unassigned")}
        ${metaRow("Priority", issue.priority || "Not set")}
        ${metaRow("Type", issue.type || "Issue")}
        ${metaRow("Updated", issue.updated || "Not set")}
        ${metaRow("Sprint", issue.sprint || "Not set")}
        ${metaRow("Epic", issue.epicKey || issue.epicName || "Not set")}
      </div>
      <div class="detail-actions">
        ${issue.url ? `<a class="button primary" href="${escapeAttribute(issue.url)}">Open Jira</a>` : ""}
      </div>
    </div>
  `;
}

function updateProject(id, patch) {
  const baseProject = baseProjects.find((project) => project.id === id);
  if (baseProject) {
    localState.edits[id] = { ...(localState.edits[id] || {}), ...patch };
  } else {
    localState.manualProjects = localState.manualProjects.map((project) => (
      project.id === id ? { ...project, ...patch } : project
    ));
  }
  persistLocalState();
  render();
}

function getProjects() {
  const editedBase = baseProjects.map((project) => ({ ...project, ...(localState.edits[project.id] || {}) }));
  return [...localState.manualProjects, ...editedBase];
}

function getFilteredProjects() {
  return getProjects().filter((project) => {
    if (state.workstreamFilter !== "all" && project.workstream !== state.workstreamFilter) return false;
    if (state.statusFilter !== "all" && project.status !== state.statusFilter) return false;
    if (state.attentionOnly && !isAttentionProject(project)) return false;
    return matchesSearch(project);
  });
}

function getWorkstreams() {
  return Array.from(new Set(getProjects().map((project) => project.workstream).filter(Boolean))).sort();
}

function getStatuses() {
  const statuses = Array.from(new Set([...defaultStatuses, ...getProjects().map((project) => project.status).filter(Boolean)]));
  return statuses.filter(Boolean);
}

function isAttentionProject(project) {
  if (project.status === "Completed") return false;
  return project.ask === "Yes" || ["Blocked", "At Risk", "Monitoring"].includes(project.status) || Boolean(project.risk);
}

function severityScore(project) {
  const scores = { Blocked: 5, "At Risk": 4, Monitoring: 3, "On Track": 2, Upcoming: 1, Completed: 0 };
  return (scores[project.status] || 0) + (project.ask === "Yes" ? 2 : 0) + (project.risk ? 1 : 0);
}

function matchesSearch(item) {
  if (!state.search) return true;
  return Object.values(item).some((value) => String(value || "").toLowerCase().includes(state.search));
}

function ensureSelections() {
  const allProjects = getProjects();
  if (!state.selectedProjectId || !allProjects.some((project) => project.id === state.selectedProjectId)) {
    const firstAttention = allProjects.find(isAttentionProject);
    state.selectedProjectId = (firstAttention || allProjects[0] || {}).id || "";
  }
  if (!state.selectedHighlightId && highlights[0]) state.selectedHighlightId = highlights[0].id;
  if (!state.selectedMetricId && metrics[0]) state.selectedMetricId = metrics[0].id;
  if (!state.selectedJiraId && jiraRows[0]) state.selectedJiraId = jiraRows[0].id;
}

function normalizeProject(row, index, sourceType) {
  const projectName = row.Project || "Untitled project";
  return {
    id: row.id || `${sourceType}-${slug(projectName)}-${row["Source Slide"] || index}-${index}`,
    reportingWeek: row["Reporting Week"] || trackerData.reportingWeek || "",
    workstream: row.Workstream || "Business",
    project: projectName,
    status: row.Status || "On Track",
    owner: row.Owner || "",
    targetDate: row["Target Date"] || "",
    update: row["This Week Update"] || "",
    nextMilestone: row["Next Milestone"] || "",
    impact: row["Business Impact"] || "",
    risk: row["Blocker or Risk"] || "",
    ask: row["Leadership Ask"] || "No",
    help: row["Help Needed"] || "",
    jiraKey: row["Jira Key/Epic"] || "",
    jiraUrl: row["Jira URL"] || "",
    sourceSlide: row["Source Slide"] || "",
    sourceDeck: row["Source Deck"] || trackerData.deckName || "",
    lastUpdated: row["Last Updated"] || trackerData.reportingWeek || "",
    sourceType,
  };
}

function normalizeHighlight(row, index) {
  return {
    id: `highlight-${index}-${slug(row.Highlight || "highlight")}`,
    reportingWeek: row["Reporting Week"] || "",
    category: row.Category || "",
    highlight: row.Highlight || "Business highlight",
    context: row["Business Context"] || "",
    impact: row["Impact/Volume"] || "",
    timing: row.Timing || "",
    note: row["Leadership Note"] || "",
    sourceSlide: row["Source Slide"] || "",
  };
}

function normalizeMetric(row, index) {
  return {
    id: `metric-${index}-${slug(row.Metric || "metric")}`,
    period: row["Reporting Period"] || "",
    area: row["Metric Area"] || "",
    metric: row.Metric || "Metric",
    value: row.Value || "",
    unit: row["Unit/Breakdown"] || "",
    context: row["Leadership Context"] || "",
    sourceSlide: row["Source Slide"] || "",
  };
}

function normalizeJira(row, index) {
  return {
    id: `jira-${index}-${slug(row["Issue Key"] || "issue")}`,
    key: row["Issue Key"] || "",
    type: row["Issue Type"] || "",
    summary: row.Summary || "",
    status: row.Status || "",
    category: row["Status Category"] || "",
    assignee: row.Assignee || "",
    priority: row.Priority || "",
    labels: row.Labels || "",
    components: row.Components || "",
    dueDate: row["Due Date"] || "",
    updated: row.Updated || "",
    sprint: row.Sprint || "",
    epicKey: row["Epic Key"] || "",
    epicName: row["Epic Name"] || "",
    url: row.URL || "",
  };
}

function metaRow(label, value) {
  return `<div class="meta-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function statusPillClass(status) {
  if (status === "Completed") return "completed";
  if (status === "On Track") return "ontrack";
  if (status === "Monitoring") return "monitoring";
  if (status === "At Risk") return "risk";
  if (status === "Blocked") return "blocked";
  if (status === "Upcoming") return "upcoming";
  return "neutral";
}

function exportProjectsCsv() {
  const rows = getProjects().map((project) => ({
    "Reporting Week": project.reportingWeek,
    Workstream: project.workstream,
    Project: project.project,
    Status: project.status,
    Owner: project.owner,
    "Target Date": project.targetDate,
    "This Week Update": project.update,
    "Next Milestone": project.nextMilestone,
    "Business Impact": project.impact,
    "Blocker or Risk": project.risk,
    "Leadership Ask": project.ask,
    "Help Needed": project.help,
    "Jira Key/Epic": project.jiraKey,
    "Jira URL": project.jiraUrl,
    "Source Slide": project.sourceSlide,
    "Source Deck": project.sourceDeck,
    "Last Updated": project.lastUpdated,
  }));
  const csv = [
    projectHeaders.join(","),
    ...rows.map((row) => projectHeaders.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `weekly-projects-${trackerData.reportingWeek || "updated"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value || "");
  return `"${text.replace(/"/g, '""')}"`;
}

function loadLocalState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      edits: stored.edits || {},
      manualProjects: stored.manualProjects || [],
      selectedProjectId: stored.selectedProjectId || "",
      selectedHighlightId: stored.selectedHighlightId || "",
      selectedMetricId: stored.selectedMetricId || "",
      selectedJiraId: stored.selectedJiraId || "",
      activeView: stored.activeView || "projects",
    };
  } catch (error) {
    return { edits: {}, manualProjects: [], activeView: "projects" };
  }
}

function persistLocalState() {
  localState.selectedProjectId = state.selectedProjectId;
  localState.selectedHighlightId = state.selectedHighlightId;
  localState.selectedMetricId = state.selectedMetricId;
  localState.selectedJiraId = state.selectedJiraId;
  localState.activeView = state.activeView;
  localStorage.setItem(storageKey, JSON.stringify(localState));
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54) || "item";
}

function snippet(value, length) {
  const text = String(value || "No detail recorded.");
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
