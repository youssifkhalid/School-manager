<?php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
        $grade = filter_input(INPUT_POST, 'grade', FILTER_SANITIZE_STRING);
        $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
        $term = filter_input(INPUT_POST, 'term', FILTER_SANITIZE_STRING);

        if (!$title || !$grade || !$subject || !$term) {
            throw new Exception('جميع الحقول مطلوبة');
        }

        if (!isset($_FILES['pdfFile'])) {
            throw new Exception('لم يتم تحميل أي ملف');
        }

        $file = $_FILES['pdfFile'];
        $allowedExtensions = ['pdf'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception('يجب أن يكون الملف بصيغة PDF');
        }

        $upload_dir = 'uploads/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $file_name = uniqid() . '_' . $file['name'];
        $file_path = $upload_dir . $file_name;

        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            throw new Exception('فشل في رفع الملف');
        }

        $sql = "INSERT INTO lessons (title, grade, subject, term, file_name) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$title, $grade, $subject, $term, $file_name]);

        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            throw new Exception('حدث خطأ أثناء حفظ البيانات في قاعدة البيانات');
        }
    } else {
        throw new Exception('طريقة الطلب غير صالحة');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}