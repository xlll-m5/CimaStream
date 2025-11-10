document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. الرابط الصحيح للـ API ---
    // (يشير إلى الواجهة الخلفية "api")
    const API_URL = 'https://cimastream.onrender.com/api';
    
    // --- (لم نعد بحاجة إلى BASE_URL لأن الروابط تأتي كاملة من Cloudinary) ---


    // --- 2. إعداد الهيدر الذكي (الكود سليم) ---
    const setupDynamicHeader = () => {
        const authButtonsDiv = document.querySelector('.auth-buttons');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        if (userInfo && authButtonsDiv) {
            // المستخدم مسجل دخوله
            const userInitial = userInfo.username.charAt(0).toUpperCase();

            authButtonsDiv.innerHTML = `
                <div class="profile-menu">
                    <div class="profile-icon" id="profileIcon">${userInitial}</div>
                    <div class="dropdown-content" id="dropdownContent">
                        ${userInfo.isAdmin ? '<a href="admin.html">لوحة التحكم</a>' : ''}
                        <a href="#">الإعدادات</a>
                        <a href="#">المفضلة</a>
                        <a href="#">تمت المشاهدة</a>
                        <a href="#" id="logoutButton">تسجيل الخروج</a>
                    </div>
                </div>
            `;

            const profileIcon = document.getElementById('profileIcon');
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelector('.profile-menu').classList.toggle('show');
            });

            document.getElementById('logoutButton').addEventListener('click', () => {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userInfo');
                alert('تم تسجيل الخروج بنجاح.');
                window.location.href = 'index.html';
            });

        } else if (authButtonsDiv) {
            // المستخدم غير مسجل دخوله
            authButtonsDiv.innerHTML = `
                <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
                <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
            `;
        }
    };
    
    setupDynamicHeader();

    window.addEventListener('click', (e) => {
        const profileMenu = document.querySelector('.profile-menu');
        if (profileMenu && !profileMenu.contains(e.target)) {
            profileMenu.classList.remove('show');
        }
    });

    // --- 3. باقي الكود (سليم لأنه يستخدم API_URL) ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const moviesGrid = document.getElementById('moviesGrid');
    
    
    // --- التعامل مع صفحة تسجيل الدخول ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginIdentifier = document.getElementById('loginIdentifier').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loginIdentifier, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('تم تسجيل الدخول بنجاح!');
                    localStorage.setItem('userToken', data.accessToken);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    if (data.isAdmin) {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(`فشل تسجيل الدخول: ${data}`);
                }
            } catch (err) {
                alert('خطأ في الاتصال بالخادم');
            }
        });
    }

    // --- التعامل مع صفحة إنشاء حساب ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('كلمتا المرور غير متطابقتين!');
                return;
            }
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                if (res.ok) {
                    alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
                    window.location.href = 'login.html';
                } else {
                    const data = await res.json();
                    alert(`فشل التسجيل: ${data.message || 'خطأ غير معروف'}`);
                }
            } catch (err) {
                alert('خطأ في الاتصال بالخادم');
            }
        });
    }

    // --- جلب وعرض الأفلام في الصفحة الرئيسية ---
    if (moviesGrid) {
        const fetchMovies = async () => {
            try {
                const res = await fetch(`${API_URL}/movies`); 
                if (!res.ok) throw new Error('فشل جلب الأفلام');
                const movies = await res.json();
                renderMovies(movies);
            } catch (err) {
                moviesGrid.innerHTML = `<p style="color: red;">${err.message}</p>`;
            }
        };
        const renderMovies = (movies) => {
            moviesGrid.innerHTML = '';
            if (movies.length === 0) {
                 moviesGrid.innerHTML = '<p>لم تتم إضافة أي أفلام بعد.</p>';
                 return;
            }
            movies.forEach(movie => {
                // --- 4. 💡 هذا هو التعديل! ---
                // (نحن نستخدم الرابط الكامل من Cloudinary مباشرة)
                const posterUrl = movie.posterPath;
                
                const movieCard = `
                    <a href="movie-detail.html?id=${movie._id}" class="movie-card">
                        <img src="${posterUrl}" alt="${movie.title}">
                        <div class="movie-info">
                            <h4>${movie.title}</h4>
                            <span>⭐ ${movie.rating} | ${movie.classification}</span>
                            <span>${movie.year} | ${movie.genre.join(', ')}</span>
                        </div>
                    </a>
                `;
                moviesGrid.insertAdjacentHTML('beforeend', movieCard);
            });
        };
        fetchMovies();
    }

    // --- دالة لإدارة قوائم المستخدم (المفضلة والمشاهدة لاحقاً) ---
    async function toggleUserList(listType, movieId, buttonElement) {
        const token = localStorage.getItem('userToken');
        if (!token) {
            alert('يجب تسجيل الدخول أولاً');
            window.location.href = 'login.html';
            return;
        }
        try {
            const res = await fetch(`${API_URL}/user/${listType}/${movieId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message);
            if (data.added) {
                buttonElement.classList.add('active');
            } else {
                buttonElement.classList.remove('active');
            }
        } catch (err) {
            alert('حدث خطأ في الخادم');
        }
    }


    // --- جلب وعرض تفاصيل الفيلم (الكود المدمج والصحيح) ---
    const movieDetailContainer = document.getElementById('movieDetailContainer');
    
    if (movieDetailContainer) {
        
        const getMovieIdFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        };

        const fetchMovieData = async (id) => {
            try {
                const res = await fetch(`${API_URL}/movies/find/${id}`); 
                if (!res.ok) throw new Error('فشل جلب بيانات الفيلم');
                const movie = await res.json();
                renderMovieDetail(movie);
            } catch (err) {
                movieDetailContainer.innerHTML = `<p style="color: red;">${err.message}</p>`;
            }
        };

        const renderMovieDetail = (movie) => {
            // --- 5. 💡 هذا هو التعديل الثاني! ---
            // (نستخدم الروابط الكاملة من Cloudinary مباشرة)
            const posterUrl = movie.posterPath;
            const videoUrl = movie.moviePath;
            document.title = `${movie.title} - CimaStream`;
            
            const html = `
                <div class="movie-poster">
                    <img src="${posterUrl}" alt="${movie.title}">
                </div>
                <div class="movie-content">
                    
                    <div class="movie-actions">
                        <button id="favoriteBtn" class="action-btn">❤️</button>
                        <button id="watchLaterBtn" class="action-btn">➕</button>
                    </div>

                    <h1>${movie.title}</h1>
                    
                    <div class="movie-meta">
                        <span>⭐ ${movie.rating} | ${movie.classification}</span>
                        <span>${movie.year}</span>
                        <span>${movie.country}</span>
                        <span>${movie.genre.join(' | ')}</span>
                    </div>
                    
                    <h3>القصة</h3>
                    <p>${movie.description}</p>
                    
                    <div class="video-player-wrapper">
                        <video controls preload="metadata" width="100%">
                            <source src="${videoUrl}" type="video/mp4">
                            متصفحك لا يدعم عرض الفيديو.
                        </video>
                    </div>
                </div>
            `;
            
            movieDetailContainer.innerHTML = html;

            document.getElementById('favoriteBtn').addEventListener('click', (e) => {
                toggleUserList('favorites', movie._id, e.currentTarget);
            });
            document.getElementById('watchLaterBtn').addEventListener('click', (e) => {
                toggleUserList('watch-later', movie._id, e.currentTarget);
            });
        };

        const movieId = getMovieIdFromUrl();
        if (movieId) {
            fetchMovieData(movieId);
        } else {
            movieDetailContainer.innerHTML = '<p>لم يتم تحديد فيلم لعرضه.</p>';
        }
    }

});
