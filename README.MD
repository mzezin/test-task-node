#Run
```shell
npm install
npm start
```
#Use

GET localhost:3000/aapl - returns price and sector
POST localhost:3000/ with payload:
```json
 {
    "stocks":[
      {
         "symbol":"AAPL",
         "volume":50
      },
      {
         "symbol":"HOG",
         "volume":10
      },
      {
         "symbol":"MDSO",
         "volume":1
      },
      {
         "symbol":"IDRA",
         "volume":1
      },
      {
         "symbol":"MRSN",
         "volume":1
      }
    ]
}
```
returns allocations

