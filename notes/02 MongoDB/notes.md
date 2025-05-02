TODO: önceki konularda geçen sorgo url'lerini not al

http://localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5&price[lt]=1500

Sort by price http://localhost:3000/api/v1/tours?sort=price
Sort by price Descendent http://localhost:3000/api/v1/tours?sort=-price
Sort by price Descendent and ratingsAverage http://localhost:3000/api/v1/tours?sort=-price,ratingsAverage

Field Limting http://localhost:3000/api/v1/tours?fields=name,duration,difficulty,price,ratingsAverage

http://localhost:3000/api/v1/tours?fields=name,duration,difficulty,price,ratingsAverage&sort=-price,ratingsAverage
