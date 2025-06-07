document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true,
    events: loadEvents(),
    select: function(info) {
      let title = prompt('Payment title:');
      if (title) {
        let isMonthly = confirm('Repeat monthly?');
        if (isMonthly) {
          addMonthlyEvents(title, info.startStr);
        } else {
          addEvent(title, info.startStr);
        }
        calendar.removeAllEvents();
        calendar.addEventSource(loadEvents());
        renderEventList();
        renderSummary();
      }
    }
  });
  calendar.render();

  document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let date = this['income-date'].value;
    let desc = this['income-desc'].value;
    let amt = parseFloat(this['income-amount'].value);
    saveIncome({ date, desc, amt });
    renderIncomeTable();
    renderSummary();
    this.reset();
  });

  renderEventList();
  renderIncomeTable();
  renderSummary();

  function loadEvents() {
    return JSON.parse(localStorage.getItem('events') || '[]');
  }
  function saveEvents(evts) {
    localStorage.setItem('events', JSON.stringify(evts));
  }
  function addEvent(title, date) {
    let evts = loadEvents();
    evts.push({ title, start: date });
    saveEvents(evts);
  }
  function addMonthlyEvents(title, date) {
    let base = new Date(date);
    let evts = loadEvents();
    for (let m=0; m<12; m++) {
      let d = new Date(base.getFullYear(), base.getMonth()+m, base.getDate());
      evts.push({ title, start: d.toISOString().split('T')[0] });
    }
    saveEvents(evts);
  }
  function renderEventList() {
    let list = document.getElementById('event-list');
    let year = new Date().getFullYear();
    let evts = loadEvents().filter(e=>new Date(e.start).getFullYear()===year);
    list.innerHTML = '<ul>' + evts.map(e=>`<li>${e.start}: ${e.title}</li>`).join('') + '</ul>';
  }

  function saveIncome(items) {
    let inc = JSON.parse(localStorage.getItem('income')||'[]');
    inc.push(items);
    localStorage.setItem('income', JSON.stringify(inc));
  }
  function loadIncome() {
    return JSON.parse(localStorage.getItem('income')||'[]');
  }
  function renderIncomeTable() {
    let tbody = document.querySelector('#income-table tbody');
    tbody.innerHTML = loadIncome().map(i=>`<tr><td>${i.date}</td><td>${i.desc}</td><td>${i.amt.toFixed(2)}</td></tr>`).join('');
  }

  function renderSummary() {
    let incomes = loadIncome();
    let sums = {};
    for (let m=1; m<=12; m++) sums[m] = { income:0, outcome:0 };
    incomes.forEach(i=>{ sums[new Date(i.date).getMonth()+1].income += i.amt; });
    let tbody = document.querySelector('#summary-table tbody');
    tbody.innerHTML = '';
    for (let m=1; m<=12; m++) {
      let { income, outcome } = sums[m];
      tbody.innerHTML += `<tr><td>${m}</td><td>${income.toFixed(2)}</td><td>${outcome.toFixed(2)}</td><td>${(income-outcome).toFixed(2)}</td></tr>`;
    }
  }
});
