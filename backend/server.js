const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/financial_delivery_db';

app.use(cors());
app.use(express.json());

// --- Mongoose Schemas ---

const SettingsSchema = new mongoose.Schema({
    exchangeRate: { type: Number, default: 5.0 }
}, { timestamps: true });

const ObjectiveSchema = new mongoose.Schema({
    id: String,
    title: String,
    amount: Number,
    isUSD: Boolean
}, { timestamps: true, strict: false });

const DebtSchema = new mongoose.Schema({
    id: String,
    creditor: String,
    originalAmount: Number,
    remainingAmount: Number,
    dueDate: String,
    isUSD: Boolean
}, { timestamps: true, strict: false });

const TransactionSchema = new mongoose.Schema({
    id: String,
    amount: Number,
    date: String,
    description: String,
    isUSD: Boolean
}, { timestamps: true, strict: false });

const TaskSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    completed: Boolean,
    linkedObjectiveId: String,
    linkedDebtId: String,
    type: String
}, { timestamps: true, strict: false });

const DeliveryDaySchema = new mongoose.Schema({
    data: { type: String, unique: true },
    entrada: String,
    saida: String,
    kmInicial: { type: Number, default: 0 },
    kmFinal: { type: Number, default: 0 },
    kmRodados: { type: Number, default: 0 },
    ganhos: { type: Number, default: 0 },
    gastoGasolina: { type: Number, default: 0 },
    gastoManutencao: { type: Number, default: 0 },
    gastoAntecipacao: { type: Number, default: 0 },
    metaBatida: { type: Boolean, default: false }
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
const Objective = mongoose.model('Objective', ObjectiveSchema);
const Debt = mongoose.model('Debt', DebtSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Task = mongoose.model('Task', TaskSchema);
const DeliveryDay = mongoose.model('DeliveryDay', DeliveryDaySchema);

// --- Connect to MongoDB ---
console.log("Conectando ao MongoDB:", MONGO_URI);
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB!'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// --- API Endpoints ---

// 1. Settings
app.get('/api/settings', async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({ exchangeRate: 5.0 });
    }
    res.json(settings);
});

app.post('/api/settings', async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings(req.body);
    } else {
        Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
});

// 2. Generic CRUD Generator for Finance
const createCrud = (route, Model) => {
    app.get(`/api/${route}`, async (req, res) => {
        const items = await Model.find();
        res.json(items);
    });

    app.post(`/api/${route}`, async (req, res) => {
        const newItem = new Model({ ...req.body, id: req.body.id || Date.now().toString() });
        await newItem.save();
        res.status(201).json(newItem);
    });

    app.put(`/api/${route}/:id`, async (req, res) => {
        const updatedItem = await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ error: 'Not found' });
        res.json(updatedItem);
    });

    app.delete(`/api/${route}/:id`, async (req, res) => {
        const deleted = await Model.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    });
};

createCrud('objectives', Objective);
createCrud('debts', Debt);
createCrud('transactions', Transaction);
createCrud('tasks', Task);

// 3. Delivery API
app.get('/api/delivery', async (req, res) => {
    const days = await DeliveryDay.find();
    res.json(days);
});

app.post('/api/delivery', async (req, res) => {
    const { data } = req.body;
    let day = await DeliveryDay.findOne({ data });
    
    if (day) {
        Object.assign(day, req.body);
        await day.save();
    } else {
        day = new DeliveryDay(req.body);
        await day.save();
    }
    res.json(day);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified API rodando na porta ${PORT}`);
});
