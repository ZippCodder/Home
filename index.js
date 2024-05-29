// Main file...

// Dependencies...

require("dotenv").config();

const http = require("http");
const https = require("https");
const url = require("url");
const util = require("util");
const debug = util.debuglog;
const handlers = require("./lib/handlers");
const uri = process.env.MONGO_URI;
const port = process.env.PORT;

// Starting server...

const protocol = (process.env.MODE === "development") ? http:https;
const server = protocol.createServer((process.env.MODE === "production") ? {key: fs.readFileSync(process.env.KEY_PATH), cert: fs.readFileSync(process.env.CERT_PATH)}:undefined);

server.on("request", (req,res) => {

    function send(status,resp,contentType,sessionId,redirect) {
        
	    console.log(req.url);

        status = typeof status == "number" ? status:200;
        resp = resp !== undefined ? resp:"Success!";
        contentType = contentType !== undefined ? contentType:"application/json";
          
        if (sessionId) {                       
         res.setHeader("Set-Cookie","sessionId=" + sessionId + "; Path=/");
	 }  
	    if (redirect !== undefined) {
              res.setHeader("Location",redirect);
		   res.writeHead(307);
		    res.end();
	    } else {
        res.setHeader("Content-Type",contentType);
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(status);
        res.write(resp);
        res.end();
	    }
       
        if (status == 200) {
         console.log("\x1b[42m",status,"\x1b[0m");   
        } else {
             console.log("\x1b[41m",status,"\x1b[0m"); 
        }
    }
    
    let body = "";
    let parsedUrl = url.parse(req.url,true);
    
    req.on("data", (data) => {
       body += data.toString(); 
    });
    
    req.on("end", () => {
       const data = {
           method: req.method,
           path: parsedUrl.pathname.replace(/^\/+|\/+$/g,"").trim(),
           body: body,
           query: parsedUrl.query,
           headers: req.headers
       }

	    if (data.path == "") {
              handlers.index(data,send);
	    } else if (/\w+\.\w+$/.test(data.path)) {
              handlers.staticAsset(/\w+\.\w+$/.exec(data.path)[0],send);
	    } else {
        let handler = router[data.path] !== undefined?router[data.path]:handlers.notFound;
	    handler(data,send);
	    }
});
});

// Listen on port 3000...

server.listen(port, () => {
    console.log("Server is listening...");
})

// Setting up routes...

const router = {
    index: handlers.index,
    login: handlers.login,
    signup: handlers.signup,
   "users/dashboard/new": handlers.dashboardNew,
	"users/dashboard/docs": handlers.dashboardDocs,
	"users/dashboard/friends": handlers.dashboardFriends,
	"users/dashboard/recent": handlers.dashboardRecent,
	"users/logout": handlers.logoutUser,
    "users/create": handlers.createUser,
	"users/request": handlers.sendFriendRequest,
	"users/accept": handlers.acceptFriendRequest,
	"users/reject": handlers.rejectFriendRequest,
	"users/remove": handlers.removeFriend,
	"users/login": handlers.loginUser,
	"users/share": handlers.shareDocument,
	"docs/create": handlers.createDoc,
	"docs/all": handlers.getDocs,
	"docs/edit": handlers.editDoc,
	"docs/delete": handlers.deleteDoc,
}

