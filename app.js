const express = require('express');
const morgan = require('morgan');

//controllers imports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES
// Morgan middleware is used for web server information when development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Necessary express middlewares
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// ROUTES MIDDLEWARES
// Those routers contain controllers to check user requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  /**Implementing a Global Error Handling Middleware
   * Yanlış girilen url adresleri için
   * bir Error(err) nesnesi oluşturuluyor
   * belirlenen route adresleri dışında bir adres girilirse
   * yıldız ile yakalanarak burada ki hata nesnesi yaratılıyor ve
   * next(err) fonksiyonuyla hata oluştuğunda değer dönen
   * router işlemi tetikleniyor
   */
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

/**Implementing a Global Error Handling Middleware
 * express.js bu fonksiyonun tanımından dolayı
 * bu fonksiyonu hata yakalama router'ı olarak tanıyor
 * next(err) ile hatalı girilen url buraya yönlendiriliyor
 * res.status() metodu ile hata kullanıcıya döndürülüyor
 */
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
