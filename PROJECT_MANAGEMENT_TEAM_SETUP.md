# Project Management Team Tracker Setup

Use this guide to duplicate this tracker for the project management team and let them customize it without rewriting the app.

For the simplest start-to-finish checklist, use `IMPLEMENTATION_STEPS.md` first. For viewer/editor access, use `ACCESS_AND_SHARING.md`. This page adds project-management-specific defaults.

## What The Team Gets

- A browser-based weekly project tracker, not an Excel sheet
- Configurable team name, labels, workstreams, statuses, colors, and metric cards
- Optional Jira connection that can feed issues into the main leadership project list
- GitHub Pages hosting so stakeholders can view the tracker in a browser
- A Codex-friendly setup where most changes happen in `config/tracker-config.js`

## 1. Duplicate The Repo

From Terminal:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground
git clone https://github.com/tjshah22/weekly-projects-tracker.git project-management-tracker
cd project-management-tracker
git remote remove origin
```

Create a new empty GitHub repo named `project-management-tracker`, but do not push yet. Customize the tracker first.

## 2. Customize The Tracker

The main customization file is:

```text
config/tracker-config.js
```

For the project management team, copy the included starter config:

```bash
cp templates/project_management_tracker_config.js config/tracker-config.js
```

That starter config uses this shape:

```js
window.TRACKER_CONFIG = {
  documentTitle: "Project Management Weekly Tracker",
  storageNamespace: "project-management-weekly-tracker",

  labels: {
    sidebarTitle: "Project Management Tracker",
    topbarTitle: "Project management portfolio overview",
    addButton: "Add Update",
    attentionTitle: "Attention Queue",
    projectPlaceholder: "Portfolio rollout - stakeholder readiness",
    jiraPlaceholder: "PMO-123"
  },

  statuses: ["Completed", "On Track", "Monitoring", "At Risk", "Blocked", "Upcoming"],
  askOptions: ["No", "Yes", "Review"],
  completedStatuses: ["Completed"],
  onTrackStatuses: ["On Track"],
  attentionStatuses: ["Blocked", "At Risk", "Monitoring"],

  defaultWorkstreams: [
    "Intake",
    "Planning",
    "Delivery",
    "Change Management",
    "Reporting",
    "Governance"
  ],

  theme: {
    accent: "#2f6f9f",
    accentDeep: "#214f73",
    accentSoft: "#eaf3f8"
  }
};
```

They can change labels, workstreams, statuses, and colors directly in that file.

## 3. Connect Jira

Copy the Jira template:

```bash
cp config/jira.project-tracker.example.json config/jira.json
```

Edit `config/jira.json`:

```json
{
  "base_url": "https://your-domain.atlassian.net",
  "email_env": "JIRA_EMAIL",
  "api_token_env": "JIRA_API_TOKEN",
  "queries": [
    {
      "name": "PMO Tracker - Active",
      "jql": "project = PMO AND statusCategory != Done ORDER BY priority DESC, duedate ASC, updated DESC",
      "max_results": 100
    }
  ]
}
```

Keep Jira credentials out of the repo. Set them in Terminal:

```bash
export JIRA_EMAIL="your.email@bwt3.com"
export JIRA_API_TOKEN="your-jira-api-token"
```

`config/jira.json` is ignored by Git so each person can keep local Jira settings without publishing them.

Refresh from Jira:

```bash
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
```

Refresh from both a deck and Jira:

```bash
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
```

## 4. Publish With GitHub Pages

Push the tracker:

```bash
git status --short
git add config/tracker-config.js README.md PROJECT_MANAGEMENT_TEAM_SETUP.md CODEX_CUSTOMIZATION_PROMPTS.md
git commit -m "Set up project management tracker"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/project-management-tracker.git
git push -u origin main
```

In GitHub:

1. Open the new repo.
2. Go to `Settings`.
3. Go to `Pages`.
4. Set source to `Deploy from a branch`.
5. Choose branch `main`.
6. Choose folder `/root`.
7. Save.

The public URL will usually look like:

```text
https://YOUR_GITHUB_USERNAME.github.io/project-management-tracker/
```

After Pages is enabled, share that URL with viewers. Do not share the local `file://` path from your laptop. If the tracker needs editors, add them as repo collaborators so they can refresh data and push updates.

## 5. Access Model

- Viewers use the GitHub Pages URL.
- Editors need GitHub repo access.
- Jira refreshers need Jira credentials and repo push access.
- Browser-only manual updates are local to the person who entered them.
- Shared weekly updates should be refreshed from Jira or a deck, committed, and pushed.

Use `ACCESS_AND_SHARING.md` as the access checklist before sending the link broadly.

## 6. Weekly Update Workflow

For Jira-only updates:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/project-management-tracker
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
git add data outputs
git commit -m "Refresh weekly tracker"
git push
```

For deck-plus-Jira updates:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/project-management-tracker
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
git add data outputs
git commit -m "Refresh weekly tracker"
git push
```

## 7. Safe Codex Prompts For The Team

More examples live in `CODEX_CUSTOMIZATION_PROMPTS.md`.

Use prompts like these from inside the duplicated repo:

```text
Update config/tracker-config.js for the PMO team. Rename the tracker to "PMO Weekly Portfolio Tracker", add workstreams for Intake, Delivery, Risk, Finance, and Reporting, and keep the design business-facing.
```

```text
Add a new status called "Pending Approval". Give it a monitoring/warning tone, include it in the status dropdown, and make it count as a leadership attention status.
```

```text
Update the Jira config template for our Jira project key PMO and active board ID 12345. Do not add credentials to the repo.
```

```text
Refresh the tracker from Jira, verify the generated data includes Jira issues in the main Projects view, then tell me the git commands to publish it.
```

```text
Make this tracker feel more executive-ready for a project management audience. Keep it clean, restrained, and easy to scan.
```

## 8. Files The Team Can Safely Edit

- `config/tracker-config.js`: labels, statuses, workstreams, colors, and team wording
- `config/jira.json`: local Jira connection settings; do not commit secrets
- `data/tracker-data.js`: generated by the refresh script
- `README.md`: team-specific instructions
- `styles.css`: visual design changes, if needed

Avoid editing `app.js` unless they want to change behavior. Ask Codex to do those changes.
