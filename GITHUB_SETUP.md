# First GitHub Repository Setup

This guide gets the tracker into your first GitHub repository and publishes it with GitHub Pages.

## Before You Start

You need:

- A GitHub account.
- Git installed on your computer.
- Permission to create a repository under your personal account or company organization.
- A decision on whether this tracker data can be public.

Important: GitHub Pages sites are public in the standard setup. If the project data is sensitive, do not publish it publicly without approval.

## 1. Check Git

Open Terminal and run:

```bash
git --version
```

If Git is installed, you will see a version number.

Set your Git identity once:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email that is connected to your GitHub account if possible.

## 2. Create The GitHub Repository

On GitHub:

1. Click `New repository`.
2. Repository name: `weekly-projects-tracker`.
3. Choose the owner: your account or your organization.
4. Choose visibility.
5. Do not add a README, .gitignore, or license from GitHub. This folder already has files.
6. Click `Create repository`.

GitHub will show you a repo URL like:

```text
https://github.com/YOUR_USERNAME/weekly-projects-tracker.git
```

Copy that URL.

## 3. Push The Tracker

From Terminal:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/weekly-projects-tracker
git init
git add .
git commit -m "Add weekly projects tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/weekly-projects-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username or organization name.

If GitHub asks you to sign in, follow the browser prompt. If it asks for a password in Terminal, use a GitHub personal access token instead of your account password.

## 4. Turn On GitHub Pages

In the GitHub repo:

1. Go to `Settings`.
2. Click `Pages` in the left sidebar.
3. Under `Build and deployment`, set `Source` to `Deploy from a branch`.
4. Set `Branch` to `main`.
5. Set folder to `/root`.
6. Click `Save`.

After a few minutes, GitHub Pages will publish the app.

Your link will look like:

```text
https://YOUR_USERNAME.github.io/weekly-projects-tracker/
```

For an organization repo, it will look like:

```text
https://YOUR_ORG.github.io/weekly-projects-tracker/
```

## 5. Update The Published Tracker Later

When you refresh the tracker from a new deck:

```bash
cd /Users/206895929@bwt3.com/Documents/Playground/weekly-projects-tracker
python3 scripts/refresh_tracker.py --deck "/path/to/new weekly deck.pptx"
git add .
git commit -m "Refresh weekly tracker"
git push
```

GitHub Pages will republish after the push.

## What Files Matter Most

- `index.html`: the app entry point.
- `styles.css`: app styling.
- `app.js`: app behavior.
- `data/tracker-data.js`: generated tracker data shown in the app.
- `.nojekyll`: tells GitHub Pages to serve the static app directly.
- `scripts/refresh_tracker.py`: refreshes the tracker from a new PowerPoint deck.

## If The Page Does Not Load

Check these first:

- GitHub Pages source is `main` and `/root`.
- `index.html` is in the repository root.
- `.nojekyll` exists in the repository root.
- The latest GitHub Pages deployment finished under the repo `Actions` tab.
- Wait a few minutes after pushing; Pages can take time to publish.

## Official GitHub Docs

- GitHub Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Creating a GitHub Pages site: https://docs.github.com/articles/creating-project-pages-using-the-command-line
