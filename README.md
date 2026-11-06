# Shahidul Islam — Portfolio

A responsive static portfolio built with HTML, CSS, and vanilla JavaScript.

## Project structure

```text
portfolio/
├── index.html
├── portfolio-edited.html
├── assets/
│   ├── css/
│   │   ├── site.css
│   │   └── tailwind.css
│   ├── images/
│   │   └── silogo.PNG
│   └── js/
│       └── main.js
└── .github/
    └── workflows/
        └── pages.yml
```

`index.html` is the entry point. Keep the complete `assets/` directory alongside it when previewing or deploying. `portfolio-edited.html` redirects visitors using the previous filename to the new entry point.

## Run locally

Open `index.html` in a browser, or start a local static server from this folder:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Codeforces activity

The live recent-submissions panel appears as a glass-style macOS terminal at the top-right of the hero section. It reads the public Codeforces API in the visitor's browser, refreshes every five minutes while the tab is visible, and needs no API key or server. The compact landscape view shows the two latest submissions, adapting to mobile, tablet, and desktop widths. To use a different account, edit the `data-codeforces-handle` value on the `#codeforces-activity` element in `index.html`.

The milestones card calculates a live activity streak from consecutive local calendar days with public submissions. A streak remains active through today or yesterday. Private Codeforces submissions are not requested or exposed by the unauthenticated browser feed. The official API's `includeSources` option is only for source code from your own account; it is not a private-submission switch. Do not put API keys, secrets, or account passwords into frontend files. Any additional authorized data access would need a private server-side integration.

The API must be reachable from the visitor's browser. The configured handle is `Snirex`; confirm it is the intended public account before publishing. The panel displays an error instead of inventing activity when the API cannot provide submissions.

## Deploy with GitHub Pages

1. Create a GitHub repository for this project and push the contents of this folder to its default branch.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. The included `.github/workflows/pages.yml` workflow deploys the static site after a push to `main`. If your default branch has a different name, update the workflow trigger to match.
4. Wait for the workflow to finish, then open `https://shahidulinit.github.io/`. Both the public repository and published site are accessible to anyone.

## Editing and repository access

There is no browser-based admin login or editor. Edit the portfolio files locally and push changes to the repository to publish updates.

This portfolio intentionally publishes its displayed name, email, city, university, profile links, and project links. Do not add passwords, private contact details, credentials, or other information you do not want public. Push changes to `main` to trigger the Pages workflow.
