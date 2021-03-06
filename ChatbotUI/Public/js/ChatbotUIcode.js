//links
//http://eloquentjavascript.net/09_regexp.html
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
nlp = window.nlp_compromise;
var DEBUG = false;
var messages = [], //array that hold the record of each string in chat
    lastUserMessage = "", //keeps track of the most recent input string from the user
    botMessage = "", //var keeps track of what the chatbot is going to say
    botName = 'FoodyBot', //name of the chatbot
    users = ['Marios', 'Andri', 'Kotsios', 'Mary', 'Mark', 'Andreas'],
    currentUser = 'Marios',
    conversationID = "",
    token = 0,
    talking = false, //when false the speach function doesn't work
    d = new Date(),
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The hello message from the chatbot to the user
$(document).ready(function () {
    document.getElementById("chatbox").disabled = false;
    currentUser = users[Math.floor(Math.random() * 6)];
    botMessage = "Hello " + currentUser + "! I'm FoodyBot! Please enter one of the following:" +
        "<br />\"souvlakia\". To find a specific restaurant which contains souvlakia." +
        "<br />\"burger\". To find a specific restaurant which contains burgers." +
        "<br />\"sandwich\". To find a specific restaurant which contains sandwiches." +
        "<br />\"to anamma\". To find specific items from the restaurant TO ANAMMA." +
        "<br />\"help\". For help on what to type in." +
        "<br />..." +
        "<br />Please enter one of the above choices.";

    d = new Date();
    botMessage = "<b>" + botName + ":</b> " +
        "<span id='chattimestamp'>" + days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</span>" +
        "<p>" + botMessage + "</p>";

    //add the chatbot's name and message to the array messages
    messages.push(botMessage);

    // CONVERSATION INITIALIZATION
    var jsonReqBody = {
        'username': currentUser,
        'timestamp': d.getTime()
    };
    // GET USER TOKEN
    $.post("http://localhost:4567/init",
        jsonReqBody,
        function (data, status) {
            token = data.token;
            conversationID = data.convid;
            var isRecover = data.user_already_in_db;

            if (isRecover) {
                var msgsReceived = data.messages_retrieved;
                if (DEBUG) {
                    console.log("The msgReceived: ");
                    console.log(msgsReceived);
                    console.log(msgsReceived[0]);
                    //console.log(msgsReceived[0].is_user_msg)
                }
                for (var i = 0; i < msgsReceived.length; i++) {
                    var d1 = new Date(1000*msgsReceived[i].time_stamp);
                    if (msgsReceived[i]['is_user_msg'] == 1) {
                        // VIEW THE MESSAGE IN THE USER INTERFACE
                        $('#chatborder').append('<ul class="bubble1" >' + msgsReceived[i]['content'] + '</ul>');
                        $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);
                    }
                    else {
                        $('#chatborder').append('<ul class="bubble2" >' + msgsReceived[i]['content'] + '</ul>');
                        $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);

                        // var msgres = "<b>" + botName + ":</b> " +
                        //     "<span id='chattimestamp'>" + days[d1.getDay()] + " at " + d1.getHours() + ":" + d1.getMinutes() + ":" + d1.getSeconds() + "</span>" +
                        //     "<p>" + msgsReceived[i]['content'] + "</p>";
                        // $('#chatborder').append('<ul class="bubble2" >' + msgres + '</ul>');
                        // $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);
                    }
                }
            }

            //TODO
            // CURRENT USER SIGNED IN
            $('#userlist').append("<div id='currusertoken'>" + "<b>" + "Current user signed in token: " + "</b> " + token + "</div>");
            $('#userlist').append("<div id='currusername'>" + "<b>" + "Current username: " + "</b> " + currentUser + "</div>");
            if (DEBUG) {
                console.log("The token received from server is " + token);
                console.log("THE CURRENT CONV ID IS : " + conversationID);
            }
            //chatResponse(data);
        });

    // says the message using the text to speech function written below
    Speech(botMessage);
    $('#chatborder').append('<ul class="bubble2" >' + messages[0] + '</ul>');
    $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);
});

// WHEN SEND BTN IS PRESSED
$(document).ready(function () {
    $("#sendbtn").click(function () {
            console.log(lastUserMessage);
            newEntry();
        }
    );
});

function newEntry() {
    document.getElementById("chatbox").disabled = false;
//if the message from the user isn't empty then run
    if (document.getElementById("chatbox").value != "") {
        //pulls the value from the chatbox ands sets it to lastUserMessage
        lastUserMessage = document.getElementById("chatbox").value;
        //sets the chat box to be clear
        document.getElementById("chatbox").value = "";

        //adds the value of the chatbox to the array messages
        //with current time
        d = new Date();
        var usrmessage = "<b>" + currentUser + ":</b> " +
            "<span id='chattimestamp'>" + days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</span>" +
            "<p>" + lastUserMessage + "</p>";
        messages.push(usrmessage);

        // VIEW THE MESSAGE IN THE USER INTERFACE
        $('#chatborder').append('<ul class="bubble1" >' + messages[messages.length - 1] + '</ul>');

        var jsonReqBody = {
            'token': token,
            'convid': conversationID,
            'usrmsg': lastUserMessage,
            'msgtostore': usrmessage,
            'timestamp': d.getTime()
        };
        $.post("http://localhost:4567/getmsg",
            jsonReqBody,
            function (data, status) {
                if (DEBUG) {
                    console.log("The json object response received from the server is ");
                    console.log(data);
                }
                chatResponse(data.responsemsg);
            });
    }
}

function chatResponse(data) {
    //alert("Data: " + data + "\nStatus: " + status);
    console.log(data);

    //SET THE CHATBOT RESPONSE MESSAGE WITH THE CORRECT FORMAT FROM THE API RESPONSE
    // FROM JAVA TO HTML
    if (!botMessage) botMessage = "i'm confused";
    botMessage = data.replace(/(?:\r\n|\r|\n)/g, '<br />');

    //add the chatbot's name and message to the array messages
    d = new Date();

    // says the message using the text to speech function written below
    Speech(botMessage);

    botMessage="<b>" + botName + ":</b> " +
        "<span id='chattimestamp'>" + days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</span>" +
        "<p>" + botMessage + "</p>" ;
    messages.push(botMessage);

    var jsonReqBody = {
        'token': token,
        'convid': conversationID,
        'responsemsg': botMessage,
        'timestamp': d.getTime()
    };
    $.post("http://localhost:4567/sendresp",
        jsonReqBody,
        function (data, status) {
            if (DEBUG) {
                alert("RESPONSE SENT");
            }
        });
//TODO
    //outputs the last few array elements of messages to html
    $('#chatborder').append('<ul class="bubble2" >' + messages[messages.length - 1] + '</ul>');
    $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);
    console.log(messages.toString());
}

//runs the keypress() function when a key is pressed
document.onkeypress = keyPress;

//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
    var x = e || window.event;
    var key = (x.keyCode || x.which);
    if (key == 13 || key == 3) {
        console.log(lastUserMessage);
        //runs this function when enter is pressed
        newEntry();
    }
    if (key == 38) {
        console.log('hi')
        //document.getElementById("chatbox").value = lastUserMessage;
    }
}

// THE POST REQUEST AND RESPONSE FOR A SELECTION OF A RESTAURANT
function sendId(id) {
    //alert(id);
    d = new Date();
    var storedMsg = "<b>" + currentUser + ":</b> " +
        "<span id='chattimestamp'>" + days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</span>" +
        "<p>" + "Order from restaurant with ID: " + id + "</p>";
    var jsonReqBody = {
        'token': token,
        'convid': conversationID,
        'usrmsg': "usr_selection res_id=" + id,
        'msgtostore': storedMsg,
        'timestamp': d.getTime()
    };
    $.post("http://localhost:4567/getmsg",
        jsonReqBody,
        function (data, status) {

            if (DEBUG) {
                alert("usr_selection res_id=" + id);
                console.log(data);
            }

            document.getElementById("chatbox").disabled = true;
            chatResponse(data.responsemsg);

        });
    document.getElementById("chatbox").disabled = false;

    // THE SELECTED RESTAURANT
    if (DEBUG) {
        alert(document.getElementById("clickable-rest-" + id).innerText);
    }
}


var selectedItems = [],
    selItemsIDs = [],
    items = [],
    itemNumber = [];

// THE POST REQUEST AND RESPONSE FOR A SELECTION OF A RESTAURANT
function sendMenuItemId(id) {
    $('#basket').empty();
    if (DEBUG) {
        alert(id);
    }

    if (selectedItems.length == 0) {
        $('#chatborder').append('<ul class="bubble2">' +
            '<button id=\"submitbtn\" onclick=\"sendMenuSelection()\">SUBMIT</button>' +
            '</ul>');
        $('#chatborder').scrollTop($('#chatborder')[0].scrollHeight);
    }

    selectedItems.push("usr_menu mi_id=" + id);

    if (DEBUG) {
        alert("Item: " + document.getElementById("clickable-mi-" + id).innerText + " ADDED TO BASKET!");
    }

    selItemsIDs.push(id);

    [items, itemNumber] = countItems(selItemsIDs);
    for (var i = 0; i < items.length; i++) {
        $('#basket').append('<li class="item" >' +
            itemNumber[i] + " x " + document.getElementById("clickable-mi-" + items[i]).innerText + '</li>');
        $('#basket').scrollTop($('#basket')[0].scrollHeight);
    }

    // AVOID DUPLICATES
    // if(selectedItems.length ==0){
    //     selectedItems.push("usr_selection mi_id="+id);
    // }
    // var tf = true , i;
    // for(i=0; i<selectedItems.length; i++){
    //     if(selectedItems[i] == ("usr_selection mi_id="+id)){
    //         alert("ERROR! You already entered that item!");
    //         tf = false;
    //         break;
    //     }
    // }
    // if(tf){
    //     selectedItems.push("usr_selection mi_id="+id);
    // }
    // var s = "";
    // for(i=0; i<selectedItems.length; i++){
    //     s.append(selectedItems[i]);
    // }
    // alert(s);
}

function sendMenuSelection() {
    //TODO
    // alert("OK");
    // alert(itemNumber.toString());
    // alert(items.toString());

    var strItems = "<ul class=\"item\" >The items you have selected for your order are:";
    for (var i = 0; i < itemNumber.length; i++)
        strItems = strItems + "<li>" + itemNumber[i] + " x " + document.getElementById("clickable-mi-" + items[i]).innerText + "</li> \n";
    strItems += "</ul>";
    console.log(strItems);
    chatResponse(strItems);
    if(DEBUG)
        alert(selectedItems.toString());
    d = new Date();
    var jsonReqBody = {
        'token': token,
        'convid': conversationID,
        'usrmsg': selectedItems.join(" ").toString(),
        'msgtostore': botMessage,
        'timestamp': d.getTime()
    };
    $.post("http://localhost:4567/getmsg",
        jsonReqBody,
        function (data, status) {
            document.getElementById("chatbox").disabled = false;
            chatResponse(data.responsemsg);
        });
    console.log(lastUserMessage);
}

//-------------------------------------------------------
// USEFUL FUNCTIONS:
//-------------------------------------------------------
/**
 * TOGGLE FOR THE VIEW BASKET
 */
function toggle() {
    var x = document.getElementById("product-list");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

//text to Speech
//https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API
function Speech(say) {
    if ('speechSynthesis' in window && talking) {
        var utterance = new SpeechSynthesisUtterance(say);
        //msg.voice = voices[1]; // Note: some voices don't support altering params
        //utterance.voiceURI = 'native';
        //utterance.volume = 1; // 0 to 1
        //utterance.rate = 0.1; // 0.1 to 10
        //utterance.pitch = 1; //0 to 2
        //utterance.text = 'Hello World';
        //utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
}

/**
 * Used to count the number of items in the basket individually
 * @param arr
 * @returns {[null,null]}
 */
function countItems(arr) {
    var a = [], b = [], prev;
    arr.sort();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== prev) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length - 1]++;
        }
        prev = arr[i];
    }
    return [a, b];
}

//clears the placeholder text ion the chatbox
//this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder() {
    document.getElementById("chatbox").placeholder = "";
}

// PREVENTS REFRESHING WHEN PRESSING ENTER
$(function () {
    $("form").submit(function () {
        return false;
    });
});
