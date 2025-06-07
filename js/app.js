(async function() {
  // Helper to fetch JSON
  async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }

  // Load/Save Events
  async function loadEvents() {
    return fetchJSON('/api/events');
  }
  async function saveEvents(newEvents) {
    return fetchJSON('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvents)
    });
  }

  // Load/Save Income
  async function loadIncome() {
    return fetchJSON('/api/income');
  }
  async function saveIncome(item) {
    return fetchJSON('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  }

  // Initialize FullCalendar
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true,
    eventSources: [
      {
        // Payment events (red)
        events: async function(info, successCallback, failureCallback) {
          try {
            const evts = await loadEvents();
            successCallback(evts);
          } catch (err) {
            failureCallback(err);
          }
        },
        color: '#e74c3c', textColor: '#fff', className: 'payment-event'
      },
      {
        // Income events (green)
        events: async function(info, successCallback, failureCallback) {
          try {
            const inc = await loadIncome();
            const evtIncome = inc.map(i => ({
              title: `${i.desc} (€${i.amt.toFixed(2)})`,
              start: i.date,
              className: 'income-event'
            }));
            successCallback(evtIncome);
          } catch (err) {
            failureCallback(err);
          }
        },
        color: '#2ecc71', textColor: '#000', className: 'income-event'
      }
    ],
    select: async function(info) {
      // Prompt for title and amount
      const title = prompt('Payment title:');
      if (!title) return;
      const amountStr = prompt('Payment amount (€):');
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        alert('Invalid amount'); return;
      }
      const isMonthly = confirm('Repeat monthly?');
      const toSave = [];
      // Parse selected date to preserve exact day
      const [year, month, day] = info.startStr.split('-').map(Number);
      if (isMonthly) {
        // Only remaining months of the selected year
        for (let m = month; m <= 12; m++) {
          const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          toSave.push({ title, start: dateStr, amount });
        }
      } else {
        toSave.push({ title, start: info.startStr, amount });
      }
      try {
        await saveEvents(toSave);
        calendar.refetchEvents();
        await renderEventList();
        renderSummary();
      } catch (err) {
        alert('Error saving events: ' + err.message);
      }
    }
  });
  calendar.render();

  // Handle income form submission
  document.getElementById('income-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const date = this['income-date'].value;
    const desc = this['income-desc'].value;
    const amt = parseFloat(this['income-amount'].value);
    try {
      await saveIncome({ date, desc, amt });
      this.reset();
      await renderIncomeTable();
      calendar.refetchEvents();
      renderSummary();
    } catch (err) {
      alert('Error saving income: ' + err.message);
    }
  });

  // Render event list in sidebar
  async function renderEventList() {
    const listEl = document.getElementById('event-list');
    const year = new Date().getFullYear();
    const evts = (await loadEvents()).filter(e => new Date(e.start).getFullYear() === year);
    listEl.innerHTML = '<ul>' + evts.map(e => `<li>${e.start}: ${e.title} (€${e.amount.toFixed(2)})</li>`).join('') + '</ul>';
  }

  // Render income table
  async function renderIncomeTable() {
    const tbody = document.querySelector('#income-table tbody');
    const inc = await loadIncome();
    tbody.innerHTML = inc.map(i => `
      <tr>
        <td>${i.date}</td>
        <td>${i.desc}</td>
        <td class="text-end">${i.amt.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  // Render monthly summary with month names
  async function renderSummary() {
    const evts = await loadEvents();
    const inc = await loadIncome();
    const sums = {};
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    for (let m = 1; m <= 12; m++) sums[m] = { income: 0, outcome: 0 };
    inc.forEach(item => {
      const mon = new Date(item.date).getMonth() + 1;
      sums[mon].income += item.amt;
    });
    evts.forEach(item => {
      const mon = new Date(item.start).getMonth() + 1;
      sums[mon].outcome += item.amount;
    });
    const tbody = document.querySelector('#summary-table tbody');
    tbody.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const { income, outcome } = sums[m];
      const label = monthNames[m - 1];
      tbody.innerHTML += `
        <tr>
          <td>${label}</td>
          <td class="text-end">${income.toFixed(2)}</td>
          <td class="text-end">${outcome.toFixed(2)}</td>
          <td class="text-end">${(income - outcome).toFixed(2)}</td>
        </tr>`;
    }
  }

  // Initial render
  await renderEventList();
  await renderIncomeTable();
  renderSummary();
})();
