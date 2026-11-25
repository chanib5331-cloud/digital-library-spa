class Client {

    constructor(userName, mail, password, numOfChildren) {
        this.userName = userName;
        this.mail = mail;
        this.password = password;
        this.numOfChildren = numOfChildren;
    }



    login(email, password) {
        try {
            const request = new FXMLHttpRequest(globalNetwork);
            request.open("POST", "/users/login");
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    hideLoading();
                    if (request.status == 200) {
                        const user = JSON.parse(request.responseText);
                        setCurrentUser(user);

                        setMessage(`🎉 ברוך הבא ${user.userName}! שמחים שחזרת 📚`, "success");
                        showTemplate('catalog');

                        setTimeout(() => {
                            const welcomeMsg = document.getElementById('welcomeMessage');
                           
                                welcomeMsg.innerHTML = `🎉 ברוך הבא ${user.userName}! שמחים שחזרת 📚`;
                            
                        }, 300);
                        return true;
                    } else {
                        const error = JSON.parse(request.responseText);
                        setMessage(error.error, "error");
                    }
                }
            };
            const loginData = { mail: email, password: password };
            request.send(JSON.stringify(loginData));
        } catch (error) {
            setMessage(error.message, "error");
            hideLoading();
        }
    }

    register() {
        try {
            const request = new FXMLHttpRequest(globalNetwork);
            request.open("POST", "/users/register");
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    hideLoading();
                    if (request.status == 200) {
                        const response = JSON.parse(request.responseText);
                        setMessage(`ברוך הבא ${this.userName}! הרשמה הושלמה בהצלחה!`, "success");
                        setTimeout(() => {
                            showTemplate('login');
                            setTimeout(() => {
                                document.getElementById('loginEmail').value = this.mail;
                            }, 200);
                            setMessage('עכשיו אתה יכול להתחבר עם הפרטים שלך', 'info');
                        }, 2500);
                        return true;
                    } else {
                        const error = JSON.parse(request.responseText);
                        setMessage(error.error, "error");
                    }
                }
            };
            const user = {
                userName: this.userName,
                mail: this.mail,
                password: this.password,
                numOfChildren: this.numOfChildren
            }
            request.send(JSON.stringify(user));
        } catch (error) {
            setMessage(error.message, "error");
            hideLoading();
        }
    }

    update() {
        try {
            const request = new FXMLHttpRequest(globalNetwork);
            request.open("PUT", `/users/update/${this.mail}`);
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    hideLoading();
                    if (request.status == 200) {
                        const updatedUser = {
                            userName: this.userName,
                            mail: this.mail,
                            password: this.password,
                            numOfChildren: this.numOfChildren
                        };
                        setCurrentUser(updatedUser);
                        const message = "פרטים עודכנו בהצלחה!";
                        setMessage(message, "success");
                        showTemplate('catalog');
                        return true;
                    } else {
                        const error = JSON.parse(request.responseText);
                        setMessage(error.error , "error");
                    }
                }
            };
            const user = {
                userName: this.userName,
                mail: this.mail,
                password: this.password,
                numOfChildren: this.numOfChildren
            };
            request.send(JSON.stringify(user));
        } catch(error) {
            setMessage(error.message, "error");
            hideLoading();
        }
    }
}
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch (error) {
        setMessage("שגיאה בקבלת פרטי משתמש", "error");
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem("currentUser", JSON.stringify(user));
        setMessage("פרטי משתמש נשמרו בהצלחה", "success");
    } catch (error) {
        setMessage("שגיאה בשמירת פרטי משתמש", "error");
    }
}

function logoutUser() {
    try {
        localStorage.removeItem("currentUser");
        setMessage("התנתקת בהצלחה", "success");
    } catch (error) {
        setMessage("שגיאה בהתנתקות", "error");
    }
}

