const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
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
  // TODO: mongoose timestamp özelliği property'lerin update olduğu tarihide kaydediyor. Bunu incele bu şekilde bir düzenlemeye git.
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  /**
   * Schema.isModified() metodu girilen alanın
   * (burada password alanı-field) değiştirilip
   * değiştirilmediğine bakıyor.
   * Alttaki kod eğer password alanı değişmediyse
   * middlewareden çıkıyor.
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

userSchema.pre('save', function (next) {
  /**
   * Password alanı değişmediyse veya
   * password alnı yeni oluşturulduysa
   * fonksiyondan çıkılır ve
   * bir sonraki rout işlemine geçilir
   */
  if (!this.isModified('password') || this.isNew) return next();

  /**
   * Eğer şifre değiştirildiyse;
   * passwordChangedAt(sifrenin değiştiği tarih alanı)
   * güncellenir
   */
  /**
   * bazen veri tabanında güncelleme yapmak gecikebilir
   * bu durumda zaman kontrollerinde hataya yol açacağından
   * güncelleme tarihinden 1 saniye çıkartılıyor
   */
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  /**
   * this.passwordResetToken
   * this.passwordResetExpires
   * değerlerini değiştirmek veri tabanında kayıt olduğu anlamına gelmiyor
   * veri tabanına kaydetmek için user.save(); işlemini yapmak gerek.
   */
  // resetToken şifrelenerek veri tabanına yükleniyor
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
