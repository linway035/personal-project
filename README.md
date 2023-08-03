[![NPM](https://img.shields.io/badge/NPM-ba443f?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![logo](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![logo](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://www.w3schools.com/html/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![elasticsearch](https://img.shields.io/badge/elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)](https://www.elastic.co/)
[![socket.io](https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

# StellarTweets

![Index page](./public/images/index.png)

StellarTweets is a personal project that aims to create a simple social networking platform. It includes a self-made recommendation system for connecting users with friends and suggesting interesting posts based on their preferences.

> Website URL: [StellarTweets](https://linwaylin.com/)

## Features

- ⭐ Rating: allow users to rate every posts.
- 👍 Recommend: create a recommendation system using collaborative filtering algorithm to suggest friends and posts.
- 🔎 Search: implement Elasticsearch for fuzzy user search and adopted the ICU Analysis plugin along with three custom synonym sets for article search. (synonym sets :&ensp;"chris paul, CP3",&ensp; "拓荒者, 阿拓",&ensp; "小犢, 小牛")
  - fuzzy search  
    Implemented fuzzy search to handle uncertain name spellings, allowing users to find desired results despite spelling mistakes.

    https://github.com/linway035/personal-project/assets/32064935/c6acdb50-aae7-4719-aad0-36fa57eb1712


  - synonym search  
    For instance, a player named "Chris Paul" with the nickname "CP3". When searching for "CP3", the first article's content would display "Chris Paul," but I can still find the result.

    https://github.com/linway035/personal-project/assets/32064935/50b91581-e38d-4134-a657-86f1f85188ef


- 📬 Chatroom: build a real-time chatroom using Socket.IO.
- 🙈 Hide: block posts to prevent them from appearing again permanently.
- 💭 Post: allow users to post tweets and enable them to upload up to three photos using Multer.
- Other features: users can reply to posts and like/unlike them, as well as follow/unfollow other users.

## Tech Stack

**Environment & Framework:** Node.js, Express, Socket.IO

**Database:** MySQL, Elasticsearch

**AWS Service:** EC2, RDS, S3, CloudFront

**Others:** Bootstrap, ORM (Sequelize) , express-handlebars

## MySQL Database Schema
![drawSQL-sns-export-2023-08-03](https://github.com/linway035/personal-project/assets/32064935/a7fcfa27-35d2-46fa-abd2-c165a7019b33)

## Server structure

![structure](https://github.com/linway035/personal-project/assets/32064935/612960f3-e59e-4d18-9304-d498e7cc0a77)

## Test accounts

| Email       | Password |
| :---------- | :------- |
| test@tt.com | test123  |
