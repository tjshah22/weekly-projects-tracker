# Weekly Projects Tracker

This is an app-first fulfillment tracker inspired by the LaunchGate layout: sidebar queues, leadership attention, searchable project rows, detail editing, business highlights, metrics, and Jira issue views.

The PowerPoint deck is still the source input. The tracker itself is `index.html`, not an Excel workbook.

For quick sharing, serve this folder as a static site and share the HTTP link with anyone who should see it.

## What It Creates

- `index.html`: the interactive tracker app.
- `data/tracker-data.js`: browser-ready tracker data generated from the deck.
- `outputs/leadership_brief.md`: a short Markdown leadership brief.
- `data/projects.csv`: extracted project rows from the deck.
- `data/blockers_and_risks.csv`: leadership attention rows.
- `data/business_highlights.csv`: business context and volume/timing highlights.
- `data/department_metrics.csv`: operating metrics from the department slides.
- `data/source_slides.csv`: raw extracted slide text for auditability.
- `data/jira_raw.csv`: Jira rows when a config or CSV is supplied.

## Weekly Workflow

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

## Jira Setup

The connector supports both JQL queries and Jira Software board pulls.

1. Copy the config template:

   ```bash
   cp config/jira.example.json config/jira.json
   ```

2. Edit `config/jira.json`:

   - Set `base_url` to your Jira Cloud site.
   - Replace project keys in the sample JQL.
   - Replace the example `board_id` with your board IDs, or remove the `boards` section.
   - Keep credentials out of the file.

3. Set credentials in your shell:

   ```bash
   export JIRA_EMAIL="you@example.com"
   export JIRA_API_TOKEN="your-token"
   ```

4. Refresh with Jira:

   ```bash
   python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json
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
