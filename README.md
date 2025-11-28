## Test Run Control Center

A responsive dashboard for coordinating manual regression testing cycles. Capture quick test cases, track pass/fail outcomes, and monitor overall status without leaving the browser.

### Features

- Add ad-hoc tests with steps and expected outcomes
- Filter the active suite by status (all, pending, pass, fail)
- Update test results inline and record the latest run timestamp
- Inline metrics summarising suite health
- Fully responsive layout with dark-mode support

### Local development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the dashboard.

### Production build

```bash
npm run build
npm run start
```

This project is ready for one-click deployment on Vercel.
