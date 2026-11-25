class UserServer {
    constructor() {
        this.db = new userDb();
    }
    handleRequest(myRequest) {
        const{ method, url, data } = myRequest;
        switch(method){
         case "POST":
            return this.handlePostRequest(url, data);
         case "PUT": 
          if (url.startsWith("/users/update")) {
                    const mail = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1));
                    try {
                        const result = this.db.updateClientDetails(mail, data);
                        if (result.success) {
                            return { status: 200, data: result.message };
                        } else {
                            return { status: 400, data: { error: result.message } };
                        }
                    } catch (error) {
                        return { status: 500, data: { error: "שגיאה פנימית בשרת" } };
                    }
                }  
                 return { status: 404, data: { error: "לא נמצא נתיב מתאים" } };
        default:
            return { status: 405, data: { error: "שיטה לא נתמכת" } };
        }
        } 
        
    handlePostRequest(url, data) {
        if(url === "/users/register") {
            try {
                const existingClient = this.db.getClientDetails(data.mail);
                if(existingClient) {
                    return { status: 409, data: { error: "משתמש עם כתובת מייל זו כבר קיים" } };
                }
                const result = this.db.addClient(data);
                if (result.success) {
                    return { status: 200, data: { message: result.message } };
                } else {
                    return { status: 400, data: { error: result.message } };
                }
            } catch (error) {
                return { status: 500, data: { error: "בעיה פנימית בשרת" } };
            }

        } else if (url === "/users/login") {
            try {
                const client = this.db.getClientDetails(data.mail);
                if (client && client.password === data.password) {
                    return { status: 200, data: client };
                } else if(client && client.password !== data.password) {
                    return { status: 401, data: { error: "סיסמה שגויה" } };
                } else {
                    return { status: 401, data: { error: "משתמש לא קיים" } };
                }
            } catch (error) {
                return { status: 500, data: { error: "בעיה פנימית בשרת" } };
            }
        }
        
        return { status: 404, data: { error: "נתיב לא נמצא" } };
    }
}