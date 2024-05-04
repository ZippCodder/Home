
import "../styles/styles.css"; 
import "../styles/friends.css";
import "../styles/docs.css";

 const username = document.getElementById("username").getAttribute("data-username");

 let select = document.querySelector("#share").getElementsByTagName("select")[0];
 for (let i of userData.documents) {
     let option = document.createElement("option");
     option.innerHTML = i.title;
     option.setAttribute("data-id", i._id);
     select.appendChild(option);
 }

 render(userData.friends.reverse(), userData.friendRequests.reverse());

 function render(friends, requests) {
     let container = document.querySelector("#friends");
     if (requests.length > 0 || friends.length > 0) {
         document.querySelector(".dashboard__empty-message").style.display = "none";
     }

     for (let x of requests) {
         let request = document.createElement("div");
         let options = document.createElement("div");
         let acc = document.createElement("i");
         acc.setAttribute("class", "fas fa-check");
         acc.addEventListener("click", () => {
             acceptRequest(userData.username, x.from);
             createFriend(x.from, acc.parentElement.parentElement);
             toggleMessage(`Added ${x.from} as a friend!`);
         });
         options.appendChild(acc);
         let dec = document.createElement("i");
         dec.setAttribute("class", "fas fa-times");
         dec.addEventListener("click", () => {
             rejectRequest(userData.username, x.from);
             container.removeChild(dec.parentElement.parentElement);
             if (container.children.length == 2) {
                 document.querySelector(".dashboard__empty-message").style.display = "block";
             }
             toggleMessage(`Rejected friend request from ${x.from}.`, false);
         });
         options.appendChild(dec);
         request.setAttribute("class", "request fr");
         let main = document.createElement("p");
         main.innerHTML = "Friend request from <b>" + x.from + "</b>";
         request.appendChild(main);
         request.appendChild(options);
         container.appendChild(request);
     }

     for (let i of friends) {
         createFriend(i);
     }
 }

 function showRequest() {
     document.querySelector("#request").style.display = "flex";
 }

 function showShare() {
     document.querySelector("#share").style.display = "flex";
 }

 function hideShare() {
     document.querySelector("#share").style.display = "none";
 }

 function hideRequest() {
     document.querySelector("#request").style.display = "none";
 }

 function sendDocument(to, from) {
     hideShare();
     let select = document.querySelector("#share").getElementsByTagName("select")[0];
     let id = select.childNodes[select.selectedIndex].getAttribute("data-id");

     toggleMessage("Document successfully shared!");

     fetch("http://localhost:3000/users/share", {
         method: "POST",
         body: JSON.stringify({
             from: from,
             to: to,
             id: id,
             writable: document.querySelector("#share").getElementsByTagName("input")[0].checked
         })
     });
 }

 function createFriend(username, parent) {
     let container = document.querySelector("#friends");

     let request = document.createElement("div");
     let options = document.createElement("div");
     let acc = document.createElement("i");
     acc.setAttribute("class", "fas fa-paper-plane");
     acc.addEventListener("click", () => {
         if (userData.documents.length > 0) {
             document.querySelector("#docshare").onclick = () => {
                 sendDocument(username, userData.username);
             }
             showShare();
         } else {
             toggleMessage("You have no documents to share!", false);
         }
     })
     options.appendChild(acc);
     let dec = document.createElement("i");
     dec.setAttribute("class", "fas fa-user-times");
     dec.addEventListener("click", () => {
         if (window.confirm("Remove " + username + " from friends?")) {
             removeFriend(userData.username, username);
             container.removeChild(dec.parentElement.parentElement);
             if (container.children.length == 2) {
                 document.querySelector(".dashboard__empty-message").style.display = "block";
             }
             toggleMessage(`Successfully removed ${username} from friends.`);
         }
     });
     options.appendChild(dec);
     request.setAttribute("class", "request fri");
     let main = document.createElement("p");
     main.innerHTML = "<b>" + username + "</b>";
     request.appendChild(main);
     request.appendChild(options);
     if (parent == undefined) {
         container.appendChild(request);
     } else {
         container.replaceChild(request, parent);
     }
 }

 function acceptRequest(username, from) {
     fetch("http://localhost:3000/users/accept", {
         method: "POST",
         body: JSON.stringify({
             username: username,
             from: from
         })
     })
 }

 function rejectRequest(username, from) {
     fetch("http://localhost:3000/users/reject", {
         method: "POST",
         body: JSON.stringify({
             username: username,
             from: from
         })
     })
 }

 function sendRequest(from, to) {
     if (!userData.friends.includes(to)) {
         fetch("http://localhost:3000/users/request", {
             method: "POST",
             body: JSON.stringify({
                 from: from,
                 to: to
             })
         }).then(res => {
             if (res.status == 200) {
                 toggleMessage("You sent a friend request to " + to);
                 hideRequest();
             } else {
                 res.text().then(text => {
                     if (text == "over") {
                         toggleMessage("You already sent a friend request to " + to + "!", false);
                     } else {
                         toggleMessage("Please enter a valid username!", false);
                     }
                 })
             }
         })
     } else {
         toggleMessage("You already sent a friend request to " + to + "!", false);
     }
 }

 function removeFriend(username, friend) {
     fetch("http://localhost:3000/users/remove", {
         method: "POST",
         body: JSON.stringify({
             username: username,
             friend: friend
         })
     })
 }

 document.querySelector(".hide-share").onclick = hideShare;
 document.querySelector(".show-request").onclick = showRequest;
 document.querySelectorAll(".hide-request").forEach(v => {
   v.onclick = hideRequest;
 });

 document.querySelector("#submit").addEventListener("click", () => {
     sendRequest(username, document.querySelector("#user-search").value);
 });
