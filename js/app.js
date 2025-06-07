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

  // Initialize calendar
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true,
    events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const evts = await loadEvents();
        successCallback(evts);
      } catch (err) {
        failureCallback(err);
      }
    },
    select: async function(info) {
      const title = prompt('Payment title:');
      if (!title) return;
      const amountStr = prompt('Payment amount (€):');
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        alert('Invalid amount');
        return;
      }
      const isMonthly = confirm('Repeat monthly?');
      const toSave = [];
      const baseDate = new Date(info.startStr);
      if (isMonthly) {
        for (let m = 0; m < 12; m++) {
          const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, baseDate.getDate());
          toSave.push({ title, start: d.toISOString().split('T')[0], amount });
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

  // Income form submit
  document.getElementById('income-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const date = this['income-date'].value;
    const desc = this['income-desc'].value;
    const amt = parseFloat(this['income-amount'].value);
    try {
      await saveIncome({ date, desc, amt });
      this.reset();
      await renderIncomeTable();
      renderSummary();
    } catch (err) {
      alert('Error saving income: ' + err.message);
    }
  });

  // Render helpers
  async function renderEventList() {
    const listEl = document.getElementById('event-list');
    const year = new Date().getFullYear();
    const evts = (await loadEvents()).filter(e => new Date(e.start).getFullYear() === year);
    listEl.innerHTML = '<ul>' + evts.map(e => `<li>${e.start}: ${e.title} (€${e.amount.toFixed(2)})</li>`).join('') + '</ul>';
  }

  async function renderIncomeTable() {
    const tbody = document.querySelector('#income-table tbody');
    const inc = await loadIncome();
    tbody.innerHTML = inc.map(i => `
      <tr>
        <td>${i.date}</td>
        <td>${i.desc}</td>
        <td>${i.amt.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  async function renderSummary() {
    const evts = await loadEvents();
    const inc = await loadIncome();
    const sums = {};
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
      tbody.innerHTML += `
        <tr>
          <td>${m}</td>
          <td>${income.toFixed(2)}</td>
          <td>${outcome.toFixed(2)}</td>
          <td>${(income - outcome).toFixed(2)}</td>
        </tr>`;
    }
  }

  // Initial render
  await renderEventList();
  await renderIncomeTable();
  renderSummary();
})();