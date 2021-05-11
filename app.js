const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const Blog = require('./models/Note');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser"); // УДАЛИ ЭТО ВИТЯ  (*&(*&))

const app = express(); // ------------------------------------------------------creating an express app

// middleware
app.use(express.static('public')); //-------------------------------------------saying that static files are in public folder
app.use(express.json()); // ----------------------------------------------------using json 
app.use(cookieParser()); // ----------------------------------------------------using cookie parser
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // NEW (*&(*&))


// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://UserAdmin:XS2Axp6H1Ic6ENip@cluster0.lwajs.mongodb.net/pads-auth'; // url to connect
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((result) => app.listen(3000)) //----------------------------------------if connected listen at port 3000
  .catch((err) => console.log(err)); // ----------------------------------------else - log ther error

// routes
app.get('*', checkUser); // -----------------------------------------------------all routs are checking for user
app.get('/', (req, res) => res.render('home')); // ------------------------------render 'home' when trying to access '/'


app.get('/todoos', requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const UserId = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;

  Blog.find({ userId: UserId })
    .then((result) => {
      res.render('todoos', { blogs: result })
      console.log(UserId);
    })
    .catch((err) => {
      console.log(err);
    })
});

app.post('/todoos', urlencodedParser, requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const UserId = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;

  const blog = new Blog({ // ------------ 1 ВАРИАНТ
    title: req.body.add,
    userId: UserId
  });

  blog.save()
    .then((result) => {
      res.redirect('/todoos') // 3:43 решил редиректом
    })
    .catch((err) => {
      console.log(err);
    })                     // ------------ 1 ВАРИАНТ
})

app.post('/todoos/:id', urlencodedParser, requireAuth, (req, res) => {
  const deletionID = req.url.slice(9);
  //console.log(deletionID);
  Blog.findOneAndDelete({ _id: deletionID })
    .then(result => {
      res.redirect('/todoos')
    })
    .catch(error => {
      console.log(error);
    })
})


app.use(authRoutes);