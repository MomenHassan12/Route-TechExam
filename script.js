document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:8080';

    const customerTable = document.getElementById('customer-table').getElementsByTagName('tbody')[0];
    const filterInput = document.getElementById('filter');
    const ctx = document.getElementById('transaction-chart').getContext('2d');
    let customers = [];
    let transactions = [];
    let chart;

    const fetchData = async () => {
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
    };

    const displayData = (customers, transactions) => {
        customerTable.innerHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            const row = customerTable.insertRow();
            row.insertCell(0).textContent = customer.name;
            row.insertCell(1).textContent = transaction.date;
            row.insertCell(2).textContent = transaction.amount;
            row.addEventListener('click', () => {
                console.log('Selected customer ID:', transaction.customer_id);
                updateChart(transactions.filter(t => t.customer_id === transaction.customer_id));
            });
        });
    };

    const filterData = () => {
        const filterValue = filterInput.value.toLowerCase();
        const filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            return customer.name.toLowerCase().includes(filterValue) || transaction.amount.toString().includes(filterValue);
        });
        displayData(customers, filteredTransactions);
    };

    const updateChart = (transactions) => {
        const groupedTransactions = transactions.reduce((acc, transaction) => {
            acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
            return acc;
        }, {});

        const labels = Object.keys(groupedTransactions);
        const data = Object.values(groupedTransactions);

        console.log('Updating chart with data:', data);

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
    };

    filterInput.addEventListener('input', filterData);

    fetchData();
});
