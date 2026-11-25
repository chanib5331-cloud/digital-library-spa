function setupCatalogNavigation() {
    const myBooksBtn = document.getElementById('myBooksBtn');
    const recommendBtn = document.getElementById('recommendBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
        myBooksBtn.addEventListener('click', () => showTemplate('myBooks'));
        recommendBtn.addEventListener('click', () => showTemplate('recommend'));
        logoutBtn.addEventListener('click', handleLogout);
        editProfileBtn.addEventListener('click', () => showTemplate('editProfile'));
    setupSearchFunctionality();
}




function setupSearchFunctionality() {
    const filterBtn = document.getElementById('filterBtn');
    const clearFilters = document.getElementById('clearFilters');
        filterBtn.addEventListener('click', filterBooks);
        clearFilters.addEventListener('click', clearAllFilters);
    
}

function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('ageFilter').value = '';
    loadBooks();
}

function displayBooks(books, gridId, isMyBooks = false) {
    const grid = document.getElementById(gridId);

    if (!books || books.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>${isMyBooks ? 'אין ספרים מושאלים' : 'לא נמצאו ספרים'}</h3>
                <p>${isMyBooks ? 'לא השאלת ספרים עדיין' : 'נסה לחפש מאוחר יותר'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = books.filter(book => book).map(book => `
        <div class="book-card ${book.isRecommended ? 'recommended-book' : ''}">
            ${book.isRecommended ? '<div class="recommend-badge">⭐ המלצת קורא</div>' : ''}
            <h3 style="font-size: 1.3rem; font-weight: 600; color: #2c3e50; margin-bottom: 15px; line-height: 1.4;">${book.isRecommended ? '🌟 ' : ''}${book.title}</h3>
            <div class="book-info">
                <p style="margin: 8px 0; color: #1a1a1a; font-size: 1rem; font-weight: 700;"><strong style="color: #333;">מחבר:</strong> ${book.author}</p>
                <p style="margin: 8px 0; color: #1a1a1a; font-size: 1rem; font-weight: 700;"><strong style="color: #333;">ז'אנר:</strong> ${book.genre}</p>
                <p style="margin: 8px 0; color: #1a1a1a; font-size: 1rem; font-weight: 700;"><strong style="color: #333;">קבוצת גיל:</strong> ${book.age_group}</p>
                ${book.isRecommended ? `<p class="recommend-info" style="background: linear-gradient(135deg, #e8f5e8, #d4edda); color: #155724; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; margin: 8px 0; border-left: 4px solid #28a745; font-weight: 600;">💡 המלצת קורא</p>` : ''}
            </div>
            ${!isMyBooks ? `<div class="book-status ${book.isBorrowed ? 'status-borrowed' : 'status-available'}">
                ${book.isBorrowed ? '🔒 מושאל' : '✅ זמין'}
            </div>` : ''}
            <div class="book-actions">
                ${isMyBooks ?
            `<button class="book-btn btn-return" onclick="returnBookWithUser('${book.id}')">📤 החזר ספר</button>` :
            book.isBorrowed ?
                `<button class="book-btn btn-disabled" disabled>❌ לא זמין</button>` :
                `<button class="book-btn btn-borrow" onclick="borrowBookWithUser('${book.id}')">📖 השאל ספר</button>`
        }
            </div>
        </div>
    `).join('');
}

function handleRecommendationSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('recommendTitle').value.trim();
    const author = document.getElementById('recommendAuthor').value.trim();
    const genre = document.getElementById('recommendGenre').value;
    const ageGroup = document.getElementById('recommendAgeGroup').value;

    handleRecommendation(title, author, genre, ageGroup);
}

function handleLogout() {
    showLoading('מתנתק...');
    
    setTimeout(() => {
        logoutUser();
        templateHistory = [];
        currentTemplate = null;
        window.history.replaceState(null, '', '#home');
        showTemplate('home', false);
        hideLoading();
    }, 1200);
}