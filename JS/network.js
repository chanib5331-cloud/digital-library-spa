class Network {
    constructor() {
        this.libraryServer = new LibraryServer();
        this.userServer = new UserServer();
        this.failureRate = 0;
    }

    setFailureRate(rate) {
        this.failureRate = Math.max(0, Math.min(100, rate));
        console.log(`הסתברות כישלון הוגדרה ל - ${this.failureRate} %`);
    }

    shouldFail() {
        return Math.random() * 100 < this.failureRate;
    }

    sendToServer(request) {
        if (this.shouldFail()) {
            console.warn(`כישלון מוגדר ברשת: ${request.method} ${request.url}`)
            return {
                status: 500,
                data: { error: "שגיאת רשת - החיבור נכשל" },
            };
        }
        try {
            if (request.url.startsWith("/users")) {
                return this.userServer.handleRequest(request);
            }
            if (
                request.url.startsWith("/books")
            ) {
                return this.libraryServer.handleRequest(request);
            }
            return {
                status: 404,
                data: { error: "נתיב לא נמצא" },
            };
        } catch (error) {
            return {
                status: 500,
                data: { error: "שגיאת שרת פנימית" },
            };
        }
    }
}