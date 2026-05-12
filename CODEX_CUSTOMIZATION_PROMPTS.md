# Codex Customization Prompts

Use these prompts from inside the tracker repo when the project management team wants changes.

## Rebrand The Tracker

```text
Update this tracker for the Project Management team. Change only config/tracker-config.js unless app behavior needs to change. Use the title "PMO Weekly Portfolio Tracker", make the workstreams Intake, Planning, Delivery, Change Management, Reporting, and Governance, and keep the design business-facing.
```

## Change Statuses

```text
Add a new status called "Pending Approval". Add it to config/tracker-config.js, give it a warning/monitoring tone, include it in leadership attention, and make sure it appears in the Add Update and detail edit dropdowns.
```

## Change Colors

```text
Update the tracker theme in config/tracker-config.js to use a restrained executive palette with a dark green accent. Keep contrast accessible and avoid changing layout.
```

## Connect A Jira Board

```text
Update the Jira config templates for our Jira project key PMO and board ID 12345. Do not put Jira credentials or API tokens in any repo file.
```

## Refresh Data

```text
Refresh this tracker from Jira using config/jira.json with --jira-as-projects. Verify that Jira issues appear in data/projects.csv and data/tracker-data.js, then summarize what changed.
```

## Publish To GitHub Pages

```text
Check git status, tell me exactly what files changed, then give me the commands to commit and push this tracker to GitHub Pages.
```

## Add A New Field

```text
Add a "Decision Needed By" field to manual project updates, detail editing, CSV export, and the generated project data shape. Keep the UI clean and update the README with usage notes.
```

## Make The UI More Executive-Friendly

```text
Review the tracker UI for a senior leadership audience. Make small improvements to spacing, labels, and visual hierarchy. Keep it clean, dense, and operational, not like a marketing page.
```

## Troubleshoot

```text
The GitHub Pages link is showing old tracker data. Check whether the latest data files were generated, whether git has uncommitted changes, whether the cache-busting version in index.html needs updating, and give me the exact fix.
```
