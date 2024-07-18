const apiUrl = 'https://route-techexam.onrender.com'; //http://localhost:8080 
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
        const customerResponse = await fetch(`${apiUrl}/customers`);
        const transactionResponse = await fetch(`${apiUrl}/transactions`);
        customers = await customerResponse.json();
        transactions = await transactionResponse.json();

        if (!Array.isArray(customers) || !Array.isArray(transactions)) {
            throw new Error('Fetched data is not an array');
        }

        console.log('Customers:', customers);
        console.log('Transactions:', transactions);

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

