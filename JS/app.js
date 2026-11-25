const globalNetwork = new Network();

function setMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    messageContainer.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 6000);
}

function showLoading(text = 'טוען...') {
    const spinner = document.getElementById('loadingSpinner');
    const loadingText = document.getElementById('loadingText');
        loadingText.textContent = text;
        spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = 'none';
}

function loadBooks() {
    showLoading('טוען ספרים...');
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    request.open('GET', '/books/all');
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const books = JSON.parse(request.responseText);
                displayBooks(books, 'booksGrid');
                setMessage("ספרים נטענו בהצלחה", "success");
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בטעינת ספרים", "error");
            }
        }
    };
    request.send();
}

function loadMyBooks(userMail) {
    showLoading('טוען הספרים שלי...');
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    request.open('GET', `/books/user/${userMail}`);
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                displayBooks(response.books, 'myBooksGrid', true);
                setMessage(response.message, "info");
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בטעינת הספרים שלי", "error");
            }
        }
    };
    request.send();
}

function borrowBookWithUser(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        setMessage("יש להתחבר תחילה", "error");
        return;
    }
    
    showLoading('משאיל ספר...');
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    request.open('POST', '/books/borrow');
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                setMessage(response.message, "success");
                loadBooks();
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בהשאלת ספר", "error");
            }
        }
    };
    
    const borrowData = {
        userMail: currentUser.mail,
        bookId: bookId
    };
    request.send(JSON.stringify(borrowData));
}

function returnBookWithUser(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        setMessage("יש להתחבר תחילה", "error");
        return;
    }
    
    showLoading('מחזיר ספר...');
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    request.open('DELETE', `/books/return/${encodeURIComponent(currentUser.mail)}/${bookId}`);
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                setMessage(response.message, "success");
                loadMyBooks(currentUser.mail);
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בהחזרת ספר", "error");
            }
        }
    };
    
    request.send();
}

function filterBooks() {
    showLoading('מסנן ספרים...');
    
    const searchTerm = document.getElementById('searchInput')?.value.trim() || '';
    const genreFilter = document.getElementById('genreFilter')?.value || '';
    const ageFilter = document.getElementById('ageFilter')?.value || '';
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (genreFilter) params.append('genre', genreFilter);
    if (ageFilter) params.append('age', ageFilter);
    
    const url = `/books/filter?${params.toString()}`;
    
    request.open('GET', url);
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const books = JSON.parse(request.responseText);
                displayBooks(books, 'booksGrid');
                setMessage(`נמצאו ${books.length} ספרים`, "success");
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בסינון ספרים", "error");
            }
        }
    };
    
    request.send();
}

function handleRecommendation(title, author, genre, ageGroup) {
    if (!title || !author) {
        setMessage("אנא מלא לפחות שם ספר ומחבר", "error");
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        setMessage("יש להתחבר תחילה", "error");
        return;
    }
    
    showLoading('מוסיף ספר לספרייה...');
    
    const request = new FXMLHttpRequest(globalNetwork);
    
    request.open('POST', '/books/recommend');
    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            hideLoading();
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                setMessage(response.message, "success");
                showTemplate('catalog');
            } else {
                const error = JSON.parse(request.responseText);
                setMessage(error.error || "שגיאה בהמלצת ספר", "error");
            }
        }
    };
    
    const recommendData = {
        title: title,
        author: author,
        genre: genre || 'כללי',
        age_group: ageGroup || 'מבוגרים',
        recommendedBy: currentUser.mail
    };
    request.send(JSON.stringify(recommendData));
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email) {
        setMessage("אנא הכנס כתובת מייל", "error");
        return;
    }
    
    if (!password) {
        setMessage("אנא הכנס סיסמה", "error");
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setMessage("אנא הכנס כתובת מייל תקינה", "error");
        return;
    }
    
    showLoading('מתחבר...');
    
    const client = new Client();
    client.login(email, password);
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const children = document.getElementById('registerChildren').value;
    

    if (!name) {
        setMessage("אנא הכנס שם מלא", "error");
        return;
    }
    
    if (name.length < 2) {
        setMessage("שם חייב להיות לפחות 2 תווים", "error");
        return;
    }
    
    if (!email) {
        setMessage("אנא הכנס כתובת מייל", "error");
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setMessage("אנא הכנס כתובת מייל תקינה", "error");
        return;
    }
    
    if (!password) {
        setMessage("אנא הכנס סיסמה", "error");
        return;
    }
    
    if (password.length < 4) {
        setMessage("סיסמה חייבת להיות לפחות 4 תווים", "error");
        return;
    }
    
    showLoading('מרשם משתמש...');
    
    const client = new Client(name, email, password, children || '0');
    client.register();
    
    document.getElementById('registerForm').reset();
}

function handleEditProfile(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        setMessage("יש להתחבר תחילה", "error");
        return;
    }
    
    const name = document.getElementById('editName').value.trim();
    const children = document.getElementById('editChildren').value;
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    

    if (!name) {
        setMessage("אנא הכנס שם מלא", "error");
        return;
    }
    
    if (name.length < 2) {
        setMessage("שם חייב להיות לפחות 2 תווים", "error");
        return;
    }
    

    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            setMessage("אנא הכנס את הסיסמה הנוכחית", "error");
            return;
        }
        
        if (currentPassword !== currentUser.password) {
            setMessage("סיסמה נוכחית שגויה", "error");
            return;
        }
        
        if (!newPassword) {
            setMessage("אנא הכנס סיסמה חדשה", "error");
            return;
        }
        
        if (newPassword.length < 4) {
            setMessage("סיסמה חדשה חייבת להיות לפחות 4 תווים", "error");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setMessage("סיסמאות לא זהות", "error");
            return;
        }
    }
    
    showLoading('מעדכן פרטים...');
    
    const client = new Client(
        name,
        currentUser.mail,
        newPassword || currentUser.password,
        children
    );
    client.update();
}

