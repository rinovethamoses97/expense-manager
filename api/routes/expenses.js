const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Anthropic = require('@anthropic-ai/sdk');
const Expense = require('../../api/models/Expense');
const requireAuth = require('../../api/middleware/requireAuth');
const Account = require('../../api/models/Account');
router.use(requireAuth);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|heic)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, or HEIC images are allowed'));
  },
});

const RECEIPT_SYSTEM_PROMPT = `You are a receipt parser. The user will send you a photo of a paper receipt, invoice, or bill. Your job is to extract structured data from it.

Return ONLY a single JSON object with these fields, and nothing else (no prose, no markdown fences):

{
  "merchant": string | null,    // The name of the store, restaurant, or service provider as it appears on the receipt. Prefer the brand name over the legal entity name. Strip trailing "Pvt Ltd", "LLC", store numbers, and addresses.
  "amount": number | null,      // The grand total actually paid by the customer, AFTER tax and AFTER any discounts. Do not return the subtotal, the pre-tax amount, the tip amount alone, or a single line item. If the receipt shows multiple totals, pick the final "Total", "Amount Due", "Grand Total", or "Paid" line.
  "currency": string | null,    // 3-letter ISO 4217 code inferred from currency symbol or text (e.g. "INR" for ₹ or Rs, "USD" for $, "EUR" for €, "GBP" for £). If ambiguous, return null.
  "date": string | null,        // The transaction date in ISO 8601 format (YYYY-MM-DD). If only month/year is visible, return null. If the year is shown as 2 digits, infer the most recent plausible 4-digit year.
  "category": string | null     // Best guess from this fixed list, based on the merchant and items: "Food & Dining", "Transport", "Fuel", "Shopping", "Entertainment", "Health & Medical", "Utilities", "Rent", "Education", "Travel", "Personal Care", "Other". Use "Other" only when nothing else fits.
}

Rules:
- If a field is unreadable, ambiguous, or missing from the receipt, set it to null. Do not guess.
- Do not invent values. A blurry digit is null, not a hallucinated digit.
- If the image is not a receipt (e.g. a selfie, a landscape, a screenshot of something unrelated), return all fields as null.
- Output must be valid JSON parseable by JSON.parse. No trailing commas, no comments, no extra keys.`;

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

function extractJson(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

router.post('/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      `expense-manager/receipts/${req.user.id}`
    );

    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype.toLowerCase() === 'image/jpg' ? 'image/jpeg' : req.file.mimetype;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: RECEIPT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'Extract the receipt fields as JSON.' },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const parsed = extractJson(textBlock?.text) ?? {
      merchant: null, amount: null, currency: null, date: null, category: null,
    };

    res.json({
      success: true,
      data: {
        attachmentUrl: uploadResult.secure_url,
        parsed,
      },
    });
  } catch (err) {
    console.error('[scan-receipt]', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to scan receipt' });
  }
});

router.get('/', async (req, res) => {
  try {

    const { type, category, month, sort = '-date' } = req.query;

    const filter = { userId: req.user.id };
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const expenses = await Expense.find(filter).sort(sort).lean();
    res.json({ success: true, data: expenses });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user.id });
    const account = await Account.findOne({ _id: expense.accountId, userId: req.user.id });
    if (account) {
      account.balance += expense.type === 'income' ? expense.amount : -expense.amount;
      await account.save();
    }
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create expense' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: expense });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch expense' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const original = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!original) return res.status(404).json({ success: false, error: 'Not found' });

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    const signedDelta = (e) => (e.type === 'income' ? e.amount : -e.amount);

    if (String(original.accountId) === String(expense.accountId)) {
      const diff = signedDelta(expense) - signedDelta(original);
      if (diff !== 0) {
        const account = await Account.findOne({ _id: expense.accountId, userId: req.user.id });
        if (account) {
          account.balance += diff;
          await account.save();
        }
      }
    } else {
      const oldAccount = await Account.findOne({ _id: original.accountId, userId: req.user.id });
      if (oldAccount) {
        oldAccount.balance -= signedDelta(original);
        await oldAccount.save();
      }
      const newAccount = await Account.findOne({ _id: expense.accountId, userId: req.user.id });
      if (newAccount) {
        newAccount.balance += signedDelta(expense);
        await newAccount.save();
      }
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update expense' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });    
    if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
    const account = await Account.findOne({ _id: expense.accountId, userId: req.user.id });
    if (account) {      
      console.log(account)
      account.balance += expense.type === 'income' ? -expense.amount : expense.amount;
      console.log(account.balance)
      await account.save();
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete expense' });
  }
});

module.exports = router;
