TODO: önceki konularda geçen sorgo url'lerini not al

http://localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5&price[lt]=1500

Sort by price http://localhost:3000/api/v1/tours?sort=price
Sort by price Descendent http://localhost:3000/api/v1/tours?sort=-price
Sort by price Descendent and ratingsAverage http://localhost:3000/api/v1/tours?sort=-price,ratingsAverage

Field Limting http://localhost:3000/api/v1/tours?fields=name,duration,difficulty,price,ratingsAverage

http://localhost:3000/api/v1/tours?fields=name,duration,difficulty,price,ratingsAverage&sort=-price,ratingsAverage

    4 Pagination
    page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page3
    query = query.skip(10).limit(10);

http://localhost:3000/api/v1/tours?page=2&limit=10

http://localhost:3000/api/v1/tours/top-5-cheap

TODO:APIFeatures sınıfında bulunan her metod this return etti bunun sebebini not al.

https://www.mongodb.com/docs/manual/introduction/
