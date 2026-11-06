document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.classList.toggle('hidden', isExpanded);
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.add('hidden');
            });
        });
    }

    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }

    const currentYear = document.getElementById('current-year');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

    const activitySection = document.getElementById('codeforces-activity');
    if (activitySection) {
        const handle = activitySection.dataset.codeforcesHandle;
        const submissionsElement = document.getElementById('codeforces-submissions');
        const statusElement = document.getElementById('codeforces-status');
        const updatedElement = document.getElementById('codeforces-updated');
        const refreshButton = document.getElementById('codeforces-refresh');
        const streakCountElement = document.getElementById('act-streak-count');
        const streakDescriptionElement = document.getElementById('act-desc-3');
        const streakLastActivityElement = document.getElementById('act-streak-last');
        let refreshInProgress = false;

        function renderSubmissions(submissions) {
            submissionsElement.replaceChildren();

            submissions.forEach((submission) => {
                const problem = submission.problem || {};
                const row = document.createElement('a');
                const title = document.createElement('span');
                const metadata = document.createElement('span');
                const rating = Number.isFinite(problem.rating) ? ` • ${problem.rating}` : '';
                const verdict = submission.verdict || 'TESTING';
                const verdictDisplay = {
                    OK: 'AC',
                    WRONG_ANSWER: 'WA',
                    TIME_LIMIT_EXCEEDED: 'TLE',
                    MEMORY_LIMIT_EXCEEDED: 'MLE',
                    COMPILATION_ERROR: 'CE',
                }[verdict] || verdict.replaceAll('_', ' ');
                const date = new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }).format(new Date(submission.creationTimeSeconds * 1000));

                row.className = 'submission-row block rounded-lg border border-white/10 bg-black/20 p-3 transition hover:border-blue-400/40';
                row.href = `https://codeforces.com/contest/${encodeURIComponent(submission.contestId)}/submission/${encodeURIComponent(submission.id)}`;
                row.target = '_blank';
                row.rel = 'noopener noreferrer';
                title.className = 'submission-title block text-sm font-semibold text-gray-100';
                title.textContent = `${problem.name || 'Unknown problem'}${rating}`;
                metadata.className = 'submission-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-400';
                const verdictBadge = document.createElement('span');
                verdictBadge.className = `submission-verdict submission-verdict-${verdict}`;
                verdictBadge.textContent = verdictDisplay;
                metadata.append(verdictBadge, document.createTextNode(date));
                row.append(title, metadata);
                submissionsElement.append(row);
            });
        }

        async function fetchSubmissions(from, count) {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 12000);
            const url = new URL('https://codeforces.com/api/user.status');
            url.search = new URLSearchParams({
                handle,
                from: String(from),
                count: String(count),
            }).toString();

            try {
                const response = await fetch(url, { signal: controller.signal });
                const result = await response.json();
                if (!response.ok || result.status !== 'OK') {
                    throw new Error(result.comment || `Codeforces returned HTTP ${response.status}.`);
                }
                return Array.isArray(result.result) ? result.result : [];
            } finally {
                window.clearTimeout(timeout);
            }
        }

        function localDayNumber(timestampSeconds) {
            const date = new Date(timestampSeconds * 1000);
            return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
        }

        function renderStreak(streakDays, mostRecentSubmission) {
            streakCountElement.textContent = `${streakDays} ${streakDays === 1 ? 'day' : 'days'} streak`;
            streakDescriptionElement.textContent = streakDays
                ? 'Consecutive calendar days with public submissions. Private activity is not available from this browser-only API.'
                : 'No active public streak. Private submissions are not available from this browser-only API.';
            streakLastActivityElement.textContent = mostRecentSubmission
                ? `Last: ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(mostRecentSubmission * 1000))}`
                : 'No public submissions found';
        }

        async function calculateStreak(firstBatch) {
            if (!firstBatch.length) {
                renderStreak(0, null);
                return;
            }

            const today = localDayNumber(Date.now() / 1000);
            let expectedDay = today;
            let streakDays = 0;
            let lastCountedDay = null;
            let mostRecentSubmission = firstBatch[0].creationTimeSeconds;
            let batch = firstBatch;
            let from = firstBatch.length + 1;

            while (true) {
                for (const submission of batch) {
                    const submissionDay = localDayNumber(submission.creationTimeSeconds);
                    if (submissionDay > expectedDay) continue;
                    if (expectedDay - submissionDay > 1) {
                        renderStreak(streakDays, mostRecentSubmission);
                        return;
                    }
                    if (submissionDay === expectedDay - 1) expectedDay = submissionDay;
                    if (submissionDay !== lastCountedDay) {
                        streakDays += 1;
                        lastCountedDay = submissionDay;
                    }
                }

                if (batch.length < 1000) break;
                await new Promise((resolve) => window.setTimeout(resolve, 2000));
                batch = await fetchSubmissions(from, 1000);
                from += batch.length;
                if (!batch.length) break;
            }

            renderStreak(streakDays, mostRecentSubmission);
        }

        async function refreshCodeforcesData() {
            if (refreshInProgress) return;
            refreshInProgress = true;
            refreshButton.disabled = true;
            statusElement.textContent = `Connecting to Codeforces for ${handle}…`;

            try {
                const submissions = await fetchSubmissions(1, 1000);
                if (!submissions.length) {
                    submissionsElement.replaceChildren();
                    statusElement.textContent = `No public submissions were found for ${handle}.`;
                } else {
                    renderSubmissions(submissions.slice(0, 2));
                    statusElement.textContent = `Showing ${Math.min(submissions.length, 2)} recent public submissions.`;
                }
                updatedElement.textContent = `Updated ${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date())}`;
                await calculateStreak(submissions);
            } catch (error) {
                const message = error.name === 'AbortError'
                    ? 'Codeforces took too long to respond. Try again shortly.'
                    : error.message.includes('not found')
                        ? `Codeforces could not find “${handle}”. Check the handle configured on this section.`
                        : `Could not load Codeforces activity: ${error.message}`;
                statusElement.textContent = message;
                submissionsElement.replaceChildren();
                streakDescriptionElement.textContent = 'Could not load the public Codeforces activity streak.';
                streakLastActivityElement.textContent = 'Unavailable';
            } finally {
                refreshButton.disabled = false;
                refreshInProgress = false;
            }
        }

        refreshButton.addEventListener('click', refreshCodeforcesData);
        refreshCodeforcesData();
        window.setInterval(() => {
            if (!document.hidden) refreshCodeforcesData();
        }, 300000);
    }
});
