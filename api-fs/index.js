import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();

// API key to check against req.query.key
// const accessAPIKey = "47f2ac60-6b77-4e12-ae38-577275cfa621";
const accessAPIKey = process.env.API_KEY;
const ApiPort = process.env.API_LISTEN_PORT;
const dbUserName = process.env.DB_USERNAME;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

// make postgresql database connection
const db = new pg.Client({
    user: dbUserName,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
  });
db.connect();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Write your code here//

//GET username and password for authentication. example = http://localhost:3008/user/search?username=huat1
app.get("/user/search", async (req, res) => {
  let userApiKey = req.query.key;
  let urlUsername = req.query.username;
  if (userApiKey === accessAPIKey) {
    let returnUserDetails = [];
    try {
      let queryLine = `SELECT user_detail.id AS user_id, username, password, code, name, operation_b, agent_id, fs_id
FROM user_detail
JOIN fs_detail
ON fs_id = fs_detail.id
WHERE username = $1;`
      let dbUser = await db.query(queryLine, [urlUsername]);
      // console.log(guestList.rows);
      returnUserDetails = dbUser.rows;

      res.json(returnUserDetails);
    } catch (error) {
      console.log("error connecting to foodstall database getting user details= ", error)
      res.status(500).json({ message: "Error fetching user details" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

//GET waiting number list search by id or fscode. 
// search by fs code, example =        http://localhost:3008/waitnumber/search?fscode=myslpjss2n001
// search by wait number id, example = http://localhost:3008/waitnumber/search?id=3
app.get("/waitnumber/search", async (req, res) => {
  let userApiKey = req.query.key;
  let fsCode = req.query.fscode;
  let numberId = req.query.id;
  let searchBy = Object.keys(req.query)[0]
  let queryValue1 = "";

  // console.log("search by type = ", searchBy);
  
  if (userApiKey === accessAPIKey) {
    let resultWaitList = [];
    let idOrFscode = "";
    switch (searchBy) {
      case "fscode":
        idOrFscode = "fs_code";
        queryValue1 = fsCode;
        break;
      case "id":
        idOrFscode = "id";
        queryValue1 = numberId;
        break;
      default:
        idOrFscode = "fs_code";
        queryValue1 = fsCode;
        break;
    }
    let queryLine = `SELECT * FROM wait_number WHERE ${idOrFscode} = $1 AND collected_b = false ORDER BY number ASC;`
    // console.log(qLine);
    try {
      // let queryLine = `SELECT * FROM wait_number WHERE fs_code = $1 AND collected_b = false ORDER BY number ASC;`
      let dbWaitList = await db.query(queryLine, [queryValue1]);
      resultWaitList = dbWaitList.rows;

      res.json(resultWaitList);
    } catch (error) {
      console.log("error connecting to foodstall database get waiting list= ", error)
      res.status(500).json({ message: "Error fetching waiting list" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

//PATCH wait_number item with last_call_date and call_count +1 example = http://localhost:3008/patch/waitnumber/1
app.patch("/patch/waitnumber/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let waitNumberId = parseInt(req.params.id);

  let updateLastCallDate = req.body.call_d;
  
  let queryLine = `UPDATE wait_number
  SET last_call_d = $1, call_count = call_count + 1
  WHERE id = $2;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [updateLastCallDate, waitNumberId]);
      // console.log(queryResult);
      res.json({ message: "wait number updated successfully"});
  
    } catch (error) {
      console.log("error connecting to food stall database= ", error)
      res.status(500).json({ message: "Error patching wait_number record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

//PATCH wait_number item with collected_bool set to true example = http://localhost:3008/patch/waitnumbercollected/1
app.patch("/patch/waitnumbercollected/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let waitNumberId = parseInt(req.params.id);

  // let updateLastCallDate = req.body.call_d;
  console.log(waitNumberId);
  
  let queryLine = `UPDATE wait_number
  SET collected_b = true WHERE id = $1;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [waitNumberId]);
      // console.log(queryResult);
      res.json({ message: "wait number updated successfully"});
  
    } catch (error) {
      console.log("error connecting to food stall database= ", error)
      res.status(500).json({ message: "Error patching wait_number record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// agent web api
//GET username and password for authentication. example = http://localhost:3008/agent/search?email=james@simapps.net
app.get("/agent/search", async (req, res) => {
  let userApiKey = req.query.key;
  let enterEmail = req.query.email;
  if (userApiKey === accessAPIKey) {
    let resultAgentDetails = [];
    try {
      let queryLine = `SELECT * FROM agent_detail WHERE email = $1;`
      let dbUser = await db.query(queryLine, [enterEmail]);
      // console.log(guestList.rows);
      resultAgentDetails = dbUser.rows;

      res.json(resultAgentDetails);
    } catch (error) {
      console.log("error connecting to foodstall database getting agent details= ", error)
      res.status(500).json({ message: "Error fetching agent details" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// POST to create new foodstall and new username
app.post("/foodstalluser/create", async (req, res) => {
  let userApiKey = req.query.key;

  let fsName = req.body.fsName;
  let agentId = req.body.agentId;
  let fsUsername = req.body.fsUsername;
  let fsPassword = req.body.fsPassword;

  let randomCode = new Date().valueOf().toString();
  
  let fsCode = "my" + "sl" + "pj" + agentId + randomCode.substring(4, 13);
  console.log("generated code= ", fsCode)
  
  // add new record into fs_details, get RETURNING ID as fs_id
  let qLine1 = `INSERT INTO fs_detail (code, name, operation_b, agent_id) 
    VALUES ($1, $2, 'true', $3) RETURNING id;`
  let fsId = -1;

  // add new record into guest_stay
  let qLine2 = `INSERT INTO user_detail (username, password, fs_id) VALUES ($1, $2, $3);`

  if (userApiKey === accessAPIKey) {
    try {
      const qReturnId = await db.query(qLine1, [fsCode, fsName, agentId]);
      fsId = qReturnId.rows[0].id;

      const queryReturn = await db.query(qLine2, [fsUsername, fsPassword, fsId]);
      // console.log(queryReturn);
      res.json({ message: "user_detail and fs_detais new record added successfully" });
  
    } catch (error) {
      console.log("error connecting to food stall database= ", error)
      res.status(500).json({ message: "Error posting new food stall record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  };

});

// POST to create new agent
app.post("/agentnew/create", async (req, res) => {
  let userApiKey = req.query.key;

  let agentEmail = req.body.email;
  let agentPassword = req.body.password;
  let agentFirstName = req.body.firstName;
  let agentLastName = req.body.lastName;
  let agentProfile = req.body.profile;
  
  // add new record into fs_details, get RETURNING ID as fs_id
  let qLine1 = `INSERT INTO agent_detail (email, password, profile, first_name, last_name)
    VALUES ($1, $2, $3, $4, $5);`
  
  if (userApiKey === accessAPIKey) {
    try {
      const qResult = await db.query(qLine1, [agentEmail, agentPassword, agentProfile, agentFirstName, agentLastName]);
      // console.log(qResult);

      res.json({ message: "new agent created successfully" });
  
    } catch (error) {
      console.log("error connecting to food stall database= ", error)
      res.status(500).json({ message: "Error posting new food stall record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  };

});

//GET agent details with agent ID, example = http://localhost:3008/agent/byid/2
app.get("/agent/byid/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let agentId = parseInt(req.params.id);

  let queryLine = `SELECT * FROM agent_detail WHERE id = $1;`

  if (userApiKey === accessAPIKey) {
    try {
      const qResult = await db.query(queryLine, [agentId]);
      let resultAgentDetails = qResult.rows[0];

      res.json(resultAgentDetails);
  
    } catch (error) {
      console.log("error connecting to agent detail= ", error)
      res.status(500).json({ message: "Error getting agent detail" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// PATCH agent details
app.patch("/agent/edit/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let agentId = parseInt(req.params.id);

  let agentEmail = req.body.email;
  let agentFirstName = req.body.firstName;
  let agentLastName= req.body.lastName;
  
  
  let queryLine = `UPDATE agent_detail
  SET email = $1, first_name = $2, last_name = $3
  WHERE id = $4;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [agentEmail, agentFirstName, agentLastName, agentId]);
      // console.log(queryResult);
      res.json({ message: `agent details updated successfully, id = ${agentId}`});
  
    } catch (error) {
      console.log("error connecting to agent detail table= ", error)
      res.status(500).json({ message: "Error patching agent record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// PATCH agent password
app.patch("/agent/editpassword/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let agentId = parseInt(req.params.id);

  let agentPassword = req.body.newPassword;
  
  let queryLine = `UPDATE agent_detail SET password = $1 WHERE id = $2;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [agentPassword, agentId]);
      // console.log(queryResult);
      res.json({ message: `agent password details updated successfully, id = ${agentId}`});
  
    } catch (error) {
      console.log("error connecting to agent detail table= ", error)
      res.status(500).json({ message: "Error patching agent record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

//GET user details with user ID, example = http://localhost:3008/user/byid/2
app.get("/user/byid/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let userId = parseInt(req.params.id);

  let queryLine = `SELECT * FROM user_detail WHERE id = $1;`

  if (userApiKey === accessAPIKey) {
    try {
      const qResult = await db.query(queryLine, [userId]);
      let resultUserDetails = qResult.rows[0];

      res.json(resultUserDetails);
  
    } catch (error) {
      console.log("error connecting to user detail= ", error)
      res.status(500).json({ message: "Error getting agent detail" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// PATCH user details, username
app.patch("/user/edit/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let userId = parseInt(req.params.id);

  let userName = req.body.username;
  
  let queryLine = `UPDATE user_detail
  SET username = $1 WHERE id = $2;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [userName, userId]);
      // console.log(queryResult);
      res.json({ message: `user details updated successfully, id = ${userId}`});
  
    } catch (error) {
      console.log("error connecting to user detail table= ", error)
      res.status(500).json({ message: "Error patching user record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// PATCH user details, password
app.patch("/user/editpwd/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let userId = parseInt(req.params.id);

  let newPassword = req.body.password;
  
  let queryLine = `UPDATE user_detail
  SET password = $1 WHERE id = $2;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [newPassword, userId]);
      // console.log(queryResult);
      res.json({ message: `user pwd updated successfully, id = ${userId}`});
  
    } catch (error) {
      console.log("error connecting to user detail table= ", error)
      res.status(500).json({ message: "Error patching user record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

//GET food stall details with fs ID, example = http://localhost:3008/agent/admin/editfs/9
app.get("/fs/byid/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let fsId = parseInt(req.params.id);

  let queryLine = `SELECT * FROM fs_detail WHERE id = $1;`

  if (userApiKey === accessAPIKey) {
    try {
      const qResult = await db.query(queryLine, [fsId]);
      let resultfsDetails = qResult.rows[0];

      res.json(resultfsDetails);
  
    } catch (error) {
      console.log("error connecting to food stall detail= ", error)
      res.status(500).json({ message: "Error getting fs detail" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});

// PATCH foodstall/fs details, change fs name
app.patch("/fs/editname/:id", async (req, res) => {
  let userApiKey = req.query.key;
  let fsId = parseInt(req.params.id);

  let newFsName = req.body.name;
  
  let queryLine = `UPDATE fs_detail
  SET name = $1 WHERE id = $2;`

  if (userApiKey === accessAPIKey) {
    try {
      const queryResult = await db.query(queryLine, [newFsName, fsId]);
      // console.log(queryResult);
      res.json({ message: `fs name updated successfully, id = ${fsId}`});
  
    } catch (error) {
      console.log("error connecting to fs detail table= ", error)
      res.status(500).json({ message: "Error patching fs record" });
    }
  } else {
    res
      .status(404)
      .json({error: `you are not authorized.`});
  }

});


app.listen(ApiPort, () => {
  console.log(`API is running at http://localhost:${ApiPort}`);
});
