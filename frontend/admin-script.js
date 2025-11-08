document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('adminMovieForm');
const API_URL = 'https://cimastream-api.onrender.com/api';

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageDiv = document.getElementById('message');
            messageDiv.textContent = 'جاري رفع الفيلم...';
            messageDiv.style.color = 'white';

            // --- 1. جلب كل البيانات من الحقول ---
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const poster = document.getElementById('poster').files[0];
            const movie_file = document.getElementById('movie_file').files[0];
            const genre = document.getElementById('genre').value;
            const country = document.getElementById('country').value;
            const year = document.getElementById('year').value;
            const rating = document.getElementById('rating').value;
            const classification = document.getElementById('classification').value;

            // --- 2. بناء FormData (هنا تم التصحيح) ---
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('poster', poster);
            formData.append('movie_file', movie_file);
            formData.append('genre', genre);
            formData.append('country', country);
            formData.append('year', year);
            formData.append('rating', rating);
            formData.append('classification', classification);

            // --- 3. جلب التوكن الخاص بالإداري (هام جداً) ---
            // بما أننا حفظنا التوكن عند تسجيل الدخول، يمكننا استخدامه
            const token = localStorage.getItem('userToken');

            if (!token) {
                 messageDiv.textContent = 'خطأ: أنت غير مسجل كإداري.';
                 messageDiv.style.color = 'red';
                 return;
            }
            
            // --- 4. إرسال البيانات للخادم ---
            try {
                const response = await fetch(`${API_URL}/movies/add`, {
                        method: 'POST',
                    body: formData,
                    headers: {
                        // يجب إرسال التوكن ليسمح لك الخادم بالإضافة
                        'Authorization': `Bearer ${token}` 
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    messageDiv.textContent = 'تمت إضافة الفيلم بنجاح!';
                    messageDiv.style.color = 'lightgreen';
                    adminForm.reset(); 
                } else {
                    messageDiv.textContent = `فشل: ${result.message || 'خطأ غير معروف'}`;
                    messageDiv.style.color = 'red';
                }
            } catch (err) {
                console.error('Error:', err);
                messageDiv.textContent = 'حدث خطأ في الاتصال بالخادم.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
