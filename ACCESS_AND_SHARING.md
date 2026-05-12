# Access And Sharing

The tracker is a static website. Other users cannot access the local `file://` version on one person's laptop. They need a hosted URL, usually through GitHub Pages.

## Viewer Access

Use this when people only need to view the tracker.

1. Push the tracker to GitHub.
2. Turn on GitHub Pages for the repo.
3. Share the GitHub Pages URL.

The URL usually looks like:

```text
https://YOUR_GITHUB_USERNAME.github.io/REPO-NAME/
```

If the repo is public, the GitHub Pages site is viewable by anyone with the link. Do not publish sensitive Jira data to a public site.

## Editor Access

Use this when someone needs to update, refresh, or customize the tracker.

1. Add them to the GitHub repo as a collaborator, or add the repo to the right GitHub organization/team.
2. Make sure they can clone and push to the repo.
3. Have them follow `IMPLEMENTATION_STEPS.md`.
4. Have them keep `config/jira.json` local only. It is ignored by Git and should not be committed.

Viewers do not need repo access. Editors do.

## Refresh Access

Only someone with Jira credentials and repo push access can refresh the live tracker from Jira.

Weekly refresh command:

```bash
python3 scripts/refresh_tracker.py --fetch-jira --jira-config config/jira.json --jira-as-projects
git add data outputs
git commit -m "Refresh weekly tracker"
git push
```

GitHub Pages updates after the push finishes.

## Important Sharing Rules

- The local browser app stores manual edits in that user's browser only.
- Manual edits made with `Add Update` are not automatically shared with everyone else.
- Shared updates should come from Jira, a refreshed deck, or committed generated data files.
- Anyone who can view the public GitHub Pages link can see the data in `data/tracker-data.js`.
- Never put Jira API tokens, passwords, or private credentials in the repo.

## Access Checklist

Before sharing the link, confirm:

- The repo has been pushed to GitHub.
- GitHub Pages is enabled on branch `main`, folder `/root`.
- The latest `data/tracker-data.js` has been committed and pushed.
- The site URL opens in an incognito/private browser window.
- The shared data is appropriate for everyone who can access the link.

## If The Link Does Not Work

- Wait a few minutes after enabling GitHub Pages.
- Confirm the repo name and URL spelling.
- Confirm GitHub Pages is set to branch `main` and folder `/root`.
- Confirm `index.html` is in the repo root.
- Confirm the repo visibility matches the intended audience.
