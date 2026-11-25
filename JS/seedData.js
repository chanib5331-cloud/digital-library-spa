// טעינת נתוני ההתחלה (ספרים, משתמשים והשאלות לדוגמה) ל-localStorage.
// כל מפתח נטען רק אם הוא עדיין לא קיים, כך שנתונים של המשתמש לא נדרסים.
async function seedData() {
    const sources = {
        books: '../JSON/booksData.json',
        users: '../JSON/usersData.json',
        myBooks: '../JSON/myBooks.json'
    };

    for (const [key, url] of Object.entries(sources)) {
        if (localStorage.getItem(key) !== null) continue;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (localStorage.getItem(key) === null) {
                localStorage.setItem(key, JSON.stringify(data));
            }
        } catch (error) {
            console.warn(`טעינת ${url} נכשלה. יש לפתוח את האתר דרך שרת מקומי (למשל Live Server).`, error);
        }
    }
}

seedData();
