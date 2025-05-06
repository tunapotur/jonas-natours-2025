module.exports = (err, req, res, next) => {
  /** yakalanan hata mesajının StackTrace bilgisi
   * bu hatanın kod üzerinde nerelerde oluştuğunun
   * bilgisini veriyor
   */
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  /** res.status() metodu ile hata kullanıcıya döndürülüyor */
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
