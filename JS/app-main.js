let templateHistory = [];
let currentTemplate = null;

function showTemplate(templateName, addToHistory = true) {
    const protectedPages = ['catalog', 'myBooks', 'recommend', 'editProfile'];
    const currentUser = getCurrentUser();
    
    if (protectedPages.includes(templateName) && ( !currentUser)) {
        setMessage('יש להתחבר תחילה כדי לגשת לעמוד זה', 'error');
        showTemplate('home', false);
        return;
    }
    
    const container = document.getElementById('appContainer');
    const template = document.getElementById(templateName + 'Template');
    
    
        container.innerHTML = '';
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
        
        if (addToHistory && currentTemplate !== templateName) {
            templateHistory.push(templateName);
            window.history.pushState({ template: templateName }, '', `#${templateName}`);
        }
        currentTemplate = templateName;
        
        setTimeout(() => setupTemplateEvents(templateName), 100);
    
}

function goBack() {
    if (templateHistory.length > 1) {
        templateHistory.pop();
        const previousTemplate = templateHistory[templateHistory.length - 1];
        showTemplate(previousTemplate, false);
    } else {
        showTemplate('home', false);
    }
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.template) {
        showTemplate(event.state.template, false);
    } else {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash + 'Template')) {
            showTemplate(hash, false);
        } else {
            showTemplate('home', false);
        }
    }
});

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash + 'Template')) {
        showTemplate(hash, false);
    } else {
        showTemplate('home', false);
    }
});
function setupTemplateEvents(templateName) {
    
    switch(templateName) {
        case 'login':
            const loginForm = document.getElementById('loginForm');
            
                loginForm.addEventListener('submit', handleLogin);
            
            break;
        case 'register':
            const registerForm = document.getElementById('registerForm');
           
                registerForm.addEventListener('submit', handleRegister);
         
            break;
        case 'catalog':
            setupCatalogNavigation();
            loadBooks();
            break;
        case 'myBooks':
            const currentUser = getCurrentUser();
            loadMyBooks(currentUser.mail);
            break;
        case 'recommend':
            const recommendForm = document.getElementById('recommendForm');
                recommendForm.addEventListener('submit', handleRecommendationSubmit);
            
            break;
        case 'editProfile':
            const editForm = document.getElementById('editProfileForm');
           
                editForm.addEventListener('submit', handleEditProfile);
           
            loadUserDataToForm();
            break;
    }
}

function loadUserDataToForm() {
    const currentUser = getCurrentUser();
   
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        const editChildren = document.getElementById('editChildren');
        
         editName.value = currentUser.userName ;
         editEmail.value = currentUser.mail;
         editChildren.value = currentUser.numOfChildren ;
   
}
window.showTemplate = showTemplate;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleEditProfile = handleEditProfile;
window.handleRecommendationSubmit = handleRecommendationSubmit;
window.handleLogout = handleLogout;
window.setupCatalogNavigation = setupCatalogNavigation;
window.loadBooks = loadBooks;
window.loadMyBooks = loadMyBooks;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.logoutUser = logoutUser;
window.loadUserDataToForm = loadUserDataToForm;
window.globalNetwork = globalNetwork;
window.filterBooks = filterBooks;
window.clearAllFilters = clearAllFilters;
window.borrowBookWithUser = borrowBookWithUser;
window.returnBookWithUser = returnBookWithUser;
window.handleRecommendation = handleRecommendation;
window.goBack = goBack;
window.templateHistory = templateHistory;

