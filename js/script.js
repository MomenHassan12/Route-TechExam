const apiUrl = 'https://api.jsonbin.io/v3/b/669877d3acd3cb34a867a788/latest'; // Replace with your JSONBin URL
const customerTable = document.getElementById('customer-table').getElementsByTagName('tbody')[0];
const filterNameInput = document.getElementById('filter-name');
const filterAmountInput = document.getElementById('filter-amount');
const ctx = document.getElementById('transaction-chart').getContext('2d');
let customers = [];
let transactions = [];
let chart;

document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

async function fetchData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'X-Master-Key': '$2a$10$6FqL0ZPqOAKk1MtVXbn1rOKOeF9BVjERsDDkcjDGT0b9yQju3epei' // Replace with your JSONBin secret key if required
            }
        });
        const data = await response.json();
        customers = data.record.customers;
        transactions = data.record.transactions;

        displayData(customers, transactions);
        updateChart(transactions);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayData(customers, transactions) {
    customerTable.innerHTML = '';
    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const row = customerTable.insertRow();
        row.insertCell(0).textContent = customer.name;
        row.insertCell(1).textContent = transaction.date;
        row.insertCell(2).textContent = transaction.amount;
        row.addEventListener('click', () => {
            updateChart(transactions.filter(t => t.customer_id === transaction.customer_id));
        });
    });
}

function filterData() {
    const filterNameValue = filterNameInput.value.toLowerCase();
    const filterAmountValue = filterAmountInput.value.toLowerCase();
    const filteredTransactions = transactions.filter(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const matchesName = customer.name.toLowerCase().includes(filterNameValue);
        const matchesAmount = transaction.amount.toString().includes(filterAmountValue);
        return matchesName && matchesAmount;
    });
    displayData(customers, filteredTransactions);
}

function updateChart(transactions) {
    const groupedTransactions = transactions.reduce((acc, transaction) => {
        acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
        return acc;
    }, {});

    const labels = Object.keys(groupedTransactions);
    const data = Object.values(groupedTransactions);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Transaction Amount',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }]
        }
    });
}

function initialize() {
    filterNameInput.addEventListener('input', filterData);
    filterAmountInput.addEventListener('input', filterData);
    fetchData();
}

