// Menu script... 

let menu = document.getElementById("menu");                             let dropdown = document.getElementById("dropdown");                                                                                             dropdown.style.display = "none";                                        dropdown.style.opacity = "1";                                                                                                                   menu.onclick = () => {                                                   if (dropdown.style.display == "block") {                                    dropdown.style.opacity = "0";                                               setTimeout(() => {                                                       dropdown.style.display = "none";                                       },200);                                                         } else {                                                                 dropdown.style.display = "block";                                       dropdown.style.opacity = "1";                                          }                                                                      }

document.getElementById("logout").onclick = () => {
 document.cookie = "sessionId= ; expires=Jan, 18 Dec 2003 12:00:00 UTC";
}

