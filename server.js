const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Record Shop API',
      version: '1.0.0',
      description: 'A simple Express API for managing a record shop with authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        UserAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-email',
          description: 'User email for authentication'
        }
      }
    }
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== In-memory data (for teaching / demo) =====

// Fake users for login
const users = [
  {
    id: 1,
    email: 'clerk@recordshop.com',
    password: 'password',      // in real life: hash it!
    role: 'clerk',             // Sales Clerk: view + add
    name: 'Chris Clerk'
  },
  {
    id: 2,
    email: 'manager@recordshop.com',
    password: 'password',
    role: 'manager',           // Store Manager: view + add + update
    name: 'Mandy Manager'
  },
  {
    id: 3,
    email: 'admin@recordshop.com',
    password: 'password',
    role: 'admin',             // System Admin: full CRUD
    name: 'Alex Admin'
  }
];

// Formats & genres (to be fetched via API on frontend)
const formats = ['Vinyl', 'CD'];
const genres = ['Rock', 'Pop', 'Jazz', 'Hip-Hop', 'Classical', 'Electronic'];

// Simple in-memory records array
let nextRecordId = 7;

let records = [
  {
    id: 1,
    title: "Californication",
    artist: "Red Hot Chili Peppers",
    format: "Vinyl",
    genre: "Rock",
    releaseYear: 1999,
    price: 29.99,
    stockQty: 8,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  },
  {
    id: 2,
    title: "Black Summer",
    artist: "Red Hot Chili Peppers",
    format: "CD",
    genre: "Rock",
    releaseYear: 2022,
    price: 14.99,
    stockQty: 12,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  },
  {
    id: 3,
    title: "Audioslave",
    artist: "Audioslave",
    format: "Vinyl",
    genre: "Rock",
    releaseYear: 2002,
    price: 27.99,
    stockQty: 6,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  },
  {
    id: 4,
    title: "Stony Hill",
    artist: "Damian Marley",
    format: "CD",
    genre: "Reggae",
    releaseYear: 2017,
    price: 12.99,
    stockQty: 9,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  },
  {
    id: 5,
    title: "The Bends",
    artist: "Radiohead",
    format: "Vinyl",
    genre: "Alternative",
    releaseYear: 1995,
    price: 26.99,
    stockQty: 5,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  },
  {
    id: 6,
    title: "OK Computer",
    artist: "Radiohead",
    format: "Vinyl",
    genre: "Alternative",
    releaseYear: 1997,
    price: 28.99,
    stockQty: 4,
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerContact: "",
    customerEmail: ""
  }
];

// ===== Authentication Middleware =====
const authenticate = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ message: 'Authentication required. Please provide x-user-email header.' });
  }
  
  const user = users.find(u => u.email === userEmail);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid user credentials.' });
  }
  
  req.user = user;
  next();
};

// ===== Routes =====

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.send('Record Shop API is running');
});

// ---- Auth: POST /api/login ----
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@recordshop.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // In a real app, you would return a JWT. For this assignment we just return user info.
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// ---- Formats & Genres ----
/**
 * @swagger
 * /api/formats:
 *   get:
 *     summary: Get all formats
 *     description: Retrieve list of available record formats
 *     responses:
 *       200:
 *         description: List of formats
 */
app.get('/api/formats', (req, res) => {
  res.json(formats);
});

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get all genres
 *     description: Retrieve list of available music genres
 *     responses:
 *       200:
 *         description: List of genres
 */
app.get('/api/genres', (req, res) => {
  res.json(genres);
});

// ---- Records CRUD ----

// GET all records (list view)
/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all records (Protected)
 *     description: Retrieve all records from the store. Requires authentication.
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: header
 *         name: x-user-email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email for authentication (e.g., admin@recordshop.com)
 *         example: admin@recordshop.com
 *     responses:
 *       200:
 *         description: List of all records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Authentication required
 */
app.get('/api/records', authenticate, (req, res) => {
  res.json(records);
});

// GET single record by id (view details)
/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get record by ID (Protected)
 *     description: Retrieve a specific record by its ID. Requires authentication.
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Record ID
 *       - in: header
 *         name: x-user-email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email for authentication
 *         example: admin@recordshop.com
 *     responses:
 *       200:
 *         description: Record details
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Record not found
 */
app.get('/api/records/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const record = records.find(r => r.id === id);

  if (!record) {
    return res.status(404).json({ message: 'Record not found.' });
  }

  res.json(record);
});

// POST create new record
/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create new record (Protected)
 *     description: Add a new record to the store. Requires authentication.
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: header
 *         name: x-user-email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email for authentication
 *         example: admin@recordshop.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - format
 *               - genre
 *               - releaseYear
 *               - price
 *               - stockQty
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               format:
 *                 type: string
 *               genre:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               price:
 *                 type: number
 *               stockQty:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Record created successfully
 *       401:
 *         description: Authentication required
 */
app.post('/api/records', authenticate, (req, res) => {
  const body = req.body;

  const newRecord = {
    id: nextRecordId++,
    title: body.title,
    artist: body.artist,
    format: body.format,
    genre: body.genre,
    releaseYear: body.releaseYear,
    price: body.price,
    stockQty: body.stockQty,
    customerId: body.customerId || '',
    customerFirstName: body.customerFirstName || '',
    customerLastName: body.customerLastName || '',
    customerContact: body.customerContact || '',
    customerEmail: body.customerEmail || ''
  };

  records.push(newRecord);
  res.status(201).json(newRecord);
});

// PUT update record
/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update record (Protected)
 *     description: Update an existing record. Requires authentication.
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Record ID
 *       - in: header
 *         name: x-user-email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email for authentication
 *         example: admin@recordshop.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Record not found
 */
app.put('/api/records/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = records.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const body = req.body;

  records[index] = {
    ...records[index],
    title: body.title,
    artist: body.artist,
    format: body.format,
    genre: body.genre,
    releaseYear: body.releaseYear,
    price: body.price,
    stockQty: body.stockQty,
    customerId: body.customerId || '',
    customerFirstName: body.customerFirstName || '',
    customerLastName: body.customerLastName || '',
    customerContact: body.customerContact || '',
    customerEmail: body.customerEmail || ''
  };

  res.json(records[index]);
});

// DELETE record
/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Delete record (Protected)
 *     description: Delete a record from the store. Requires authentication.
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Record ID
 *       - in: header
 *         name: x-user-email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email for authentication
 *         example: admin@recordshop.com
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Record not found
 */
app.delete('/api/records/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = records.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const deleted = records.splice(index, 1)[0];
  res.json({ message: 'Record deleted.', record: deleted });
});

// Start server
app.listen(PORT, () => {
  console.log(`Record Shop API listening on http://localhost:${PORT}`);
});
