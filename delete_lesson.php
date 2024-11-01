<?php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

        if (!$id) {
            throw new Exception('معرف الدرس غير صالح');
        }

        // Get the file name before deleting the record
        $stmt = $pdo->prepare("SELECT file_name FROM lessons WHERE id = ?");
        $stmt->execute([$id]);
        $lesson = $stmt->fetch();

        if (!$lesson) {
            throw new Exception('الدرس غير موجود');
        }

        $sql = "DELETE FROM lessons WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$id]);

        if ($result) {
            // Delete the file from the server
            $file_path = 'uploads/' . $lesson['file_name'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }
            echo json_encode(['success' => true]);
        } else {
            throw new Exception('حدث خطأ أثناء حذف الدرس');
        }
    } else {
        throw new Exception('طريقة الطلب غير صالحة');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}