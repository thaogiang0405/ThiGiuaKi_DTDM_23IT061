require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');

const app = express();
app.use(express.urlencoded({ extended: true }));

// THIẾT LẬP ĐA LUỒNG KẾT NỐI
const readConnection = mongoose.createConnection(process.env.READ_DB_URI);
const writeConnection = mongoose.createConnection(process.env.WRITE_DB_URI);

const bookSchema = new mongoose.Schema({ code: String, name: String, price: Number, priceAfterTax: Number });
const BookRead = readConnection.model('Book', bookSchema);
const BookWrite = writeConnection.model('Book', bookSchema);

// STATELESS SESSION: Tuyệt đối không lưu RAM, lưu thẳng xuống Cloud
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.WRITE_DB_URI // Lưu xuống DB thông qua tài khoản có quyền Ghi
    }) 
}));

// CẤU HÌNH HANDLEBARS
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// LOGIC XỬ LÝ & THUẬT TOÁN (VAT 5%)
app.post('/add-book', async (req, res) => {
    try {
        const { code, name, price } = req.body;
        if (!code.startsWith("061")) return res.status(403).send("Hệ thống từ chối xử lý: Mã sản phẩm phải bắt đầu bằng '061'.");
        
        const vatPercent = 5; // VAT = (1 + 4) = 5%[cite: 10]
        const finalPrice = parseFloat(price) * (1 + vatPercent / 100);
        
        const newBook = new BookWrite({ code, name, price, priceAfterTax: finalPrice });
        await newBook.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Lỗi server: " + error.message);
    }
});

// GIAO DIỆN XEM DANH SÁCH & RENDER FOOTER[cite: 10]
app.get('/', async (req, res) => {
    // Đọc dữ liệu bằng luồng Read[cite: 10]
    const books = await BookRead.find().lean();
    res.render('home', {
        books,
        hoTen: "Phạm Thảo Giang",
        mssv: "23IT061",
        vat: 5
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));