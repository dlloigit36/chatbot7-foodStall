import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();
// const webPort = 3017;
const webPort = process.env.WEB_PORT;
const API_HOST = process.env.API_HOSTNAME;
const API_PORT = process.env.API_PORT;
const API_URL = `http://${API_HOST}:${API_PORT}`;


const APIKey = process.env.API_ACCESS_KEY;
const config = {
    params: { key: APIKey}
};

// const shopName = process.env.SHOP_NAME;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());


let error = "";


async function getWaitingByCode(fsCode) {
  let waitingList = [];
  try {
    const result = await axios.get(API_URL + "/waitnumber/search?fscode=" + fsCode, config);
    waitingList = result.data;
  } catch (error) {
    console.log(error);
  }
  return waitingList; 
}


// logout
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// login page
app.get("/login", (req, res) => {
  res.render("login.ejs", {
    title: "Welcome to chatbot7- Food Stall ✌️"
  });
});

// login post page to accept username and password
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);


// Route to render the main page
app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    // return user data from passport.use- local
    // console.log(req.user);
    const waitingNumberList = await getWaitingByCode(req.user.code);
    res.render("index.ejs", { 
      currentTime: new Date(),
      waitingList: waitingNumberList,
      totalWait: waitingNumberList.length,
      username: req.user.username,
      shopName: req.user.name,
      error: error 
    });
  } else {
    console.log("not authenticated");
    res.redirect("/login");
  }
   
});

// a route a accept wait_number id hit from calling button
app.get("/waitnumber/call/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let waitNumberId = parseInt(req.params.id);
    console.log("in /waitnumber/call/:id id = ", waitNumberId);
        
    var patchData = {
      id: waitNumberId,
      call_d: new Date()
    }

    try {
      const result = await axios.patch(API_URL + "/patch/waitnumber/"+ waitNumberId, patchData, config);
      console.log("patch wait number done for id = ", waitNumberId, "return =",result.data);
      
    } catch (error) {
      console.log("error connecting to API = ", error.stack);
    }

    res.redirect("/");
  } else {
    console.log("not authenticated in /waitnumber/call");
  }
    
});

// a route a accept wait_number id hit from collected/delivered button
app.get("/waitnumber/collected/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let waitNumberId = parseInt(req.params.id);
    console.log("in /waitnumber/collected/:id id = ", waitNumberId);

    var patchData = {
      id: waitNumberId
    }

  
    try {
      const result = await axios.patch(API_URL + "/patch/waitnumbercollected/"+ waitNumberId, patchData, config);
      console.log("patch collected wait number done for id = ", waitNumberId, "return =", result.data);
      
    } catch (error) {
      console.log("error connecting to API = ", error.stack);
    }

    res.redirect("/");
  } else {
    console.log("not authenticated in /waitnumber/collected");
  }
    
});



// manage logon session and cookie
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      // http://localhost:3008/user/search?username=huat1
      const result = await axios.get(API_URL + "/user/search?username="+ username, config);
      // console.log("in passport use local = ", result.data);
      if (result.data.length > 0) {
        const user = result.data[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              console.log("wrong password for username = ", username);
              return cb("wrong password", false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});



app.listen(webPort, () => {
    console.log(`chatbot7 web-foodstall server is running on http://localhost:${webPort}`);
  });
  