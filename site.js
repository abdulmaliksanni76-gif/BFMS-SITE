// --- STATE MANAGEMENT ---
let authMode = 'login'; // 'login', 'enroll', or 'forgot'
const USERS_KEY = 'bfms_database_2026';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateModalUI();
    
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }
});

// --- AUTH LOGIC ---
function openModal(mode = 'login') {
    authMode = mode;
    updateModalUI();
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }
}

function closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

function toggleAuthMode() {
    if (authMode === 'forgot') {
        authMode = 'login';
    } else {
        authMode = (authMode === 'login') ? 'enroll' : 'login';
    }
    updateModalUI();
}

function openForgotMode() {
    authMode = 'forgot';
    updateModalUI();
}

function updateModalUI() {
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const enrollFields = document.getElementById('enroll-fields');
    const loginFields = document.getElementById('login-fields');
    const submitBtn = document.getElementById('submit-btn');
    const footerText = document.getElementById('footer-text');
    const toggleBtn = document.getElementById('toggle-btn');
    const passInput = document.getElementById('auth-password');
    const pName = document.getElementById('parent-name');

    if (!title || !submitBtn) return;

    if (enrollFields) enrollFields.classList.add('hidden');
    if (loginFields) loginFields.classList.add('hidden');
    if (passInput) passInput.classList.remove('hidden');
    if (pName) pName.classList.remove('hidden');

    if (authMode === 'enroll') {
        title.innerText = "Student Enrollment";
        subtitle.innerText = "Start your journey to excellence";
        if (enrollFields) enrollFields.classList.remove('hidden');
        submitBtn.innerText = "Register New Student";
        if (footerText) footerText.innerText = "Already registered?";
        if (toggleBtn) toggleBtn.innerText = "Login to Portal";
        if (passInput) passInput.placeholder = "Set your Password";
    } else if (authMode === 'forgot') {
        title.innerText = "Reset Password";
        subtitle.innerText = "Verify ID & Phone to reset";
        if (enrollFields) enrollFields.classList.remove('hidden'); 
        if (loginFields) loginFields.classList.remove('hidden');   
        if (pName) pName.classList.add('hidden');
        submitBtn.innerText = "Update Password";
        if (footerText) footerText.innerText = "Remembered it?";
        if (toggleBtn) toggleBtn.innerText = "Back to Login";
        if (passInput) passInput.placeholder = "Enter New Password";
    } else {
        title.innerText = "Student Portal";
        subtitle.innerText = "Welcome to our digital campus";
        if (loginFields) loginFields.classList.remove('hidden');
        submitBtn.innerText = "Access Dashboard";
        if (footerText) {
            footerText.innerHTML = `Don't have an ID? <br> 
            <button type="button" onclick="openForgotMode()" class="text-orange-500 font-bold hover:underline block mx-auto mt-1">Forgot Password?</button>`;
        }
        if (toggleBtn) toggleBtn.innerText = "Enroll Here";
        if (passInput) passInput.placeholder = "Enter Password";
    }
}

// --- DATABASE FUNCTIONS ---
function getDB() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function updateDB(db) {
    localStorage.setItem(USERS_KEY, JSON.stringify(db));
}

function saveToDB(user) {
    const db = getDB();
    db.push(user);
    updateDB(db);
}

// --- FORM SUBMISSION ---
function handleAuth(event) {
    event.preventDefault();
    const db = getDB();
    const password = document.getElementById('auth-password').value;

    if (authMode === 'enroll') {
        const name = document.getElementById('parent-name').value;
        const phone = document.getElementById('whatsapp-num').value;

        if (!name || !phone || !password) {
            notify("Please fill all fields", "error");
            return;
        }

        const studentID = `BFMS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser = {
            id: studentID,
            name: name,
            phone: phone,
            password: password,
            joined: new Date().toLocaleDateString()
        };

        saveToDB(newUser);
        showSuccessID(studentID);
    } else if (authMode === 'forgot') {
        const phone = document.getElementById('whatsapp-num').value;
        const studentID = document.getElementById('login-id').value;

        if (!phone || !studentID || !password) {
            notify("Please fill all fields", "error");
            return;
        }

        const userIndex = db.findIndex(u => u.id === studentID && u.phone === phone);

        if (userIndex !== -1) {
            db[userIndex].password = password;
            updateDB(db);
            notify("Password updated successfully!", "success");
            setTimeout(() => {
                authMode = 'login';
                updateModalUI();
            }, 1500);
        } else {
            notify("Details mismatch! ID or Phone incorrect.", "error");
        }
    } else {
        const loginID = document.getElementById('login-id').value;
        const user = db.find(u => (u.id === loginID || u.phone === loginID) && u.password === password);

        if (user) {
            notify(`Welcome back, ${user.name}! Opening portal...`, "success");
            setTimeout(() => {
                closeModal();
                launchPortalInNewTab(user);
            }, 1000);
        } else {
            const userExists = db.find(u => u.id === loginID || u.phone === loginID);
            if (userExists) {
                notify("Wrong password. Please try again.", "error");
            } else {
                notify("Account not found. Please enroll first.", "error");
            }
        }
    }
}

// --- NOTIFICATIONS ---
function notify(message, type = "success") {
    const root = document.getElementById('notification-root');
    if (!root) return;
    
    const toast = document.createElement('div');
    const bgColor = type === "success" ? "bg-emerald-600" : "bg-red-500";
    
    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in pointer-events-auto mb-2 z-[300]`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span class="font-bold">${message}</span>
    `;
    
    root.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- SUCCESS ID OVERLAY ---
function showSuccessID(id) {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    authForm.innerHTML = `
        <div class="text-center py-8 space-y-6 animate-fade-in">
            <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto">
                <i class="fas fa-id-card"></i>
            </div>
            <div>
                <h3 class="text-2xl font-black text-slate-800">Registration Success!</h3>
                <p class="text-slate-500">Please save your Student ID below:</p>
            </div>
            <div class="bg-slate-100 p-4 rounded-xl text-2xl font-black text-emerald-700 tracking-widest border-2 border-dashed border-emerald-300">
                ${id}
            </div>
            <button onclick="location.reload()" class="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl">
                Go to Login
            </button>
        </div>
    `;
}

// --- REAL PORTAL LAUNCHER (NEW TAB) ---
function launchPortalInNewTab(user) {
    const portalWindow = window.open('', '_blank');
    
    const portalHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Portal | ${user.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Quicksand:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Quicksand', sans-serif; }
            h1, h2, h3 { font-family: 'Outfit', sans-serif; }
            .sidebar-link:hover { background: rgba(255,255,255,0.1); }
            .active-link { background: rgba(255,255,255,0.2); border-left: 4px solid #fff; }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen flex">
        <!-- Sidebar -->
        <aside class="w-72 bg-emerald-800 text-white flex flex-col hidden lg:flex">
            <div class="p-8 flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                    <span class="text-emerald-800 font-black text-xl">B</span>
                </div>
                <h1 class="text-2xl font-black tracking-tighter">BFMS</h1>
            </div>
            <nav class="flex-1 px-4 space-y-2">
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl sidebar-link active-link"><i class="fas fa-th-large"></i> Dashboard</a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl sidebar-link"><i class="fas fa-book-open"></i> Assignments</a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl sidebar-link"><i class="fas fa-chart-bar"></i> Exam Results</a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl sidebar-link"><i class="fas fa-file-invoice"></i> Fees Payment</a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl sidebar-link"><i class="fas fa-cog"></i> Settings</a>
            </nav>
            <div class="p-8">
                <button onclick="window.close()" class="w-full bg-red-500/20 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all">
                    Sign Out
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
            <header class="bg-white border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-10">
                <h2 class="text-xl font-bold text-slate-800">Welcome Back, ${user.name.split(' ')[0]}!</h2>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-sm font-bold text-slate-800">${user.id}</p>
                        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Student</p>
                    </div>
                    <div class="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-xl border-2 border-emerald-200">
                        ${user.name[0]}
                    </div>
                </div>
            </header>

            <div class="p-8 max-w-6xl mx-auto space-y-8">
                <!-- Top Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-clock"></i></div>
                        <div><p class="text-slate-400 text-xs font-bold uppercase">Attendance</p><h4 class="text-2xl font-black">94.2%</h4></div>
                    </div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-star"></i></div>
                        <div><p class="text-slate-400 text-xs font-bold uppercase">Class Position</p><h4 class="text-2xl font-black">3rd / 45</h4></div>
                    </div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-medal"></i></div>
                        <div><p class="text-slate-400 text-xs font-bold uppercase">Points</p><h4 class="text-2xl font-black">1,250</h4></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Results Table -->
                    <div class="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 class="font-black text-lg">Current Term Results</h3>
                            <span class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">First Term 2026</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                    <tr>
                                        <th class="px-6 py-4">Subject</th>
                                        <th class="px-6 py-4">Score</th>
                                        <th class="px-6 py-4">Grade</th>
                                        <th class="px-6 py-4">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-sm">
                                    <tr>
                                        <td class="px-6 py-4 font-bold">Mathematics</td>
                                        <td class="px-6 py-4">85 / 100</td>
                                        <td class="px-6 py-4"><span class="text-emerald-600 font-bold">A</span></td>
                                        <td class="px-6 py-4 text-slate-500 italic">Excellent</td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-4 font-bold">English Language</td>
                                        <td class="px-6 py-4">78 / 100</td>
                                        <td class="px-6 py-4"><span class="text-blue-600 font-bold">B+</span></td>
                                        <td class="px-6 py-4 text-slate-500 italic">Very Good</td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-4 font-bold">Basic Science</td>
                                        <td class="px-6 py-4">92 / 100</td>
                                        <td class="px-6 py-4"><span class="text-emerald-600 font-bold">A+</span></td>
                                        <td class="px-6 py-4 text-slate-500 italic">Outstanding</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Notice Board -->
                    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                        <h3 class="font-black text-lg mb-6 flex items-center gap-2">
                            <i class="fas fa-bullhorn text-emerald-600"></i> Notice Board
                        </h3>
                        <div class="space-y-6">
                            <div class="border-l-4 border-emerald-500 pl-4 py-1">
                                <h5 class="text-sm font-bold">Inter-House Sports Day</h5>
                                <p class="text-xs text-slate-500 mt-1">March 28th — All students are required to come in their sport gears.</p>
                            </div>
                            <div class="border-l-4 border-orange-500 pl-4 py-1">
                                <h5 class="text-sm font-bold">Mid-Term Fees</h5>
                                <p class="text-xs text-slate-500 mt-1">Kindly ensure all outstanding fees are settled by April 5th.</p>
                            </div>
                            <div class="border-l-4 border-blue-500 pl-4 py-1">
                                <h5 class="text-sm font-bold">Science Exhibition</h5>
                                <p class="text-xs text-slate-500 mt-1">Submit your project topics to your class teachers before Friday.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </body>
    </html>
    `;
    
    portalWindow.document.write(portalHTML);
    portalWindow.document.close();
}