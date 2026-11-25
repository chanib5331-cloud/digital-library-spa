class LibraryServer {
    constructor() {
        this.db = new LibraryDb();
    }

    handleRequest(request) {
        const { method, url, data } = request;
        const urlParts = url.split("/").filter((part) => part);

        try {
            switch (method) {
                case "GET":
                    return this.handleGet(urlParts, url);
                case "POST":
                    return this.handlePost(urlParts, data);
                case "DELETE":
                    if (urlParts[1] === "return" && urlParts[2] && urlParts[3]) {
                        return this.returnBook(urlParts);
                    }
                    return { status: 404, data: { error: "נתיב לא נמצא" } };
                default:
                    return { status: 405, data: { error: "Method not allowed" } };
            }
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

   
    handleGet(urlParts, url) {
        try {
            if (urlParts[1] === "all") {
                const books = this.db.getAllBooks();
                return { status: 200, data: books || [] };
            }

            if (urlParts[1] === "user" && urlParts[2]) {
                const userMail = decodeURIComponent(urlParts[2]);
                const result = this.db.getMyBooks(userMail);
                return { status: 200, data: result };
            }

            if (urlParts[1] === "filter" || url.includes('/books/filter')) {
                return this.handleFilter(urlParts, url);
            }

            return { status: 404, data: { error: "נתיב לא נמצא" } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    handlePost(urlParts, data) {
        try {
            if (urlParts[1] === "borrow") {
                return this.borrowBook(data);
            }

            if (urlParts[1] === "recommend") {
                return this.recommendBook(data);
            }

            return { status: 404, data: { error: "נתיב לא נמצא" } };
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    borrowBook(data) {
        try {
            if (!data || !data.bookId || !data.userMail) {
                return { status: 400, data: { error: "זיהוי ספר ומשתמש חובה" } };
            }
            
            const result = this.db.borrowBook(data.bookId, data.userMail);
            if (result.success) {
                return { status: 200, data: { message: result.message } };
            } else {
                return { status: 400, data: { error: result.message } };
            }
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    
    recommendBook(data) {
        try {
            if (!data || !data.title || !data.author || !data.recommendedBy) {
                return { status: 400, data: { error: "כל השדות חובה" } };
            }

            const bookData = {
                title: data.title,
                author: data.author,
                genre: data.genre || "כללי",
                age_group: data.age_group || "מבוגרים",
                recommendedBy: data.recommendedBy
            };

            const result = this.db.recommendBook(bookData);
            if (result.success) {
                return {
                    status: 200,
                    data: { message: result.message },
                };
            } else {
                return {
                    status: 400,
                    data: { error: result.message },
                };
            }
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    handleFilter(urlParts, originalUrl) {
        try {
            const queryString = originalUrl.split('?')[1] || '';
            const params = new URLSearchParams(queryString);
            
            const searchTerm = params.get('search') || '';
            const genre = params.get('genre') || '';
            const ageGroup = params.get('age') || '';
            
            let books = this.db.getAllBooks();
            
            if (searchTerm) {
                books = books.filter(book => 
                    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            if (genre) {
                books = books.filter(book => book.genre === genre);
            }
            
            if (ageGroup) {
                books = books.filter(book => book.age_group === ageGroup);
            }
            
            return { status: 200, data: books };
            
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }
    
    returnBook(urlParts) {
        try {
            const userMail = decodeURIComponent(urlParts[2]);
            const bookId = decodeURIComponent(urlParts[3]);

            if (!bookId || !userMail) {
                return { status: 400, data: { error: "זיהוי ספר ומשתמש חובה" } };
            }

            const result = this.db.returnBook(bookId, userMail);
            if (result.success) {
                return { status: 200, data: { message: result.message } };
            } else {
                return { status: 400, data: { error: result.message } };
            }
        } catch (error) {
            return { status: 500, data: { error: error.message } };
        }
    }

    
}
