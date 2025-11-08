document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('adminMovieForm');
    
    // --- 1. تم تصحيح الرابط هنا ---
    const API_URL = 'https://cimastream.onrender.com/api';

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageDiv = document.getElementById('message');
            messageDiv.textContent = 'جاري رفع الفيلم...';
            messageDiv.style.color = 'white'; 

            // --- 2. جلب كل البيانات من الحقول ---
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const poster = document.getElementById('poster').files[0];
            const movie_file = document.getElementById('movie_file').files[0];
            const genre = document.getElementById('genre').value;
            const country = document.getElementById('country').value;
            const year = document.getElementById('year').value;
            const rating = document.getElementById('rating').value;
            const classification = document.getElementById('classification').value;

            // --- 3. بناء FormData ---
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

            // --- 4. جلب التوكن الخاص بالإداري ---
            const token = localStorage.getItem('userToken');

            if (!token) {
                 messageDiv.textContent = 'خطأ: أنت غير مسجل كإداري.';
                 messageDiv.style.color = 'red';
                 return;
            }
            
            // --- 5. إرسال البيانات للخادم (باستخدام الرابط الصحيح) ---
            try {
                // --- 6. تم تصحيح الرابط هنا ---
                const response = await fetch(`${API_URL}/movies/add`, {
                    method: 'POST',
                    body: formData,
                    headers: {
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
