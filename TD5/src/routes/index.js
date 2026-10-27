import { Router } from 'express';
import { getAllContacts, getContactById, updateContact, removeContact, addContact } from '../controllers/contactController.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', function (req, res) {
    res.status(200).json({
        status: 'API is Working',
        message: 'Welcome!',
    });
});

/**
 * @openapi
 * /contacts:
 *   get:
 *     description: All contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns all the contacts
 *       '404':
 *         description: Contacts not found
 */
router.route('/contacts').get(requireAuth, async (req, res) => {
    let response = await getAllContacts();
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     description: One contact by its id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact id
 *     responses:
 *       '200':
 *         description: Returns the contact
 *       '404':
 *         description: Contact not found
 */
router.route('/contacts/:id').get(requireAuth, async (req, res) => {
    let response = await getContactById(req.params.id);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts:
 *   post:
 *     description: Create a new contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       '201':
 *         description: Returns the created contact
 *       '400':
 *         description: Invalid data, contact not created
 */
router.route('/contacts').post(requireAuth, async (req, res) => {
    let response = await addContact(req.body);
    if (response.success == true) {
        res.status(201).json(response);
    } else {
        res.status(400).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     description: Update a contact (only the given fields are changed)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       '200':
 *         description: Returns the updated contact
 *       '404':
 *         description: Contact not found
 */
router.route('/contacts/:id').put(requireAuth, async (req, res) => {
    let response = await updateContact(req.params.id, req.body.name, req.body.age);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     description: Delete a contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact id
 *     responses:
 *       '200':
 *         description: Returns the deleted contact
 *       '404':
 *         description: Contact not found
 */
router.route('/contacts/:id').delete(requireAuth, async (req, res) => {
    let response = await removeContact(req.params.id);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Credentials'
 *     responses:
 *       '201':
 *         description: User created
 *       '400':
 *         description: Missing data or email already used
 */
router.route('/auth/register').post(async (req, res) => {
    let response = await registerUser(req.body);
    if (response.success == true) {
        res.status(201).json(response);
    } else {
        res.status(400).json(response);
    }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Log in and get a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Credentials'
 *     responses:
 *       '200':
 *         description: Returns a JWT token
 *       '401':
 *         description: Invalid credentials
 */
router.route('/auth/login').post(async (req, res) => {
    let response = await loginUser(req.body);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(401).json(response);
    }
});

export default router;
    