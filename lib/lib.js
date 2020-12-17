// File for general purpose functions...

// Dependencies...

const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");
const uri = // Mongo URI;

lib = {};

lib.isUserUnique = (username,email) => {
	return new Promise((res,rej) => {
 let client = new MongoClient(uri);
	client.connect((err) => {
		let users = client.db("Scribler").collection("Users");
           if (!err) {
          users.findOne({username: username},(err,result) => {
             if (!err) {
               if (result == null) {
                 users.findOne({email: email},(err,result) => {
                    if (!err) {
                     if (result == null) {
                          res();
			     client.close();
		     } else {
                     rej("email");
			     client.close();
		     }
		    } else {
                rej("error");
			    client.close();
		    }
		 })
	       } else {
                 rej("username");
		       client.close();
	       }
	     } else {
            rej("error");
		     client.close();
	     }
	  })
	   } else {
        rej("error");
		   client.close();
         }
	})
    });
}

lib.createUserId = () => {
 let userId = "";
                let alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

                for (let i = 0; i < 16; i++) {
                  userId += alpha.charAt(Math.floor(Math.random() * (62 - 0 + 1)));
                }
	return userId;
}

lib.createSession = (userId) => {
	return new Promise((res,rej) => {

         let sessionId = "";
		let alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

		for (let i = 0; i < 32; i++) {
                  sessionId += alpha.charAt(Math.floor(Math.random() * (62 - 0 + 1)));
	        }

            fs.writeFile("./.data/session_tokens/" + sessionId + ".json",JSON.stringify({userId: userId}),(err) => {
             if (!err) {
               res(sessionId);
	     } else {
             rej();
	     }
	 })
	});
}

lib.getUserData = (userId) => {
return new Promise((res,rej) => {
 let client = new MongoClient(uri);
	client.connect((err) =>{
          if (!err) {
           client.db("Scribler").collection("Users").findOne({_id: userId},(err,result) => {
             if (!err) {
               if (result !== null) {
                  res(result);
		  } else {
               rej();
	       }
	     } else {
               rej();
		     client.close();
	     }
	   })
	  } else {
           rej();
		  client.close();
	  }
	})
})
}

lib.validateSessionId = (sessionId) => {
	let boo = true;
	try {
  fs.readFileSync(__dirname+"/../.data/session_tokens/" + sessionId + ".json");
	} catch (err) {
          boo = false;
	}
	return boo;
}

// Export the module...

module.exports = lib;

