class userDb {
    getClientDetails(clientMail) {
        try {
            const allClients = localStorage.getItem("users");
            if (!allClients) return null;
            const jsonAllClients = JSON.parse(allClients);
            const currentClient = jsonAllClients.find(item => item.mail == clientMail);
            return currentClient;
        } catch (error) {
            throw new Error(`נכשל בלהחזיר פרטים: ${error.message}`);
        }
    }

    addClient(clientToAdd) {
        try {
            const allClients = localStorage.getItem("users");
            const jsonAllClients = JSON.parse(allClients || '[]');
            jsonAllClients.push(clientToAdd);
            localStorage.setItem("users", JSON.stringify(jsonAllClients));
            return { success: true, message: "ההרשמה בוצעה בהצלחה" };
        } catch (error) {
            return { success: false, message: `נכשל להוסיף משתמש: ${error.message}` };
        }
    }

    updateClientDetails(mail, clientDetails) {
        try {
            const allClients = localStorage.getItem("users");
            const jsonAllClients = JSON.parse(allClients);
            const clientIndex = jsonAllClients.findIndex(item => item.mail == mail);
            if (clientIndex === -1) {
                return { success: false, message: "משתמש לא נמצא" };
            }
            jsonAllClients[clientIndex] = clientDetails;
            localStorage.setItem("users", JSON.stringify(jsonAllClients));
            return { success: true, message: "פרטים עודכנו בהצלחה" };
        } catch (error) {
            return { success: false, message: `נכשל לעדכן פרטי משתמש: ${error.message}` };
        }
    }
}