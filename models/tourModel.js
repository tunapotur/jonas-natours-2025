const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          /**
           * 200 < 100 =>false
           * 100 < 200 =>true
           */
          // this only points to current doc on NEW document creation
          // sadece kayıt oluştururken çalışacaktır. Güncellemede çalışmaz
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    /* 
    TODO Success projesinde time stamp 
    kullanım var ona bir bak. 
    Bunun yerine o kullanılabilir.
   */
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  /**
   * *arrow fonksiyon operatörünü kullanmadık
   * function tanımı this operatörü ile
   * kendi tourSchema nesnesi içinde bulunan
   * duration değişkenine erişebildi.
   */
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE
// TODO: Document middleware ile kullanıcı şifresinin uygunluğu test edilebilir.
/**
 * DOCUMENT MIDDLEWARE: runs before .save() and .create()
 * Document middleware'de bir middleware olduğundan
 * çevrimi devam ettirmek için next() metodu kullanılır
 *
 * schema.pre("save",function(next){...})
 * save => hook, hangi işlemlerin öncesinde ya da
 * sonrasında middlewarenin çalıştırılacağını belirtir
 * function => middleware; işletilecek fonksiyon
 * .pre, .post => middleware fonksiyonunun ne zaman işletileceğini belirtir
 */
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
* .pre işlem öncesi çalıştırılacak middleware
tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

* .post işlem sonrasında çalıştırılacak middleware
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
*/

// QUERY MIDDLEWARE
// TODO: count hook ile çok büyük sayıda veri çekilmesi .pre ile önlenebilir
/**
 * tourSchema.pre('find', function (next) {
 * bu haliyle sadece find ile yapılan çağrılarda kullanılır
 * /^find/ bu regular expiration ifadesiyle
 * findById, findByIdAndUpdate, findByIdAndDelete gibi
 * find ile başlayan tüm ifadelerde middleware fonksiyonu çalışır
 */
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
/**
 * aggregate işleminde bulunan pipline array'inin
 * başına unshift() ile { $match: { secretTour: { $ne: true } } } objesi ekleniyor
 * bu eklenen obje ile match ile eşleşen secretTour değeri dahil edilmiyor
 * this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
 */
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
