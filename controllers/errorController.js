const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Düzgün çalışması için bu şekilde kullanılması gerek. Kursun anlatımı geçersiz kalmış.
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    //1) Log error
    /** profesyonel bir yazılımda production modunda meydana gelen hatalar
     * bir LOG dosyasına yazılır. Bu uygulamada böyle bir düzeneğe gerek duyulmuyor
     * Ayrıca; Heroku gibi platformlarda ürünümüz yayınlandığın alttaki console.error()
     * fonksiyonun mesajları otomatik olarak LOG dosyasına yazılabiliyormuş.
     */
    console.error('ERROR 💥', err);

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  /** yakalanan hata mesajının StackTrace bilgisi
   * bu hatanın kod üzerinde nerelerde oluştuğunun
   * bilgisini veriyor
   */
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  /** res.status() metodu ile hata kullanıcıya döndürülüyor */
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    /**
     * let error = { ...err };
     * bu işlem ile hatalı nesne oluşuyor
     * ÇÖZÜM ALTTA!
     */
    //let error = { ...err, name: err.name }; //1.Çözüm
    //3. çözüm en iyi çözüm!
    // https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
