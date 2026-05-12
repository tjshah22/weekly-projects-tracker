# Jira Project Tracker Setup

This setup makes Jira the source of truth for weekly project updates while this app remains the leadership view.

## Recommended Jira Structure

Create a Jira project named `Fulfillment Weekly Tracker` with a short key such as `FULTRACK`.

Use a Kanban board with these statuses:

- `Backlog` or `To Do`: maps to `Upcoming`
- `In Progress`: maps to `On Track`
- `Monitoring`, `Waiting`, or `Dependency`: maps to `Monitoring`
- `At Risk`: maps to `At Risk`
- `Blocked`: maps to `Blocked`
- `Done`: maps to `Completed`

Use these issue fields consistently:

- `Summary`: the leadership-readable project name
- `Issue Type`: `Epic` for a large initiative, `Task` for a weekly project/update, `Bug` only for defect-style work
- `Assignee`: accountable owner
- `Due date`: target date shown in the tracker
- `Priority`: leadership urgency
- `Components`: workstream, using `OTTO/Media Broker`, `Fulfillment Modernization`, `TLVOD/Fulfillment Pipeline`, `CVP`, or `Business`
- `Labels`: add `weekly-update`, plus `blocker` or `leadership-ask` when needed

## Connect This App

1. Copy the project tracker config:

   ```bash
   cp config/jira.project-tracker.example.json config/jira.json
   ```

2. Edit `config/jira.json`:

   - Replace `https://your-domain.atlassian.net` with your Jira Cloud URL.
   - Replace `FULTRACK` in the JQL if your Jira project key is different.
   - Keep `JIRA_EMAIL` and `JIRA_API_TOKEN` as environment variable names, not actual secrets.

3. Set your Jira credentials in Terminal:

   ```bash
   export JIRA_EMAIL="your.email@bwt3.com"
   export JIRA_API_TOKEN="your-jira-api-token"
   ```

4. Refresh from Jira into the leadership tracker:

   ```bash
   python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
   ```

5. If you still want to combine the weekly PowerPoint deck with Jira:

   ```bash
   python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
   ```

6. Publish the updated tracker:

   ```bash
   git add data outputs scripts config README.md JIRA_TRACKER_SETUP.md templates
   git commit -m "Connect Jira project tracker feed"
   git push
   ```

GitHub Pages will update after the push finishes.

## Optional Import Starter

Use `templates/jira_project_tracker_import.csv` if you want to bulk-create a few starter Jira issues. Jira's CSV import can map the columns to project fields.

## How The Funnel Works

- Jira issues are pulled into `data/jira_raw.csv`.
- With `--jira-as-projects`, those Jira issues are also converted into `data/projects.csv`.
- `data/tracker-data.js` powers the live app, so the same Jira rows show up in the main Projects queue, the Leadership Brief, and the Jira detail tab.

This means the weekly habit becomes simple: update Jira during the week, run the refresh command on Friday, then push to GitHub Pages.
