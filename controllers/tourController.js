const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query);

    /*     
      * find üzerinde farklı bir sorgu tipi
      const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy'); 
    */

    //BUILD QUERY
    /* 
    * Obje kopyalama
    ... operatörü ile obje açılıyor 
    { } süslü parantezler ile 
    açılan objeden yeni bir nesne oluşuyor.
    böylelikle objenin yeni bir kopyası oluşuyor 
    */
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log(req.query, queryObj);

    const query = Tour.find(queryObj);

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'Tour is deleted!',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
