# Job Shelf

A clean, modern job application tracker built with pure **HTML**, **CSS**, and **JavaScript**.

Track your job applications, update their status, add notes, and never lose your data — everything is saved in your browser using `localStorage`.

![Dark Mode](https://via.placeholder.com/800x400?text=Job+Tracker+-+Dark+Mode)
![Light Mode](https://via.placeholder.com/800x400?text=Job+Tracker+-+Light+Mode)

---

## Features

- **Add, Edit & Delete** job applications
- **View** full details of any application
- **Bulk select & delete** multiple jobs at once
- **Search** by company name
- **Filter** by status
- **Sort** by date applied (newest / oldest)
- **Dark mode** by default + light mode toggle
- **Import / Export** data as JSON
- **Persistent storage** using `localStorage`
- Fully responsive design
- Clean, minimal UI

### Status Options
- Applied
- Screening
- Interview
- Offer
- Rejected
- Ghosted
- Withdrawn

### Fields Tracked
| Field              | Required |
|--------------------|----------|
| Company Name       | Yes      |
| Job Title          | Yes      |
| Status             | Yes      |
| Date Applied       | Yes      |
| Location           | No       |
| Salary             | No       |
| Company Website    | No       |
| Job Link           | No       |
| Contact Person     | No       |
| Contact Email      | No       |
| Notes              | No       |

---

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser

No build tools or dependencies required.

```bash
# Optional: run a local server
npx serve .