// File for request handling...

// Dependencies...

const fs = require("fs");
const querystring = require("querystring");
const crypto = require("crypto");
const MongoClient = require("mongodb-legacy").MongoClient;
const ObjectId = require("mongodb-legacy").ObjectId;
const lib = require("./lib");
const uri = process.env.MONGO_URI;

    // Start handlers object...

    const handlers = {};

/* STATIC ASSET HANDLERS */

// Index handler...

handlers.index = (reqData, send) => {
    console.log(reqData);
    fs.readFile("./src/pages/home.html", "utf-8", (err, data) => {
        if (!err) {
            if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
                fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, result) => {
                    if (!err) {
                        let sessionToken = JSON.parse(result);
                        lib.getUserData(sessionToken.userId).then(userObj => {
                            let finalString = data.replace("{username}", userObj.username).replaceAll("{logged}", "logged-in").replace("{dashboard}", "Dashboard").replace("{logout}", "Logout");
                            if (userObj.activity.length > 0) {
                                finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                            }
                            send(200, finalString, "text/html");
                        }).catch(() => {
                            send(500, "Error while reading user data!");
                        })
                    } else {
                        send(500, "Error occured reading user data!");
                    }
                })
            } else {
                let finalString = data.replace("{username}", "").replaceAll("{logged}", "logged-out").replace("{dashboard}", "").replace("{logout}", "");
                send(200, finalString, "text/html");
            }
        } else {
            send(500, "Error occurred while reading file!");
        }
    })
}

// Signup handler...

handlers.signup = (reqData, send, error) => {
    fs.readFile("./src/pages/signup.html", "utf-8", (err, data) => {
        if (!err) {
            if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
                fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, result) => {
                    if (!err) {
                        let sessionToken = JSON.parse(result);
                        lib.getUserData(sessionToken.userId).then(userObj => {
                            let finalString = data.replace("{username}", userObj.username).replaceAll("{logged}", "logged-in").replace("{dashboard}", "Dashboard").replace("{logout}", "Logout");
                            if (typeof error == "string") {
                                finalString = finalString.replace("<!--err-->", error);
                            }
                            if (userObj.activity.length > 0) {
                                finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                            }
                            send(200, finalString, "text/html");
                        }).catch(() => {
                            send(500, "Error while reading user data!");
                        })
                    } else {
                        send(500, "Error occured reading user data!");
                    }
                })
            } else {
                let finalString = data.replace("{username}", "").replaceAll("{logged}", "logged-out").replace("{dashboard}", "").replace("{logout}", "");
                if (typeof error == "string") {
                    finalString = finalString.replace("<!--err-->", error);
                }
                send(200, finalString, "text/html");
            }
        } else {
            send(500, "Error occurred while reading file!");
        }
    })
}
// Login handler...

handlers.login = (reqData, send, error) => {
    fs.readFile("./src/pages/login.html", "utf-8", (err, data) => {
        if (!err) {
            if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
                fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, result) => {
                    if (!err) {
                        let sessionToken = JSON.parse(result);
                        lib.getUserData(sessionToken.userId).then(userObj => {
                            let finalString = data.replace("{username}", userObj.username).replaceAll("{logged}", "logged-in").replace("{dashboard}", "Dashboard").replace("{logout}", "Logout");
                            if (typeof error == "string") {
                                finalString = finalString.replace("<!--err-->", error);
                            }
                            if (userObj.activity.length > 0) {
                                finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                            }
                            send(200, finalString, "text/html");
                        }).catch(() => {
                            send(500, "Error while reading user data!");
                        })
                    } else {
                        send(500, "Error occured reading user data!");
                    }
                })
            } else {
                let finalString = data.replace("{username}", "").replaceAll("{logged}", "logged-out").replace("{dashboard}", "").replace("{logout}", "");
                if (typeof error == "string") {
                    finalString = finalString.replace("<!--err-->", error);
                }
                send(200, finalString, "text/html");
            }
        } else {
            send(500, "Error occurred while reading file!");
        }
    })
}

// Not found handler...

handlers.notFound = (reqData, send) => {
    send(404, "Resource not found!");
}

// Handler for retreiving static assets...

handlers.staticAsset = (fileName, send) => {
    let ext = /\.\w+$/.exec(fileName)[0],
        folder, type;
    switch (ext) {
        case ".js": {
          folder = "./dist/scripts";
          type = "text/javascript"; 
        };
        break; 
        case ".html": {
          folder = "./src/pages"; 
          type = "text/html";
        };
        break; 
        case ".css": {
          folder = "./dist/styles"; 
          type = "text/css";
        }; 
        break;
        case ".svg": {
          folder = "./public/images";
          type = "image/svg+xml";
        };
        break; 
        case ".png": {
          folder = "./public/images";
          type = "image/png";
        }
        default: {
          folder = "./public/images"; 
        } 
        break; 
    }

    fs.readFile(folder + "/" + fileName, (err, result) => {
        if (!err && result) {
            send(200, result, type);
        } else {
            send(404, "Resource not found!");
        }
    });
}

/* USER AUTHENTICATION HANDLERS */

// Create a user...

handlers.createUser = (reqData, send) => {
    let body = reqData.body !== undefined ? JSON.parse(JSON.stringify(querystring.parse(reqData.body))) : false;
    if (body) {
        let username = typeof body.username == "string" ? body.username.trim() : false;
        let email = typeof body.email == "string" ? body.email.trim() : false;
        let password = typeof body.password == "string" ? body.password.trim() : false;
        let passwordRe = typeof body["password-re"] == "string" ? body["password-re"].trim() : false;
        if (username && email && password && passwordRe) {
            if (password == passwordRe) {

                let userObj = {
                    _id: lib.createUserId(),
                    username: username,
                    email: email,
                    password: crypto.createHash("sha256").update(password).digest("hex"),
                    friends: [],
                    friendRequests: [],
                    activity: [],
                    documents: []
                }
                lib.isUserUnique(username, email).then(() => {
                    let client = new MongoClient(uri);
                    client.connect((err) => {
                        if (!err) {
                            client.db("Scribler").collection("Users").insertOne(userObj, (err, result) => {
                                if (!err) {
                                    lib.createSession(userObj._id).then(sessionId => {
                                        send(307, undefined, undefined, sessionId, "http://localhost:3000/users/dashboard/docs");
                                    }).catch(() => {
                                        send(500, "Error occured while creating user session!");
                                    });
                                } else {
                                   send(500, "Error occured while creating a user!");
                                }
                            })
                        } else {
                            send(500, "Error occured while creating a user!");
                        }
                    })
                }).catch((err) => {
                    if (err == "error") {
                        send(500, "Error occured while creating user!");
                    } else if (err == "username") {
                        handlers.signup(reqData, send, "A user with that username already exists!");
                    } else {
                        handlers.signup(reqData, send, "A user with that email already exists!");
                    }
                })

            } else {
                handlers.signup(reqData, send, "Passwords dont match!");
            }
        } else {
            send(400, "Missing required feilds!");
        }
    } else {
        send(400, "Missing or invalid request body!");
    }
}

// Login user...

handlers.loginUser = (reqData, send) => {
    if (reqData.body !== undefined) {
        let body = JSON.parse(JSON.stringify(querystring.parse(reqData.body)));

        let username = typeof body.username == "string" ? body.username.trim() : false;
        let password = typeof body.password == "string" ? body.password.trim() : false;

        if (username && password) {
            let client = new MongoClient(uri);
            client.connect((err) => {
                if (!err) {
                    client.db("Scribler").collection("Users").findOne({
                        username: username,
                        password: crypto.createHash("sha256").update(password).digest("hex")
                    }, (err, result) => {
                        if (!err) {
                            if (result !== null) {
                                lib.createSession(result._id).then(sessionId => {
                                    send(307, undefined, undefined, sessionId, "http://localhost:3000/users/dashboard/docs");
                                    client.close();
                                }).catch(() => {
                                    send(500, "Error ocurred while creating session!");
                                    client.close();
                                })
                            } else {
                                handlers.login(reqData, send, "Invalid username or password!");
                                client.close();
                            }
                        } else {
                            send(500, "Error occured while logging in user!");
                            client.close();
                        }
                    })
                } else {
                    send(500, "Error occured while logging in user!");
                    client.close();
                }
            })
        } else {
            send(400, "Missing required feild!");
        }
    } else {
        send(400, "Missing or invalid request body!");
    }
}

// Logout user...

handlers.logoutUser = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
        fs.unlink("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", (err) => {
            if (!err) {
                send(301, undefined, undefined, undefined, "http://localhost:3000/");
            } else {
                send(500, "Error ocurred while reading users data!");
            }
        })
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Dashboard new handler...

handlers.dashboardNew = (reqData, send) => {
    if (reqData.headers.cookie !== undefined) {
        let isValid = lib.validateSessionId(reqData.headers.cookie.split("=")[1]);
        if (isValid) {
            fs.readFile("./src/pages/new.html", "utf-8", (err, result) => {
                if (!err) {
                    fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
                        if (!err) {
                            lib.getUserData(JSON.parse(data).userId).then(userObj => {
                                let finalString = result.replace(/\{username\}/gm, userObj.username);
                                if (userObj.activity.length > 0) {
                                    finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                                }
                                send(200, finalString, "text/html");
                            }).catch(() => {
                                send(500, "Error occured while loading user data!");
                            });
                        } else {
                            throw err;
                            send(500, "Error ocurred while loading user data!");
                        }
                    })
                } else {
                    send(500, "Error ocurred while loading users 'New' page!");
                }
            })
        } else {
            send(307, undefined, undefined, undefined, "http://localhost:3000/login");
        }
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Dashboard docs handler...

handlers.dashboardDocs = (reqData, send) => {
    if (reqData.headers.cookie !== undefined) {
        let isValid = lib.validateSessionId(reqData.headers.cookie.split("=")[1]);
        if (isValid) {
            fs.readFile("./src/pages/docs.html", "utf-8", (err, result) => {
                if (!err) {
                    fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
                        if (!err) {
                            lib.getUserData(JSON.parse(data).userId).then(userObj => {
                                let finalString = result.replace(/\{username\}/gm, userObj.username);
                                if (userObj.activity.length > 0) {
                                    finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                                }
                                console.log(finalString);
                                send(200, finalString, "text/html");
                            }).catch(() => {
                                send(500, "Error ocurrd while loading user data!");
                            })
                        } else {
                            send(500, "Error ocurred while loading user data!");
                        }
                    })
                } else {
                    send(500, "Error ocurred while loading users 'Docs' page!");
                }
            })
        } else {
            send(307, undefined, undefined, undefined, "http://localhost:3000/login");
        }
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Dashboard friends handler...

handlers.dashboardFriends = (reqData, send) => {
    if (reqData.headers.cookie !== undefined) {
        let isValid = lib.validateSessionId(reqData.headers.cookie.split("=")[1]);
        if (isValid) {
            fs.readFile("./src/pages/friends.html", "utf-8", (err, result) => {
                if (!err) {
                    fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
                        if (!err) {
                            lib.getUserData(JSON.parse(data).userId).then(userObj => {
                                let client = new MongoClient(uri);
                                client.connect((err) => {
                                    client.db("Scribler").collection("Docs").find({
                                        creator: userObj.username
                                    }).toArray((err, res) => {
                                        let finalString = result.replace(/\{username\}/gm, userObj.username).replace("{friends}", JSON.stringify(userObj.friends)).replace("{friendRequests}", JSON.stringify(userObj.friendRequests)).replace("{documents}", JSON.stringify(res));
                                        if (userObj.activity.length > 0) {
                                            finalString = finalString.replace("/*notifications*/", "\"" + userObj.activity.length + "\"");
                                        }
                                        console.log(finalString);
                                        send(200, finalString, "text/html");
                                    })
                                })
                            }).catch(() => {
                                send(500, "Error ocurrd while loading user data!");
                            })
                        } else {
                            send(500, "Error ocurred while loading user data!");
                        }
                    })
                } else {
                    send(500, "Error ocurred while loading users 'Friends' page!");
                }
            })
        } else {
            send(307, undefined, undefined, undefined, "http://localhost:3000/login");
        }
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Recent handler... 

handlers.dashboardRecent = (reqData, send) => {
    if (reqData.headers.cookie !== undefined) {
        let isValid = lib.validateSessionId(reqData.headers.cookie.split("=")[1]);
        if (isValid) {
            fs.readFile("./src/pages/recent.html", "utf-8", (err, result) => {
                if (!err) {
                    fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
                        if (!err) {
                            lib.getUserData(JSON.parse(data).userId).then(userObj => {
                                let finalString = result.replace("{username}", userObj.username).replace("{activity}", JSON.stringify(userObj.activity));
                                send(200, finalString, "text/html");
                                let client = new MongoClient(uri);
                                client.connect((err) => {
                                    if (!err) {
                                        client.db("Scribler").collection("Users").updateOne({
                                            username: userObj.username
                                        }, {
                                            $set: {
                                                activity: []
                                            }
                                        }, (err, obj) => {
                                            client.close();
                                        })
                                    }
                                });
                            }).catch(() => {
                                send(500, "Error ocurrd while loading user data!");
                            })
                        } else {
                            send(500, "Error ocurred while loading user data!");
                        }
                    })
                } else {
                    send(500, "Error ocurred while loading users 'Docs' page!");
                }
            })
        } else {
            send(307, undefined, undefined, undefined, "http://localhost:3000/login");
        }
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Create a document...

handlers.createDoc = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
        if (reqData.body !== undefined) {
            let body = JSON.parse(reqData.body);
            let title = typeof body.title == "string" ? body.title.trim() : false;
            let main = typeof body.main == "string" ? body.main.trim() : false;
            let username = typeof body.username == "string" ? body.username.trim() : false;
            if (title && main && username) {
                fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
                    if (!err) {
                        let sToken = JSON.parse(data);
                        lib.getUserData(sToken.userId).then(userObj => {
                            let client = new MongoClient(uri);
                            client.connect((err) => {
                                if (!err) {
                                    let id = lib.createUserId();
                                    client.db("Scribler").collection("Docs").insertOne({
                                        creator: username,
                                        title: title,
                                        writers: [username],
                                        dateMade: new Date(),
                                        main: main,
                                        owners: [username]
                                    }, (err, result) => {
                                        if (!err) {
                                            send(200, "http://localhost:3000/users/dashboard/docs", "text/plain");
                                        } else {
                                            send(500, "Error ocurred while creating document!");
                                            client.close();
                                        }
                                    })
                                } else {
                                    send(500, "Error ocurred while reading user data!");
                                    client.close();
                                }
                            })
                        }).catch(() => {
                            send(500, "Error ocurred while reading user data!");
                        })
                    } else {
                        send(500, "Error ocurred while reading user data!");
                    }
                });
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Delete document...

handlers.deleteDoc = (reqData, send) => {
    if (reqData.headers.cookie != undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
        if (JSON.parse(reqData.body) instanceof Object) {
            let body = JSON.parse(reqData.body);
            let documentId = typeof body.id == "string" ? body.id : false;
            let username = typeof body.username == "string" ? body.username : false;
            if (documentId) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        if (!username) {
                            client.db("Scribler").collection("Docs").deleteOne({
                                _id: new ObjectId(documentId)
                            }, (err, obj) => {
                                if (!err) {
                                    send();
                                } else {
                                    send(500, "Error ocurred while deleting document!");
                                    client.close();
                                }
                            });
                        } else {
                            client.db("Scribler").collection("Docs").updateOne({
                                _id: documentId
                            }, {
                                $pull: {
                                    owners: username,
                                    writers: username
                                }
                            }, (err, obj) => {
                                client.close();
                            })
                        }
                    } else {
                        send(500, "Error ocurred while deleting document!");
                        client.close();
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Get all documents for a given user...

handlers.getDocs = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && lib.validateSessionId(reqData.headers.cookie.split("=")[1])) {
        fs.readFile("./.data/session_tokens/" + reqData.headers.cookie.split("=")[1] + ".json", "utf-8", (err, data) => {
            if (!err) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    let userId = JSON.parse(data).userId;
                    if (!err) {
                        client.db("Scribler").collection("Users").findOne({
                            _id: userId
                        }, (err, res) => {
                            console.log(res);
                            client.db("Scribler").collection("Docs").find({
                                owners: res.username
                            }).toArray((err, result) => {
                                if (!err) {
                                    send(200, JSON.stringify({
                                        result: result
                                    }));
                                } else {
                                    send(500, "Error ocurred while reading user data!");
                                }
                            })
                        })
                    } else {
                        send(500, "Error ocurred while reading user data!");
                    }
                })
            } else {
                send(500, "Error ocurred while reading users data!");
            }
        })
    } else {
        send(307, undefined, undefined, undefined, "http://localhost:3000/login");
    }
}

// Edit a document...

handlers.editDoc = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && reqData.headers.cookie.split("=")[0]) {
        let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
        if (body) {
            let documentId = typeof body.id == "string" ? body.id : false;
            let title = typeof body.title == "string" ? body.title.trim() : false;
            let main = typeof body.main == "string" ? body.main : false;
            if (documentId && title && main) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        client.db("Scribler").collection("Docs").updateOne({
                            _id: new ObjectId(documentId)
                        }, {
                            $set: {
                                title: title,
                                main: main
                            }
                        }, (err, obj) => {
                            if (!err) {
                                send();
                                client.close();
                            } else {
                                send(500, "Error ocurred while updating document!");
                                client.close();
                            }
                        })
                    } else {
                        send(500, "Error ocurred while updating document!");
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid request body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Send a friend request...

handlers.sendFriendRequest = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && reqData.headers.cookie.split("=")[0]) {
        let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
        if (body) {
            let from = typeof body.from == "string" ? body.from : false;
            let to = typeof body.to == "string" ? body.to : false;
            if (from && to) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        client.db("Scribler").collection("Users").findOne({
                            username: to
                        }, (err, data) => {
                            if (data !== null) {
                                //-------------
                                if (data !== {}) {
                                    let boo = data.activity.filter(val => {
                                        return (val.type == "friend request" && val.info.from == from)
                                    });
                                    if (boo.length === 0) {
                                        // ________________
                                        client.db("Scribler").collection("Users").updateOne({
                                            username: to
                                        }, {
                                            $push: {
                                                activity: {
                                                    type: "friend request",
                                                    info: {
                                                        from: from
                                                    }
                                                },
                                                friendRequests: {
                                                    from: from
                                                }
                                            }
                                        }, (err, obj) => {
                                            if (!err) {
                                                if (obj.acknowledged && obj.modifiedCount) {
                                                    send(200);
                                                } else {
                                                    send(400);
                                                }
                                                client.close();
                                            } else {
                                                send(500, "Error ocurred while sending friend request!");
                                                client.close();
                                            }
                                        })
                                        //_____________________
                                    } else {
                                        send(400, "over");
                                        client.close();
                                    }
                                } else {
                                    send(500, "Error ocurred while sending friend request!");
                                    client.close();
                                }
                            } else {
                                send(400, "inval");
                                client.close();
                            }
                            //--------------
                        })
                    } else {
                        send(500, "Error ocurred while sending friend request!");
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid request body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Accept a friend request...

handlers.acceptFriendRequest = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && reqData.headers.cookie.split("=")[0]) {
        let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
        if (body) {
            let from = typeof body.from == "string" ? body.from : false;
            let username = typeof body.username == "string" ? body.username : false;
            if (from && username) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        client.db("Scribler").collection("Users").updateOne({
                            username: username
                        }, {
                            $pull: {
                                friendRequests: {
                                    from: from
                                }
                            },
                            $push: {
                                friends: from
                            }
                        }, (err, obj) => {
                            if (!err) {
                                client.db("Scribler").collection("Users").updateOne({
                                    username: from
                                }, {
                                    $pull: {
                                        friendRequests: {
                                            from: from
                                        }
                                    },
                                    $push: {
                                        friends: username,
                                        activity: {
                                            type: "accepted friend request",
                                            info: {
                                                from: username
                                            }
                                        }
                                    }
                                }, (err, obj) => {
                                    if (!err) {
                                        send();
                                        client.close();
                                    } else {
                                        send(500, "Error ocurred while accepting friend request!");
                                        client.close();
                                    }
                                })
                            } else {
                                send(500, "Error ocurred while accepting friend request!");
                                client.close();
                            }
                        })
                    } else {
                        send(500, "Error ocurred while accepting friend request!!");
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid request body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Reject a friend request...

handlers.rejectFriendRequest = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && reqData.headers.cookie.split("=")[0]) {
        let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
        if (body) {
            let from = typeof body.from == "string" ? body.from : false;
            let username = typeof body.username == "string" ? body.username : false;
            if (from && username) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        client.db("Scribler").collection("Users").updateOne({
                            username: username
                        }, {
                            $pull: {
                                friendRequests: {
                                    from: from
                                }
                            }
                        }, (err, obj) => {
                            if (!err) {
                                client.db("Scribler").collection("Users").updateOne({
                                    username: from
                                }, {
                                    $pull: {
                                        friendRequests: {
                                            from: from
                                        }
                                    },
                                    $push: {
                                        activity: {
                                            type: "rejected friend request",
                                            info: {
                                                from: username
                                            }
                                        }
                                    }
                                }, (err, obj) => {
                                    if (!err) {
                                        send();
                                        client.close();
                                    } else {
                                        send(500, "Error ocurred while accepting friend request!");
                                        client.close();
                                    }
                                })
                            } else {
                                send(500, "Error ocurred while rejecting friend request!");
                                client.close();
                            }
                        })
                    } else {
                        send(500, "Error ocurred while rejecting friend request!!");
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid request body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Remove a friend...

handlers.removeFriend = (reqData, send) => {
    if (reqData.headers.cookie !== undefined && reqData.headers.cookie.split("=")[0]) {
        let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
        if (body) {
            let friend = typeof body.friend == "string" ? body.friend : false;
            let username = typeof body.username == "string" ? body.username : false;
            if (friend && username) {
                let client = new MongoClient(uri);
                client.connect((err) => {
                    if (!err) {
                        client.db("Scribler").collection("Users").updateOne({
                            username: username
                        }, {
                            $pull: {
                                friends: friend
                            }
                        }, (err, obj) => {
                            if (!err) {
                                client.db("Scribler").collection("Users").updateOne({
                                    username: friend
                                }, {
                                    $pull: {
                                        friends: username
                                    },
                                    $push: {
                                        activity: {
                                            type: "removed friend",
                                            info: {
                                                from: username
                                            }
                                        }
                                    }
                                }, (err, obj) => {
                                    if (!err) {
                                        client.db("Scribler").collection("Docs").updateMany({
                                            creator: username,
                                            owners: friend
                                        }, {
                                            $pull: {
                                                owners: friend,
                                                writers: friend
                                            }
                                        }, (err, obj) => {
                                            client.db("Scribler").collection("Docs").updateMany({
                                                creator: friend,
                                                owners: username
                                            }, {
                                                $pull: {
                                                    owners: username,
                                                    writers: username
                                                }
                                            }, (err, obj) => {
                                                send();
                                                client.close();
                                            })
                                        })
                                    } else {
                                        send(500, "Error ocurred while removing friend!!");
                                        client.close();
                                    }
                                })
                            } else {
                                send(500, "Error ocurred while removing friend!");
                                client.close();
                            }
                        })
                    } else {
                        send(500, "Error ocurred while removing friend!");
                    }
                })
            } else {
                send(400, "Missing required feilds!");
            }
        } else {
            send(400, "Missing or invalid request body!");
        }
    } else {
        send(401, "Missing or invalid session token!");
    }
}

// Share a document...

handlers.shareDocument = (reqData, send) => {
    let body = JSON.parse(reqData.body) instanceof Object ? JSON.parse(reqData.body) : false;
    if (body) {

        let documentId = typeof body.id == "string" ? body.id : false;
        let from = typeof body.from == "string" ? body.from : false;
        let to = typeof body.to == "string" ? body.to : false;
        let writable = typeof body.writable == "boolean" ? body.writable : false;

        if (to && from && documentId) {
            let client = new MongoClient(uri);
            client.connect((err) => {
                if (!err) {
                    client.db("Scribler").collection("Docs").updateOne({
                        _id: new ObjectId(documentId)
                    }, {
                        $addToSet: {
                            owners: to
                        }
                    }, (err, obj) => {
                        client.db("Scribler").collection("Users").updateOne({
                            username: to
                        }, {
                            $push: {
                                activity: {
                                    type: "sent document",
                                    info: {
                                        from: from
                                    }
                                }
                            }
                        }, (err, obj) => {
                            if (writable) {
                                client.db("Scribler").collection("Docs").updateOne({
                                    _id: new ObjectId(documentId)
                                }, {
                                    $push: {
                                        writers: to
                                    }
                                }, (err, obj) => {
                                    client.close();
                                })
                            } else {
                                client.close();
                            }
                        })
                    })
                } else {
                    send(500, "Error ocurred while sharing document");
                }
            })
        } else {
            send(400, "Missing or invalid required feilds");
        }
    } else {
        send(400, "Missing or invalid request body!");
    }
}

module.exports = handlers;
