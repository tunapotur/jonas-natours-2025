exports.protect = catchAsync(async (req, res, next) => {
  // *** The code exists above.
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
