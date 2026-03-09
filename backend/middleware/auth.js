const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmış olmanız gerekiyor',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'capsule_wardrobe_secret_key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token geçerli değil veya süresi dolmuş',
    });
  }
};

module.exports = { protect };
