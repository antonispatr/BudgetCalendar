# BudgetCalendar

A modern, single‑page **Budget Management** app built with **FullCalendar**, **Bootstrap**, and **Node/Express**. Track your **expenses** and **revenues**, schedule recurring items, and get a clear monthly overview of your cash flow.

---

## 📖 Terminology

| Term          | Definition                                     |
| ------------- | ---------------------------------------------- |
| **Expense**   | A payment or cost you incur (e.g. rent, bills) |
| **Revenue**   | An income source (e.g. salary, sales)          |
| **Entry**     | A single expense or revenue record             |
| **Recurring** | An entry that repeats on a defined schedule    |
| **Net Flow**  | `Total Revenue − Total Expense` for a period   |

---

## ✨ Features

### Core

* **Interactive Calendar**: Visualize expenses (red) and revenues (green) side by side.
* **One‑off & Recurring**: Create single or monthly entries for the current year.
* **Sidebar Lists**: Year‑to‑date roll‑up of expenses and revenues.
* **Monthly Summary**: Tabular breakdown of Revenue, Expense, and Net Flow for Jan–Dec.

### Advanced

* **Categories & Tags**: *(Planned)* Assign categories (Housing, Utilities, Salary, etc.) and filter by tag.
* **Dark/Light Theme**: *(Planned)* Toggle between light and dark modes for eye comfort.
* **Charts & Reports**: *(Planned)* Integrate Chart.js or Recharts for interactive graphs.
* **Import/Export**: *(Planned)* CSV/Excel import and export of entries.
* **User Authentication**: *(Planned)* Multi‑user support with login/signup.

---

## 🚀 Quick Start

### Requirements

* [Node.js](https://nodejs.org/) ≥ 14
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Clone & Install

```bash
git clone https://github.com/antonispatr/BudgetCalendar.git
cd BudgetCalendar
npm install
```

### Run Locally (Node)

```bash
npm start
# App listens on http://localhost:3000
```

### Run with Docker Compose

```bash
docker-compose up -d --build
# App available at http://localhost:9090
```

---

## 🎨 Styling & Customization

* **Google Fonts**: Roboto
* **Bootstrap 5**: Utility‑first layout and components
* **Custom CSS**: `css/styles.css` for theme, card shadows, scrollbars, and FullCalendar overrides.

Adjust colors, typography, or spacing by editing the Sass/CSS variables in `css/styles.css`.

---

## 🛠️ Project Structure

```
BudgetCalendar/
├── data/                # JSON storage (events.json, income.json)
├── css/
│   └── styles.css       # Custom theme overrides
├── js/
│   └── app.js           # Main frontend logic
├── server.js            # Express API + static server
├── package.json         # Node dependencies & scripts
├── Dockerfile           # Container image definition
├── docker-compose.yml   # Local dev & persistence
└── README.md            # This documentation
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit your changes (`git commit -m 'Add xyz feature'`)
4. Push to your branch (`git push origin feature/xyz`)
5. Open a Pull Request

Please follow the existing code style and add tests for new features where applicable.

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
