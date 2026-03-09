const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT token oluştur
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'capsule_wardrobe_secret_key', {
    expiresIn: '7d',
  });
};

// Kayıt olma
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validasyonlar
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: 'Parolalar eşleşmiyor' });
    }

    // Kullanıcı zaten var mı kontrol et
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: 'Bu email veya kullanıcı adı zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
    });

    // Token oluştur
    const token = generateToken(user._id);

    // Kullanıcı bilgilerini gönder (password hariç)
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: 'Kayıt başarılı!',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kayıt sırasında bir hata oluştu',
    });
  }
});

// Giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyonlar
    if (!email || !password) {
      return res.status(400).json({ message: 'Lütfen email ve parolanızı girin' });
    }

    // Kullanıcı var mı kontrol et (password alanını ekle)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email veya parola hatalı' });
    }

    // Parola kontrolü
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email veya parola hatalı' });
    }

    // Token oluştur
    const token = generateToken(user._id);

    // Kullanıcı bilgilerini gönder (password hariç)
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: 'Giriş başarılı!',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Giriş sırasında bir hata oluştu',
    });
  }
});

// Mevcut kullanıcıyı getir
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'capsule_wardrobe_secret_key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Token geçerli değil',
    });
  }
});

module.exports = router;
