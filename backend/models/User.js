const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Lütfen kullanıcı adı girin'],
      unique: true,
      trim: true,
      minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır'],
      maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olmalıdır'],
    },
    email: {
      type: String,
      required: [true, 'Lütfen email adresi girin'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Lütfen geçerli bir email adresi girin',
      ],
    },
    password: {
      type: String,
      required: [true, 'Lütfen parola girin'],
      minlength: [6, 'Parola en az 6 karakter olmalıdır'],
      select: false, // Password seçilirse gizle
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Şifreyi kaydetmeden önce hashle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parola kontrolü metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
