const express = require('express');
const swagerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 3000;

app.use(express.json());

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swagerUi.serve, swagerUi.setup(swaggerDocument));
app.use(OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/docs.*/
}));

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

app.get('/v1/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.get('/v2/hello', (req, res) => {
    res.json({ message: 'Hello World', version: '2', timestamp: new Date().toISOString() });
});

app.post('/v1/users', (req, res) => {
    const { name, age, email } = req.body;
    const newUser = {
        id: Date.now().toString(),
        name,
        age,
        email
    };
    res.status(201).json(newUser);
});


const users = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Franco', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Alice Garcia', age: 28, email: 'alice@example.com' }
];

app.get('/v1/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({
        id: user.id,
        name: user.name
    });
});


app.put('/v1/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, age, email } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    const updatedUser = { id: userId, name, age, email };
    users[userIndex] = updatedUser;
    res.json(updatedUser);
});

let products = [
    {
        id: '1',
        name: 'Laptop',
        description: 'A powerful laptop',
        price: 1200.00,
        category: 'electronics',
        tags: ['portable', 'tech'],
        inStock: true,
        specifications: { brand: 'BrandX', color: 'silver' },
        ratings: [{ score: 4.5, comment: 'Great!' }]
    },
    {
        id: '2',
        name: 'Book',
        description: 'A good book',
        price: 20.00,
        category: 'books',
        tags: ['reading'],
        inStock: true,
        specifications: { author: 'AuthorY' },
        ratings: [{ score: 5, comment: 'Excellent read' }]
    }
];

app.post('/v1/products', (req, res) => {
    const newProduct = {
        id: Date.now().toString(),
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/v1/products', (req, res) => {
    res.json(products);
});

app.get('/v1/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
});

app.put('/v1/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const updatedProduct = { id: req.params.id, ...req.body };
    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
});

app.delete('/v1/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    products.splice(productIndex, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}/v1`);
    console.log(`http://localhost:${port}/v2`);
});
