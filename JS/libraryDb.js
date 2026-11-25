class LibraryDb {
    constructor() {
        this.booksKey = 'books';
    }

    getAllBooks() {
        const books = JSON.parse(localStorage.getItem(this.booksKey) || '[]');
        const myBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
        
        const updatedBooks = books.map(book => {
            const isBorrowed = myBooks.some(userBooks => 
                userBooks.borrowedBookIds && userBooks.borrowedBookIds.includes(book.id)
            );
            return { ...book, isBorrowed };
        });
        
        const sortedBooks = updatedBooks.sort((a, b) => {
            if (a.isRecommended && !b.isRecommended) return -1;
            if (!a.isRecommended && b.isRecommended) return 1;
            return 0;
        });
        
        return sortedBooks;
    }




    getCurrentBorrowsCount(userMail) {
        const borrows = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const userBorrows = borrows.find(borrow => borrow.mail === userMail);
        return userBorrows && userBorrows.borrowedBookIds
            ? userBorrows.borrowedBookIds.length
            : 0;
    }



    getMyBooks(userMail) {
        if (!userMail) {
            return { books: [], message: "לא נמצא משתמש" };
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.mail === userMail);
        if (!currentUser) {
            return { books: [], message: "משתמש לא נמצא" };
        }
        
        const maxBooks = parseInt(currentUser.numOfChildren || 0) + 2;
        const borrows = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const userBorrows = borrows.find(borrow => borrow.mail === userMail);

        if (!userBorrows || !userBorrows.borrowedBookIds || userBorrows.borrowedBookIds.length === 0) {
            return { 
                books: [], 
                message: `אין ספרים מושאלים - אתה יכול להשאיל עד ${maxBooks} ספרים` 
            };
        }

        const allBooks = JSON.parse(localStorage.getItem(this.booksKey) || '[]');
        const myBooks = userBorrows.borrowedBookIds.map(bookId =>
            allBooks.find(book => book.id === bookId)
        ).filter(book => book); // סינון null values
        
        const remaining = maxBooks - myBooks.length;
        return {
            books: myBooks,
            message: `יש לך ${myBooks.length} ספרים מתוך ${maxBooks} אפשריים (נותרו ${remaining} מקומות)`
        };
    }

    returnBook(bookId, userMail) {
        if (!userMail || !bookId) {
            return { success: false, message: "זיהוי ספר ומשתמש חובה" };
        }

        const borrows = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const userBorrowsIndex = borrows.findIndex(borrow => borrow.mail === userMail);
        
        if (userBorrowsIndex === -1) {
            return { success: false, message: "לא נמצאו ספרים מושאלים למשתמש" };
        }

        const bookIndex = borrows[userBorrowsIndex].borrowedBookIds.indexOf(bookId);
        if (bookIndex === -1) {
            return { success: false, message: "ספר לא נמצא ברשימת הספרים שלך" };
        }

        borrows[userBorrowsIndex].borrowedBookIds.splice(bookIndex, 1);
        localStorage.setItem('myBooks', JSON.stringify(borrows));

        return { success: true, message: "ספר הוחזר בהצלחה!" };
    }

    borrowBook(bookId, userMail) {
        if (!userMail || !bookId) {
            return { success: false, message: "זיהוי ספר ומשתמש חובה" };
        }

        // בדיקת מכסה
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.mail === userMail);
        if (!currentUser) {
            return { success: false, message: "משתמש לא נמצא" };
        }
        
        const maxBooks = parseInt(currentUser.numOfChildren || 0) + 2;
        const currentBorrows = this.getCurrentBorrowsCount(userMail);
        
        if (currentBorrows >= maxBooks) {
            return { success: false, message: `הגעת למכסה שלך! אתה יכול להשאיל עד ${maxBooks} ספרים` };
        }

        const books = JSON.parse(localStorage.getItem(this.booksKey) || '[]');
        const bookToBorrow = books.find(book => book.id === bookId);
        
        if (!bookToBorrow) {
            return { success: false, message: "ספר לא נמצא" };
        }

        // בדיקה אם הספר כבר מושאל
        const borrows = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const userBorrows = borrows.find(borrow => borrow.mail === userMail);
        if (userBorrows && userBorrows.borrowedBookIds.includes(bookId)) {
            return { success: false, message: "הספר כבר מושאל לך" };
        }
        
        // בדיקה אם הספר מושאל למישהו אחר
        const isBookBorrowed = borrows.some(userBooks => 
            userBooks.borrowedBookIds && userBooks.borrowedBookIds.includes(bookId)
        );
        
        if (isBookBorrowed) {
            return { success: false, message: "הספר כבר מושאל למשתמש אחר" };
        }

        let userBorrowsIndex = borrows.findIndex(borrow => borrow.mail === userMail);

        if (userBorrowsIndex === -1) {
            borrows.push({
                mail: userMail,
                borrowedBookIds: []
            });
            userBorrowsIndex = borrows.length - 1;
        }
        
        borrows[userBorrowsIndex].borrowedBookIds.push(bookId);
        localStorage.setItem('myBooks', JSON.stringify(borrows));

        const remaining = maxBooks - (currentBorrows + 1);
        return { success: true, message: `ספר הושאל בהצלחה! נותרו לך ${remaining} מקומות` };
    }

    
    recommendBook(bookData) {
        if (!bookData || !bookData.title || !bookData.author) {
            return { success: false, message: "שם ספר ומחבר חובה" };
        }

        const books = JSON.parse(localStorage.getItem(this.booksKey) || '[]');
        const existingBook = books.find(book =>
            book.title.toLowerCase() === bookData.title.toLowerCase() &&
            book.author.toLowerCase() === bookData.author.toLowerCase()
        );

        if (existingBook) {
            return { success: false, message: "ספר עם שם ומחבר זה כבר קיים במערכת" };
        }

        const newId = 'b' + (books.length + 1);
        const newBook = {
            id: newId,
            title: bookData.title,
            author: bookData.author,
            genre: bookData.genre || 'כללי',
            age_group: bookData.age_group || 'מבוגרים',
            isBorrowed: false,
            isRecommended: true,
            recommendedBy: bookData.recommendedBy
        };

        books.push(newBook);
        localStorage.setItem(this.booksKey, JSON.stringify(books));

        return { success: true, message: "הספר נוסף בהצלחה לספרייה!" };
    }

}

