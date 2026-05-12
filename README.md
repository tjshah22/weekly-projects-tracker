# Weekly Projects Tracker

This is an app-first fulfillment tracker inspired by the LaunchGate layout: sidebar queues, leadership attention, searchable project rows, detail editing, business highlights, metrics, and Jira-connected project views.

The PowerPoint deck can be the source input, Jira can be the source input, or both can be combined. The tracker itself is `index.html`, not an Excel workbook.

For quick sharing, serve this folder as a static site and share the HTTP link with anyone who should see it. Access and sharing details are in [ACCESS_AND_SHARING.md](ACCESS_AND_SHARING.md).

## Customizing For Another Team

Most team-specific wording and options live in `config/tracker-config.js`: app title, labels, workstreams, statuses, leadership attention rules, metric card copy, and theme colors.

For a step-by-step implementation checklist, start with [IMPLEMENTATION_STEPS.md](IMPLEMENTATION_STEPS.md). To make sure other people can view or update it, use [ACCESS_AND_SHARING.md](ACCESS_AND_SHARING.md). To duplicate this tracker specifically for the project management team, use [PROJECT_MANAGEMENT_TEAM_SETUP.md](PROJECT_MANAGEMENT_TEAM_SETUP.md). For safe follow-up changes, use [CODEX_CUSTOMIZATION_PROMPTS.md](CODEX_CUSTOMIZATION_PROMPTS.md).

## What It Creates

- `index.html`: the interactive tracker app.
- `data/tracker-data.js`: browser-ready tracker data generated from the deck, Jira, or both.
- `outputs/leadership_brief.md`: a short Markdown leadership brief.
- `data/projects.csv`: extracted project rows from the deck and any Jira issues promoted with `--jira-as-projects`.
- `data/blockers_and_risks.csv`: leadership attention rows.
- `data/business_highlights.csv`: business context and volume/timing highlights.
- `data/department_metrics.csv`: operating metrics from the department slides.
- `data/source_slides.csv`: raw extracted slide text for auditability.
- `data/jira_raw.csv`: Jira rows when a config or CSV is supplied.

## Weekly Workflow

### Deck Only

1. Save the newest weekly deck somewhere accessible.
2. Refresh the app data:

   ```bash
   python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx"
   ```

3. Open `index.html` in a browser.
4. Use `New Update` for items that did not come through cleanly from the deck.
5. Edit status, leadership ask, risk, and help-needed fields from the detail pane.
6. Use `Export CSV` when you want a portable version of the app updates.

Manual edits are saved in browser local storage for the current reporting week.

### Jira To Tracker

Once the Jira project/board is set up, refresh the app from Jira:

```bash
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
```

To combine the weekly deck with Jira, include both sources:

```bash
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
```

`--jira-as-projects` is the key flag: it funnels Jira issues into the main Projects list, Leadership Brief, blockers view, and Jira tab.

## Jira Setup

The connector supports both JQL queries and Jira Software board pulls. For a dedicated Jira project, start with [JIRA_TRACKER_SETUP.md](JIRA_TRACKER_SETUP.md).

1. Copy the config template that fits your setup:

   ```bash
   cp config/jira.project-tracker.example.json config/jira.json
   ```

   Use `config/jira.example.json` instead if you want to connect several existing Jira projects or boards.

2. Edit `config/jira.json`:

   - Set `base_url` to your Jira Cloud site.
   - Replace the project key in the sample JQL.
   - Add board IDs only if you want board pulls in addition to JQL.
   - Keep credentials out of the file.

3. Set credentials in your shell:

   ```bash
   export JIRA_EMAIL="you@example.com"
   export JIRA_API_TOKEN="your-token"
   ```

4. Refresh with Jira:

   ```bash
   python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
   ```

The script uses Atlassian's current Jira Cloud JQL endpoint, `/rest/api/3/search/jql`, including `nextPageToken` pagination. For board pulls, it uses Jira Software's `/rest/agile/1.0/board/{boardId}/issue` endpoint.

Official references:

- [Jira Cloud issue search API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/)
- [Jira Software board issues API](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/)
- [Atlassian JQL REST API migration note](https://confluence.atlassian.com/jirakb/how-to-return-issues-from-a-jql-query-using-rest-api-1289424308.html)

## Field Guidance

- `Status`: use Completed, On Track, Monitoring, At Risk, Blocked, or Upcoming.
- `Business Impact`: explain why leadership should care, not just what the team did.
- `Blocker or Risk`: describe the decision, dependency, missing access, or timeline threat.
- `Leadership Ask`: use `Yes` when leadership action is needed, `Review` when visibility is enough, and `No` when the team owns the next step.
- `Jira Key/Epic`: add the issue or epic key that best represents the tracker row.

## Notes

- The PowerPoint extractor reads PPTX XML directly and keeps `Source Slides` as an audit trail.
- If a deck has screenshots/charts with text baked into images, add those values with `New Update` in the app.
- For recurring reporting, keep this tracker package and refresh it each week with the latest deck.
