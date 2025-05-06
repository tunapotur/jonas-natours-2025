class AppError extends Error {
  constructor(message, statusCode) {
    /** message Error sınıfından geldiği için
     * miras alınan sınıfın constructor'una
     * super ile yönlendirilir
     */
    super(message);

    this.statusCode = statusCode;
    /**
     * eğer statusCode 4 ile başlarsa hata tipi "fail"
     * aksi durumda "error" olacak
     */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    /**
     * varsayılan olarak hatalar Operational hata olarak belirlenecek
     */
    this.isOperational = true;

    /** hata oluştuğunda örneklenen Error nesnesine
     * hatanın yakalandığı alanlar yükleniyor
     */
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
