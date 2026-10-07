require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
<<<<<<< HEAD
=======
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');
>>>>>>> feature-session

const app = express();
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// THIẾT LẬP ĐA LUỒNG KẾT NỐI (Đọc/Ghi tự động điều hướng)
const readConnection = mongoose.createConnection(process.env.READ_DB_URI);
const writeConnection = mongoose.createConnection(process.env.WRITE_DB_URI);

// Định nghĩa Schema chung
const bookSchema = new mongoose.Schema({
    code: String,
    name: String,
    price: Number,
    priceAfterTax: Number
});

// Gắn Schema vào 2 luồng kết nối riêng biệt
const BookRead = readConnection.model('Book', bookSchema);
const BookWrite = writeConnection.model('Book', bookSchema);

// LOGIC XỬ LÝ & THUẬT TOÁN CÁ NHÂN HÓA[cite: 10]
app.post('/add-book', async (req, res) => {
    try {
        const { code, name, price } = req.body;
        
        // Yêu cầu 1: Mã sản phẩm bắt buộc có tiền tố là 3 số cuối MSSV (061)[cite: 10]
        if (!code.startsWith("061")) {
            return res.status(403).send("Hệ thống từ chối xử lý: Mã sản phẩm phải bắt đầu bằng '061' (3 số cuối MSSV).");
        }

        // Yêu cầu 2 & 3: VAT = (Chữ số cuối MSSV + 4)% => (1 + 4)% = 5%[cite: 10]
        const vatPercent = 5;
        const finalPrice = parseFloat(price) * (1 + vatPercent / 100);

        // Lưu xuống Cloud qua tài khoản có thẩm quyền Ghi[cite: 10]
        const newBook = new BookWrite({ code, name, price, priceAfterTax: finalPrice });
        await newBook.save();

        res.send("Đã lưu sách thành công qua luồng Write! (Giao diện sẽ được cập nhật ở bước sau)");
=======
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
>>>>>>> feature-session
    } catch (error) {
        res.status(500).send("Lỗi server: " + error.message);
    }
});

<<<<<<< HEAD
=======
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

>>>>>>> feature-session
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));