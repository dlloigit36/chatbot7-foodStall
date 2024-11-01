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
const saltRounds = 10;


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
    res.redirect("/agent");
  });
});

// login page
app.get("/login", (req, res) => {
  res.render("login.ejs", {
    title: "Agent for chatbot7- Food Stall 👍"
  });
});

// login post page to accept username and password
app.post(
  "/login",
  passport.authenticate("local2", {
    successRedirect: "/agent",
    failureRedirect: "/login",
  })
);


// Route to render the main page
app.get("/agent", async (req, res) => {
  if (req.isAuthenticated()) {
    // return user data from passport.use- local
    // console.log(req.user);
    // const waitingNumberList = await getWaitingByCode(req.user.code);
    // let returnGuestDetail = [];

    let searchUser = true;
    let foundUser = false;
    let newUserFs = false;
    res.render("add-fs.ejs", { 
      searchUser: searchUser,
      foundUser: foundUser,
      newUserFs: newUserFs,
      name: req.user.first_name,
      profile: req.user.profile,
      agentId: req.user.id,
      message: "this is test message"
    });
  } else {
    console.log("not authenticated");
    res.redirect("/login");
  }
   
});

// // a route a accept wait_number id hit from calling button
// app.get("/waitnumber/call/:id", async (req, res) => {
//   if (req.isAuthenticated()) {
//     let waitNumberId = parseInt(req.params.id);
//     console.log("in /waitnumber/call/:id id = ", waitNumberId);
        
//     var patchData = {
//       id: waitNumberId,
//       call_d: new Date()
//     }

//     try {
//       const result = await axios.patch(API_URL + "/patch/waitnumber/"+ waitNumberId, patchData, config);
//       console.log("patch wait number done for id = ", waitNumberId, "return =",result.data);
      
//     } catch (error) {
//       console.log("error connecting to API = ", error.stack);
//     }

//     res.redirect("/");
//   } else {
//     console.log("not authenticated in /waitnumber/call");
//   }
    
// });

// // a route a accept wait_number id hit from collected/delivered button
// app.get("/waitnumber/collected/:id", async (req, res) => {
//   if (req.isAuthenticated()) {
//     let waitNumberId = parseInt(req.params.id);
//     console.log("in /waitnumber/collected/:id id = ", waitNumberId);

//     var patchData = {
//       id: waitNumberId
//     }

  
//     try {
//       const result = await axios.patch(API_URL + "/patch/waitnumbercollected/"+ waitNumberId, patchData, config);
//       console.log("patch collected wait number done for id = ", waitNumberId, "return =", result.data);
      
//     } catch (error) {
//       console.log("error connecting to API = ", error.stack);
//     }

//     res.redirect("/");
//   } else {
//     console.log("not authenticated in /waitnumber/collected");
//   }
    
// });

// // route where food stall username entered and search button clicked
app.post("/searchbyusername", async (req, res) => {
  if (req.isAuthenticated()) {
      let fsUsername = req.body.username;
    // console.log("printing user details in post searbyusername = ", req.user);

    let searchUser = true;
    let foundUser = true;
    let newUserFs = true;
    let usernameInSearch = "";

    let resultUsername = [];
    try {
      // http://localhost:3008/user/search?username=huat1
      const result = await axios.get(API_URL + "/user/search?username="+ fsUsername, config);
      // console.log("in POST /searchbyusername result = ", result.data);
      resultUsername = result.data;
      // console.log("value of result search user name= ", resultUsername);
      
    } catch (error) {
      console.log("error query guest list by tel number got error=", error);
    }
    

    // if search return no record, render create new food stall user
    if (resultUsername.length == 0) {
      searchUser = false;
      foundUser = false;
      newUserFs = true;
      usernameInSearch = fsUsername;
    } else if (resultUsername.length > 0) {
      searchUser = false;
      foundUser = true;
      newUserFs = false;
    }

    
    res.render("add-fs.ejs", { 
      searchUser: searchUser,
      foundUser: foundUser,
      newUserFs: newUserFs,
      name: req.user.first_name,
      profile: req.user.profile,
      agentId: req.user.id,
      userDetail: resultUsername,
      userNameInSearch: usernameInSearch,
      message: "this is test message"
    });
  } else {
    console.log("not authenticated in searchbyusername");
  }
  
});

app.post("/newfoodstall", async (req, res) => {
  if (req.isAuthenticated()) {
    
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  // console.log("return from hash= ", hashedPassword);

  let postNewFs= {
    fsName: req.body.foodstallName,
    agentId: req.body.agentId,
    fsUsername: req.body.username,
    fsPassword: hashedPassword
  };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.post(API_URL + "/foodstalluser/create", postNewFs, config);
    console.log("posted new user and food stall name. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API = ", error.stack);
  }

  res.redirect("/agent");
} else {
  res.redirect("/error");
  console.log("not authenticated in post newfoodstall");
}

});

// Route to render page to add new agent
app.get("/agent/admin", async (req, res) => {
  if (req.isAuthenticated()) {
    let searchAgent = true;
    let foundAgent = false;
    let newAgent = false;
    res.render("add-agent.ejs", { 
      searchAgent: searchAgent,
      foundAgent: foundAgent,
      newAgent: newAgent,
      name: req.user.first_name,
      profile: req.user.profile,
      agentId: req.user.id,
      message: "this is test message"
    });
  } else {
    console.log("not authenticated");
    res.redirect("/login");
  }
   
});

// route where agent email entered and search button clicked
app.post("/agent/admin/searchbyemail", async (req, res) => {
  if (req.isAuthenticated()) {
      let agentEmail = req.body.email;
    // console.log("printing user details in post searbyusername = ", req.user);

    let searchAgent = true;
    let foundAgent = true;
    let newAgent = true;
    let emailInSearch = "";

    let resultEmail = [];
    try {
      const result = await axios.get(API_URL + "/agent/search?email="+ agentEmail, config);
      // console.log("in POST /admin/searchbyemail = ", result.data);
      resultEmail = result.data;
      // console.log("value of result /admin/searchbyemail= ", resultEmail);
      
    } catch (error) {
      console.log("error query guest list by tel number got error=", error);
    }
    

    // if search return no record, render create new food stall user
    if (resultEmail.length == 0) {
      searchAgent = false;
      foundAgent = false;
      newAgent = true;
      emailInSearch = agentEmail;
    } else if (resultEmail.length > 0) {
      searchAgent = false;
      foundAgent = true;
      newAgent = false;
    }

    
    res.render("add-agent.ejs", { 
      searchAgent: searchAgent,
      foundAgent: foundAgent,
      newAgent: newAgent,
      name: req.user.first_name,
      profile: req.user.profile,
      agentId: req.user.id,
      agentDetail: resultEmail,
      emailInSearch: emailInSearch,
      message: "this is test message"
    });
  } else {
    console.log("not authenticated in searchbyemail");
  }
  
});

// POST route when create new agent form submitted
app.post("/agent/admin/createagent", async (req, res) => {
  if (req.isAuthenticated()) {
    
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  // console.log("return from hash= ", hashedPassword);

  let postNewAgent= {
    email: req.body.email,
    profile: "agent",
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword
  };

  // console.log(postNewAgent);

  // pass agent details and entered information to back end API server
  try {
    const result = await axios.post(API_URL + "/agentnew/create", postNewAgent, config);
    console.log("posted new agent details. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to agent API = ", error.stack);
  }

  res.redirect("/agent/admin");
} else {
  res.redirect("/error");
  console.log("not authenticated in post /agent/admin/createagent");
}

});

// a route edit agent button clicked from found agent
app.get("/agent/admin/editagent/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let agentId = parseInt(req.params.id);
    console.log("in /agent/admin/editagent/:id id = ", agentId);

    let resultAgentDetail = {};
        
    try {
      const result = await axios.get(API_URL + "/agent/byid/"+ agentId, config);
      // console.log("get agent details by id = ", agentId, "return =", result.data);
      resultAgentDetail = result.data;
      
    } catch (error) {
      console.log("error connecting to API = ", error.stack);
    }

    res.render("edit-agent.ejs", {
      profile: req.user.profile,
      agentDetail: resultAgentDetail,
      editAgent: true
    })
  } else {
    console.log("not authenticated in /waitnumber/call");
  }
    
});

// a route when update agent details clicked/sumitted
app.post("/agent/admin/updateagent", async (req, res) => {
  if (req.isAuthenticated()) {
    
  let editAgentData= {
    id: req.body.agentId,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.patch(API_URL + "/agent/edit/" + req.body.agentId, editAgentData, config);
    console.log("patching agent details. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API = ", error.stack);
  }

  res.redirect("/agent/admin");
} else {
  res.redirect("/error");
  console.log("not authenticated in post newfoodstall");
}

});

// a route reset password hit from found agent
app.get("/agent/admin/setpassword/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let agentId = parseInt(req.params.id);
    console.log("in /agent/admin/setpassword/:id id = ", agentId);

    let resultAgentDetail = {};
        
    try {
      const result = await axios.get(API_URL + "/agent/byid/"+ agentId, config);
      // console.log("get agent details by id = ", agentId, "return =", result.data);
      resultAgentDetail = result.data;
      
    } catch (error) {
      console.log("error connecting to API = ", error.stack);
    }

    res.render("edit-agent.ejs", {
      profile: req.user.profile,
      agentDetail: resultAgentDetail,
      editAgent: false,
      resetPassword: true
    })
  } else {
    console.log("not authenticated in /waitnumber/call");
  }
    
});

// POST route to get new agent password to reset /agent/admin/agentresetpassword
app.post("/agent/admin/agentresetpassword", async (req, res) => {
  if (req.isAuthenticated()) {

    const hashedPassword = await bcrypt.hash(req.body.agentPassword, saltRounds)
    
    let editAgentData= {
      id: req.body.agentId,
      newPassword: hashedPassword
    };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.patch(API_URL + "/agent/editpassword/" + req.body.agentId, editAgentData, config);
    console.log("patching agent password. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API = ", error.stack);
  }

  res.redirect("/agent/admin");
} else {
  res.redirect("/error");
  console.log("not authenticated in post agent reset password");
}

});

// a GET route edit user button clicked from found user, /user_id GET /agent/admin/edituser/9
app.get("/agent/admin/edituser/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let userId = parseInt(req.params.id);
    console.log("in /agent/admin/edituser/:id id = ", userId);

    let resultUserDetail = {};
        
    try {
      const result = await axios.get(API_URL + "/user/byid/"+ userId, config);
      // console.log("get user details by id = ", userId, "return =", result.data);
      resultUserDetail = result.data;
      
    } catch (error) {
      console.log("error connecting to API = ", error.stack);
    }

    res.render("edit-fs.ejs", {
      name: req.user.first_name,
      profile: req.user.profile,
      userDetail: resultUserDetail,
      editFs: false,
      editUser: true,
      resetPassword: false
    })
  } else {
    console.log("not authenticated in /agent/admin/edituser");
  }
    
});

// a route when update username details clicked/sumitted
app.post("/agent/admin/updateuser", async (req, res) => {
  if (req.isAuthenticated()) {
    
  let editUserData= {
    id: req.body.userId,
    username: req.body.userName
  };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.patch(API_URL + "/user/edit/" + req.body.userId, editUserData, config);
    console.log("patching user details. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API = ", error.stack);
  }

  res.redirect("/agent");
} else {
  res.redirect("/error");
  console.log("not authenticated in post /agent/admin/updateuser");
}

});

// a GET route reset password for user clicked from found user, /user_id example GET /agent/admin/setuserpassword/9
app.get("/agent/admin/setuserpassword/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let userId = parseInt(req.params.id);
    console.log("in /agent/admin/setuserpassword/:id id = ", userId);

    let resultUserDetail = {};
        
    try {
      const result = await axios.get(API_URL + "/user/byid/"+ userId, config);
      // console.log("get user details by id = ", userId, "return =", result.data);
      resultUserDetail = result.data;
      
    } catch (error) {
      console.log("error connecting to API in /agent/admin/setuserpassword/:id = ", error.stack);
    }

    res.render("edit-fs.ejs", {
      name: req.user.first_name,
      profile: req.user.profile,
      userDetail: resultUserDetail,
      editFs: false,
      editUser: false,
      resetPassword: true
    })
  } else {
    console.log("not authenticated in /waitnumber/call");
  }
    
});

// a route when reset user password clicked/submitted. POST /agent/admin/resetuserpassword
app.post("/agent/admin/resetuserpassword", async (req, res) => {
  if (req.isAuthenticated()) {

  const hashedPassword = await bcrypt.hash(req.body.userPassword, saltRounds)
    
  let editUserData= {
    id: req.body.userId,
    password: hashedPassword
  };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.patch(API_URL + "/user/editpwd/" + req.body.userId, editUserData, config);
    console.log("patching user details. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API in /agent/admin/resetuserpassword = ", error.stack);
  }

  res.redirect("/agent");
} else {
  res.redirect("/error");
  console.log("not authenticated in post /agent/admin/resetuserpassword");
}

});

// a GET route from found user, click edit foodstall name. GET /agent/admin/editfs/9 (9 = fs_detail id)
app.get("/agent/admin/editfs/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let fsId = parseInt(req.params.id);
    console.log("in /agent/admin/editfs/:id id = ", fsId);

    let resultFsDetail = {};
        
    try {
      const result = await axios.get(API_URL + "/fs/byid/"+ fsId, config);
      console.log("get fs details by id = ", fsId, "return =", result.data);
      resultFsDetail = result.data;
      
    } catch (error) {
      console.log("error connecting to API in /agent/admin/setuserpassword/:id = ", error.stack);
    }

    res.render("edit-fs.ejs", {
      name: req.user.first_name,
      profile: req.user.profile,
      fsDetail: resultFsDetail,
      editFs: true,
      editUser: false,
      resetPassword: false
    })
  } else {
    console.log("not authenticated in /agent/admin/editfs");
  }
    
});

// a POST route where food stall name update button clicked. POST /agent/admin/updatefsname
app.post("/agent/admin/updatefsname", async (req, res) => {
  if (req.isAuthenticated()) {
  
  let editFsData= {
    id: req.body.fsId,
    name: req.body.fsName
  };

  // pass food details and entered information to back end API server
  try {
    const result = await axios.patch(API_URL + "/fs/editname/" + req.body.fsId, editFsData, config);
    console.log("patching fs details. return =", result.data);
    
  } catch (error) {
    console.log("error connecting to food stall API in /agent/admin/updatefsname = ", error.stack);
  }

  res.redirect("/agent");
} else {
  res.redirect("/error");
  console.log("not authenticated in post /agent/admin/updatefsname");
}

});


// manage logon session and cookie
passport.use(
  "local2",
  new Strategy(async function verify(username, password, cb) {
    try {
      // http://localhost:3008/agent/search?email=james@simapps.net
      const result = await axios.get(API_URL + "/agent/search?email="+ username, config);
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
              console.log("wrong password for agent email = ", username);
              return cb("wrong password", false);
            }
          }
        });
      } else {
        return cb("agent not found");
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
    console.log(`chatbot7-foodstall for agent running on http://localhost:${webPort}`);
  });
  