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

mongoose.set('useFindAndModify', false);
// routes
app.get('*', checkUser); // -----------------------------------------------------all routs are checking for user
app.get('/', (req, res) => res.render('home')); // ------------------------------render 'home' when trying to access '/'


app.get('/todoos', requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const UserId = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;
  User.find({ _id: UserId })
    .then((result) => {
      const permitedBlogs = result[0].permitId;
      const userExp = result[0].userExperience;
      Blog.find({ userId: { $in: [UserId, permitedBlogs] } })
        .then((result) => {
          // console.log(result)
          res.render('todoos', { blogs: result, userExp: userExp })
          // console.log(UserId, userExp);
        })
        .catch((err) => {
          console.log(err);
        })
    })
    .catch(err => {
      console.log(err);
    })

  // Blog.find({ userId: UserId })
  //   .then((result) => {
  //     res.render('todoos', { blogs: result })
  //     console.log(UserId);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   })
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
  const token = req.cookies.jwt;
  const UserId = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;
  const deletionID = req.url.slice(9);
  console.log(deletionID);
  Blog.findOneAndDelete({ _id: deletionID })
    .then(result => {
      User.findByIdAndUpdate({ _id: UserId }, { $inc: { userExperience: +20 } })
        .then(result => {
          res.redirect('/todoos')
        })
    })
    .catch(error => {
      console.log(error);
    })
})

app.get('/permission', requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const UserId = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;
  User.find({ _id: UserId })
    .then(result => {
      const currentUserEmail = result[0].email;
      const givenPermitTo = result[0].givenPermit;
      // const friend = result[0].permitId;
      User.find()
        .then((result) => {
          res.render('permission', { users: result, currentEmail: currentUserEmail, permitedUser: givenPermitTo })
        })
        .catch(error => {
          console.log(error)
        })
    })

})
app.post('/permission/:id', requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const userGivesPermit = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;
  const userPermitIsGivenTo = req.url.slice(13);
  User.findOneAndUpdate({ _id: userPermitIsGivenTo }, { permitId: userGivesPermit })
    .then(result => {
      User.findOneAndUpdate({ _id: userGivesPermit }, { givenPermit: userPermitIsGivenTo })
        .then(result => {
          res.redirect('/permission')
        })
    })

})
app.post('/permission/delete/:id', requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  const userGivesPermit = jwt.decode(token, 'xfoMa2pPlRosdyqzc3MPjvOWppGOiXnGQnD91sV8ynA4zZ9hsT8USWriEgU9HCJ').id;
  const userPermitIsGivenTo = req.url.slice(20);
  User.findOneAndUpdate({ _id: userPermitIsGivenTo }, { permitId: '' })
    .then(result => {
      User.findOneAndUpdate({ _id: userGivesPermit }, { givenPermit: '' })
        .then(result => {
          res.redirect('/permission')
        })
    })
})
app.use(authRoutes);