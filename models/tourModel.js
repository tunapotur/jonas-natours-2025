const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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
  console.log('will save document...');
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
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
