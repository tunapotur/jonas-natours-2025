const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    require: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  /**
   * Schema.isModified() metodu girilen alanın
   * (burada password alanı-field) değiştirilip
   * değiştirilmediğine bakıyor.
   * Alttaki kod eğer password alanı değişmediyse
   * alt satırları geçilmeden middlewareden çıkıyor.
   */
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  /**
   * 12 salt parametresi. şifrenin
   * 12bit kripto edileceğini belirtiyor
   * 16 girilseydi daha yüksek bir işlem gücü gerekecekti.
   * 10 girilseydi az işlem gücü gerekecekti ama güvenli olmayacaktı.
   */
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  /**
   * User save işlemini yapmadan önce
   * passwordConfirm alanı tanımsız yapılarak
   * veritabanına kaydı yapılmıyor.
   * Böylelikle gereksiz veri saklanmamış oluyor.
   */
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
