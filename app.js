const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//controllers imports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
// Morgan middleware is used for web server information when development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 request same ip
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection

// Data sanitization against XSS

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
// Those routers contain controllers to check user requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// ROUTES MIDDLEWARES
/** Server üzerinde bulunan router tanımları */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/** Mevcut router tanımları dışında
 * girilen router değerleri burada
 * yakalanıyor*/
app.all('*', (req, res, next) => {
  /**Implementing a Global Error Handling Middleware
   * Yanlış girilen url adresleri için
   * bir Error(err) nesnesi oluşturuluyor
   * belirlenen route adresleri dışında bir adres girilirse
   * yıldız ile yakalanarak burada ki hata nesnesi yaratılıyor ve
   * next(err) fonksiyonuyla hata oluştuğunda değer dönen
   * router işlemi tetikleniyor
   */

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  /** AppError sınıfıyla üstteki satırlar altta bulunan tek satıra indirgendi */
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/**Implementing a Global Error Handling Middleware
 * express.js bu fonksiyonun tanımından dolayı
 * bu fonksiyonu hata yakalama router'ı olarak tanıyor
 * next(new AppError(...)) ile hatalı girilen url buraya yönlendiriliyor
 * globalErrorHandler ile tüm işlemlerde yapılan hatalar yakalanıyor
 */
app.use(globalErrorHandler);

module.exports = app;
