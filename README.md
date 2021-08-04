# Book API
The Bukness API is a server-side component of a “business books” web app, that includes a database created with MongoDB, the server, and the business logic layer.

The application provides authenticated users with access to information about books related with management, business, personal growth and emotional intelligence. They can add books to their favourite list, as well as common abilities as to change or delete their profile. The REST API will be accessed by CRUD operations.

Tools
NodeJS
Express
MongoDB
Getting Started
The easiest way to get started is to clone the repository:

Clone the repository
Git clone https://github.com/iamnachoj/Bukness-API/
Change directory
cd Book API
Install NPM dependencies
Start the server Note: It is recommended to install nodemon for live reloading - It watches for any changes in your node.js app and automatically restarts the server
Deployment
Deployment to Heroku
Download and install Heroku CLI

In a terminal, run heroku login and enter your Heroku credentials

From your app directory run heroku create

Use the command heroku config:set KEY=val to set the different environment variables (KEY=val) for your application (i.e. heroku config:set BASE_URL=[heroku App Name].herokuapp.com etc.)

Do git add .

Do git commit -m" reason for commit"

Lastly, do git push heroku master.

Please note that you may also use the Heroku Dashboard to set or modify the configurations for your application.

view live demo: link here!
I used postman to test the api. To use postman, go to the project doc folder and import the docs file into your postman client to ease the testing

Don´t forget to check out the documentation endpoint (/Documentation) in order to know how to send every HTTP request.
