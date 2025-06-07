(async function() {
  // Helper for JSON requests
  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  // CRUD for events (expenses)
  async function loadEvents() {
    return fetchJSON('/api/events');
  }
  async function saveEvents(newEvents) {
    // POST only the new ones
    return fetchJSON('/api/events', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newEvents)
    });
  }

  // CRUD for income
  async function loadIncome() {
    return fetchJSON('/api/income');
  }
  async function saveIncome(item) {
    return fetchJSON('/api/income', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(item)
    });
  }

  // Initialize calendar
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    eventSources: [
      {
        // Expenses (payments)
        events: async (fetchInfo, successCallback) => {
          const evts = await loadEvents();
          successCallback(evts.map(e => ({
            id: e.id,
            title: `${e.title} (€${e.amount.toFixed(2)})`,
            start: e.start,
            className: 'expense-event'
          })));
        }
      },
      {
        // Income
        events: async (fetchInfo, successCallback) => {
          const inc = await loadIncome();
          successCallback(inc.map(i => ({
            id: i.id,
            title: `${i.desc} (€${i.amt.toFixed(2)})`,
            start: i.date,
            className: 'income-event'
          })));
        }
      }
    ],
    select: async info => {
      // Expense creation dialog
      const name = prompt('Expense Name:');
      if (!name) return;

      let amount = parseFloat(prompt('Expense Amount (€):'));
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive number for amount.');
        return;
      }

      const isRecurring = confirm('Recurring Monthly Expense?');
      const baseDate = info.startStr;          // YYYY-MM-DD
      const [year, month, day] = baseDate.split('-').map(Number);
      const evtsToSave = [];

      if (isRecurring) {
        // Only from selected month through December of this year
        for (let m = month; m <= 12; m++) {
          evtsToSave.push({
            title: name,
            amount,
            start: `${year}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          });
        }
      } else {
        evtsToSave.push({ title: name, amount, start: baseDate });
      }

      await saveEvents(evtsToSave);
      calendar.refetchEvents();
      renderEventList();
      renderSummary();
    }
  });

  calendar.render();

  // Income form handler
  document.getElementById('income-form').addEventListener('submit', async e => {
    e.preventDefault();
    const date = e.target['income-date'].value;
    const desc = e.target['income-desc'].value.trim();
    const amt = parseFloat(e.target['income-amount'].value);

    if (!date || !desc || isNaN(amt) || amt <= 0) {
      alert('Please fill out all income fields correctly.');
      return;
    }

    await saveIncome({ date, desc, amt });
    calendar.refetchEvents();
    renderIncomeTable();
    renderSummary();
    e.target.reset();
  });

  // ----- Rendering helpers -----

  async function renderEventList() {
    const listEl = document.getElementById('event-list');
    const year = new Date().getFullYear();
    const evts = (await loadEvents())
      .filter(e => new Date(e.start).getFullYear() === year)
      .sort((a,b) => a.start.localeCompare(b.start));

    if (!evts.length) {
      listEl.innerHTML = '<p class="text-muted">No scheduled expenses.</p>';
      return;
    }

    listEl.innerHTML = '<ul class="list-unstyled mb-0">' +
      evts.map(e =>
        `<li>
           <strong>${e.start}</strong> — ${e.title}
           <span class="float-end">€${e.amount.toFixed(2)}</span>
         </li>`
      ).join('') +
      '</ul>';
  }

  async function renderIncomeTable() {
    const rows = (await loadIncome())
      .sort((a,b) => a.date.localeCompare(b.date))
      .map(i =>
        `<tr>
           <td>${i.date}</td>
           <td>${i.desc}</td>
           <td class="text-end">€${i.amt.toFixed(2)}</td>
         </tr>`
      ).join('');
    document.getElementById('income-table-body').innerHTML = rows;
  }

  async function renderSummary() {
    const inc = await loadIncome();
    const exp = await loadEvents();
    const now = new Date();
    const thisYear = now.getFullYear();

    // Initialize months Jan–Dec
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(thisYear, i).toLocaleString('default', { month: 'long' }),
      income: 0,
      expenses: 0
    }));

    inc.forEach(i => {
      const d = new Date(i.date);
      if (d.getFullYear() === thisYear) {
        months[d.getMonth()].income += i.amt;
      }
    });
    exp.forEach(e => {
      const d = new Date(e.start);
      if (d.getFullYear() === thisYear) {
        months[d.getMonth()].expenses += e.amount;
      }
    });

    // Build rows
    const rows = months.map(m =>
      `<tr>
         <td>${m.name}</td>
         <td class="text-end">€${m.income.toFixed(2)}</td>
         <td class="text-end">€${m.expenses.toFixed(2)}</td>
         <td class="text-end">€${(m.income - m.expenses).toFixed(2)}</td>
       </tr>`
    ).join('');

    document.getElementById('summary-table-body').innerHTML = rows;
  }

  // Initial render
  await renderEventList();
  await renderIncomeTable();
  await renderSummary();

})();
