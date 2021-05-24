const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin-anubhav:<password>@cluster0.rq0nn.mongodb.net/atm-machine-project", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  username: String,
  password: String,
  balance: String
});
const User = new mongoose.model("User", userSchema);
const cardSchema = new mongoose.Schema({
  uid: String,
  cardno: String,
  year: String,
  cvv: String
})
const Card = new mongoose.model("Card", cardSchema);
const app = express();
function getRandomNumber(digit) {
  return Math.random().toFixed(digit).split('.')[1];
}
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/atm", function (req, res) {
  res.render("atm");
});
app.get("/balance", function (req, res) {
  res.render("balance");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/deposit", function (req, res) {
  res.render("deposit");
});
app.post("/signup", function (req, res) {
  const newUser = new User({
    uid: req.body.username,
    name: req.body.firstname,
    username: req.body.username,
    password: req.body.password,
    balance: req.body.bal
  })
  let uname = req.body.name;
  if (parseFloat(req.body.bal) > 0) {
    User.findOne({
      uid: uname
    }, function (err, foundUser) {
      if (foundUser != null) {
        res.render("not-found");
        console.log(foundUser);
      } else {
        newUser.save(function (err) {
          if (err) {
            console.log("ERRRR" + err);
            res.render("not-found");
          } else {
            const newCard = new Card({
              uid: req.body.username,
              cardno: getRandomNumber(16),
              year: randomIntFromInterval(1, 12) + "/" + randomIntFromInterval(22, 50),
              cvv: getRandomNumber(3)
            })
            newCard.save(function (err) {
              if (err)
                console.log(err);
              else
                return res.render("login");
            })
          }
        })
      }
    })
  }
  else
    res.render("not-found");
})
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({
    username: username
  }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.render("not-found");
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          Card.findOne({ uid: username }, function (err, foundCard) {
            if (err) {
              console.log(err);
              res.render("not-found");
            } else {
              console.log(foundCard.cardno);
              let cardNum = foundCard.cardno;
              let year = foundCard.year;
              let cvvNo = foundCard.cvv;
              res.render("generate", { cardNum: cardNum, year: year, cvvNo: cvvNo });
            }

          })
        }
        else {
          console.log("Wrong Password");
          res.render("not-found");
        }
      }
      else
        res.render("not-found");
    }
  })
})
app.post("/balance", function (req, res) {
  const username = req.body.username;
  const cardnumber = req.body.cardnum;
  const expiry = req.body.exp;
  const cvvcode = req.body.cvv;
  Card.findOne({
    cardno: cardnumber
  }, function (err, foundCard) {
    if (err) {
      console.log(err);
    } else {
      if (foundCard) {
        console.log(expiry + cvvcode);
        if (foundCard.year == expiry && foundCard.cvv == cvvcode) {
          console.log("found");
          User.findOne({
            uid: username
          }, function (err, foundUser) {
            if (err) {
              res.render("not-found");
              console.log(err);
            } else {

              if (foundUser) {
                const balla = foundUser.balance;
                console.log(balla);
                res.render("showbalance", { balla: balla });
              }
            }
          })
        }
        else {
          console.log("Wrong Password");
          res.render("login");
        }
      }
      else {
        console.log("Card not found");
        res.render("not-found");
      }
    }
  })
})
app.post("/atm", function (req, res) {
  const uname = req.body.username;
  const password = req.body.password;
  const withdraw = req.body.withdraw;
  if (parseFloat(withdraw) > 0) {
    User.findOne({
      uid: uname,
    }, function (err, foundUser) {
      if (foundUser.password === password) {
        if (err) {
          console.log(err);
          res.render("not-found");
        } else {
          let integerBalance = parseFloat(foundUser.balance);
          let newBalance = integerBalance - withdraw;
          console.log(integerBalance - withdraw);

          User.findOneAndUpdate({ uid: uname }, { balance: newBalance }, function (err, data) {
            if (err) {
              console.log(err);
              res.render("not-found");

            }
            else {
              console.log(data.balance);
              res.render("your-money", { withdraw: withdraw });
            }
          })
        }
      }
      else
        res.render("not-found");
    })
  }
  else {
    res.render("not-found");
  }
})
app.post("/deposit", function (req, res) {
  const uname = req.body.username;
  const money = req.body.deposit;
  if (parseFloat(money) >= 1) {
    User.findOneAndUpdate({ uid: uname }, { balance: money }, function (err, data) {
      if (err) {
        console.log(err);
        res.render("not-found");
      }
      else {
        res.render("deposit");
      }
    })
  }
  else
    res.render("not-found");
}
)
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
