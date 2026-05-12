# Implementation Steps

Use this page when a new team wants to stand up its own version of the tracker.

## Before You Start

Make sure you have:

- A GitHub account
- Permission to create or push to a GitHub repo
- A Jira project key or board ID, if the tracker will connect to Jira
- A Jira API token, if Jira data will be pulled automatically
- Codex opened in the tracker folder

## 1. Copy The Tracker

From Terminal:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground
git clone https://github.com/tjshah22/weekly-projects-tracker.git NAME-OF-NEW-TRACKER
cd NAME-OF-NEW-TRACKER
git remote remove origin
```

Replace `NAME-OF-NEW-TRACKER` with the folder name you want, such as `project-management-tracker`.

## 2. Apply The Team Template

For the project management team:

```bash
cp templates/project_management_tracker_config.js config/tracker-config.js
```

Then open `config/tracker-config.js` and update:

- `documentTitle`
- `storageNamespace`
- `labels.sidebarTitle`
- `labels.topbarTitle`
- `defaultWorkstreams`
- `statuses`
- `attentionStatuses`
- `theme`

Most future customization should happen in this one file.

## 3. Preview Locally

Open `index.html` in a browser, or open this file path:

```text
/Users/206895929@bwt3.com/Documents/Playground/NAME-OF-NEW-TRACKER/index.html
```

Check that:

- The tracker title is correct
- The sidebar title is correct
- Workstreams appear in the filter and Add Update form
- Statuses appear in the filter and detail edit form
- The Add Update form uses the right wording for the team

## 4. Configure Jira

Skip this step if the team will update the tracker manually or by deck only.

Copy the Jira config template:

```bash
cp config/jira.project-tracker.example.json config/jira.json
```

Edit `config/jira.json`:

- Change `base_url` to the team's Jira Cloud URL
- Change the JQL project key, such as `project = PMO`
- Add a board ID only if the team wants board-based pulls
- Do not add passwords or tokens to this file

Set credentials in Terminal:

```bash
export JIRA_EMAIL="your.email@bwt3.com"
export JIRA_API_TOKEN="your-jira-api-token"
```

Refresh from Jira:

```bash
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
```

## 5. Refresh From A Deck

Skip this step if Jira is the only source.

```bash
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx"
```

To combine deck data and Jira data:

```bash
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
```

## 6. Verify The Data

After refreshing, check these files:

- `data/tracker-data.js`: powers the browser app
- `data/projects.csv`: main project rows
- `data/jira_raw.csv`: raw Jira rows, if Jira was used
- `outputs/leadership_brief.md`: generated leadership summary

Quick terminal checks:

```bash
git status --short
python3 scripts/refresh_tracker.py --help
```

If Jira was used, open `data/projects.csv` and confirm Jira issue keys appear in the `Jira Key/Epic` column.

## 7. Create The GitHub Repo

Create a new empty GitHub repo, then connect this folder to it:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/NAME-OF-NEW-TRACKER.git
git add .
git commit -m "Set up tracker"
git push -u origin main
```

If `git add .` makes you nervous, use:

```bash
git status --short
```

Then add only the files you want to publish. `config/jira.json` is ignored by Git.

## 8. Turn On GitHub Pages

In GitHub:

1. Open the repo.
2. Go to `Settings`.
3. Go to `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Choose branch `main`.
6. Choose folder `/root`.
7. Save.

The live site will usually be:

```text
https://YOUR_GITHUB_USERNAME.github.io/NAME-OF-NEW-TRACKER/
```

## 9. Confirm Other Users Can Access It

Viewer access:

- Share the GitHub Pages URL, not the local `file://` path.
- Open the GitHub Pages URL in an incognito/private browser window to confirm it works without your local files.
- If the repo is public, anyone with the GitHub Pages link can view the tracker.
- If the tracker contains sensitive data, do not use a public repo or public GitHub Pages site.

Editor access:

- Add editors as GitHub repo collaborators or through a GitHub organization/team.
- Editors need clone/push access to update the shared tracker.
- Viewers do not need repo access.

Important:

- `Add Update` saves manual edits in the current user's browser only.
- Shared updates need to come from Jira, a refreshed deck, or committed changes to `data/tracker-data.js`.
- `config/jira.json` is local-only and should not be shared or committed.

Full sharing details are in `ACCESS_AND_SHARING.md`.

## 10. Weekly Update Process

Jira-only refresh:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/NAME-OF-NEW-TRACKER
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
git add data outputs
git commit -m "Refresh weekly tracker"
git push
```

Deck-plus-Jira refresh:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/NAME-OF-NEW-TRACKER
python3 scripts/refresh_tracker.py --deck "/path/to/weekly deck.pptx" --fetch-jira --jira-config config/jira.json --jira-as-projects
git add data outputs
git commit -m "Refresh weekly tracker"
git push
```

## 11. Ask Codex For Changes

Use direct prompts like:

```text
Update config/tracker-config.js for this team. Change the title, workstreams, statuses, and colors. Keep the tracker clean and business-facing.
```

```text
Connect this tracker to Jira project PMO. Update only the Jira config template and documentation. Do not add credentials to the repo.
```

```text
Refresh the tracker data, verify that data/projects.csv and data/tracker-data.js updated, then tell me the git commands to publish.
```

More prompt examples are in `CODEX_CUSTOMIZATION_PROMPTS.md`.

## Troubleshooting

- If the live site looks old, wait a few minutes and hard refresh the browser.
- If the live site still looks old, confirm `git push` completed and GitHub Pages is enabled on `main` and `/root`.
- If Jira fails, confirm `JIRA_EMAIL`, `JIRA_API_TOKEN`, `base_url`, and JQL project key are correct.
- If no Jira issues appear in Projects, rerun with `--jira-as-projects`.
- If the app title or colors are wrong, edit `config/tracker-config.js`.
