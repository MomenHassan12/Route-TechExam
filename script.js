
let customers = [];
let transactions = [];
const apiUrl = 'http://localhost:8080';
document.addEventListener('DOMContentLoaded', () => {

    fetchData();
});

async function fetchData() {
    const customerResponse = await fetch(`${apiUrl}/customers`);
    const transactionResponse = await fetch(`${apiUrl}/transactions`);
    customers = await customerResponse.json();
    transactions = await transactionResponse.json();
    console.log(customers)
    console.log(transactions)

};