# snapbill-backend
Node JS Backend

routes:

- [x] /user
  - [x] /register
  - [x] /activate
  - [x] /authenticate **(basic auth)**
  - [x] /get/:id **(jwt auth)**
  - [x] /pass/change
  - [x] /pass/reset
- [x] /bill **(jwt auth)**
  - [x] /add/:id
  - [x] /getall/:id - **all bills for an user**
  - [x] /get/:id/:billid - **detail of bill of an user**
  - [x] /update/:id/:billid
  - [x] /delete/:id/:billid

