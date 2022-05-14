const express = require('express');
const req = require('express/lib/request');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyIfExistsAccountCpf(req, res, next) {
    const { cpf } = req.headers;
    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
    }

    req.customer = customer;

    return next();
};

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}


app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some((costumer) => costumer.cpf === cpf)

    if (customerAlreadyExists) {
        return res.status(400).json({ error: "Customer alredy exists!" })
    }

    customers.push({
        id: uuidv4(),
        cpf,
        name,
        statement: []
    });
    return res.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;

    return res.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccountCpf, (req, res) => {
    const { description, amount } = req.body;

    const { customer } = req;

    const operationStatement = {
        description,
        amount,
        created_at: new Date(),
        type: 'Debito'
    }

    customer.statement.push(operationStatement);

    return res.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;

    const { date } = req.query;

    const dateFormat = new Date(date, + ' 00:00')

    const statement = costumer.statement.filter(
        (statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return res.json(customer.statement);
});

app.post('/withdraw', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;
    const { amount } = req.body;

    const balance = getBalance(customer.statement);

    if (amount > balance) {
        return res.status(400).json({ error: 'Insuficient funds' })
    }
    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'Debit'
    }
    customers.statement.push(statementOperation);

    return res.status(201).send();
});

app.put('/account', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;
    const { name } = req.body;

    customer.name = name;

    return res.status(201).send();
});

app.get('/account', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;

    return res.json(customer);
});

app.delete('/account', verifyIfExistsAccountCpf, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(204);
});


app.listen(4000);