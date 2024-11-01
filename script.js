document.addEventListener('DOMContentLoaded', function() {
    const adminBtn = document.getElementById('adminBtn');
    const adminLogin = document.getElementById('adminLogin');
    const loginBtn = document.getElementById('loginBtn');
    const adminPassword = document.getElementById('adminPassword');
    const uploadSection = document.getElementById('uploadSection');
    const gradeSelect = document.getElementById('grade');
    const subjectSelect = document.getElementById('subject');
    const uploadGradeSelect = document.getElementById('uploadGrade');
    const uploadSubjectSelect = document.getElementById('uploadSubject');
    const searchForm = document.getElementById('searchForm');
    const uploadForm = document.getElementById('uploadForm');
    const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

    let isAdminLoggedIn = false;

    const subjects = {
        'أولى ثانوي': ['اللغة العربية', 'اللغة الإنجليزية', 'اللغة الفرنسية', 'العلوم المتكاملة', 'الرياضيات'],
        'ثانية ثانوي': ['اللغة العربية', 'اللغة الإنجليزية', 'اللغة الفرنسية', 'الأحياء', 'الكيمياء', 'الفيزياء', 'الرياضيات', 'التاريخ', 'الجغرافيا', 'علم النفس', 'الفلسفة'],
        'ثالثة ثانوي': ['اللغة العربية', 'اللغة الإنجليزية', 'الفيزياء', 'الكيمياء', 'الأحياء', 'التاريخ', 'الجغرافيا', 'علم النفس']
    };

    adminBtn.addEventListener('click', () => {
        adminLogin.style.display = adminLogin.style.display === 'none' ? 'flex' : 'none';
    });

    loginBtn.addEventListener('click', () => {
        if (adminPassword.value === '88881') {
            isAdminLoggedIn = true;
            uploadSection.style.display = 'block';
            adminLogin.style.display = 'none';
            adminBtn.textContent = 'تم تسجيل الدخول كمسؤول';
        } else {
            alert('كلمة المرور غير صحيحة');
        }
    });

    gradeSelect.addEventListener('change', () => updateSubjects(gradeSelect, subjectSelect));
    uploadGradeSelect.addEventListener('change', () => updateSubjects(uploadGradeSelect, uploadSubjectSelect));
    searchForm.addEventListener('submit', searchLessons);
    uploadForm.addEventListener('submit', uploadPDF);

    function updateSubjects(gradeElement, subjectElement) {
        const grade = gradeElement.value;
        subjectElement.innerHTML = '<option value="">اختر المادة</option>';
        if (grade && subjects[grade]) {
            subjects[grade].forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectElement.appendChild(option);
            });
        }
    }

    async function searchLessons(event) {
        event.preventDefault();
        const formData = new FormData(searchForm);
        const searchParams = new URLSearchParams(formData);

        try {
            const response = await fetch(`search_lessons.php?${searchParams}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const lessons = await response.json();
            displayLessons(lessons);
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء البحث عن الدروس');
        }
    }

    function displayLessons(lessons) {
        resultsTable.innerHTML = '';
        lessons.forEach(lesson => {
            const row = resultsTable.insertRow();
            row.innerHTML = `
                <td>${escapeHtml(lesson.title)}</td>
                <td>${escapeHtml(lesson.grade)}</td>
                <td>${escapeHtml(lesson.subject)}</td>
                <td>${escapeHtml(lesson.term)}</td>
                <td><a href="uploads/${escapeHtml(lesson.file_name)}" target="_blank">عرض الملف</a></td>
                <td>${isAdminLoggedIn ? `<button class="delete-btn" data-id="${lesson.id}">حذف</button>` : ''}</td>
            `;
        });

        if (isAdminLoggedIn) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteLesson);
            });
        }
    }

    async function uploadPDF(event) {
        event.preventDefault();
        if (!isAdminLoggedIn) {
            alert('يجب تسجيل الدخول كمسؤول لرفع الملفات');
            return;
        }
        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('upload_pdf.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            if (result.success) {
                alert('تم رفع الملف بنجاح');
                uploadForm.reset();
                searchLessons(new Event('submit'));
            } else {
                throw new Error(result.error || 'حدث خطأ أثناء رفع الملف');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async function deleteLesson(event) {
        if (!isAdminLoggedIn) {
            alert('يجب تسجيل الدخول كمسؤول لحذف الدروس');
            return;
        }
        const lessonId = event.target.dataset.id;
        if (confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
            try {
                const response = await fetch('delete_lesson.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `id=${lessonId}`
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();
                if (result.success) {
                    alert('تم حذف الدرس بنجاح');
                    searchLessons(new Event('submit'));
                } else {
                    throw new Error(result.error || 'حدث خطأ أثناء حذف الدرس');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial search to populate the table
    searchLessons(new Event('submit'));
});