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
    sendErrorProd(err, res);
  }
};
