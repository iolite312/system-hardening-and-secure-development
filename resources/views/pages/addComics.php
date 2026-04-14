<?php
session_start();

if (!isset($_SESSION['comics'])) {
    $_SESSION['comics'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];

    if (!empty($title)) {
        $_SESSION['comics'][] = $title;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Comic lijst</title>
</head>
<body>

<h1>Voeg een comic toe</h1>

<form method="POST">
    <input type="text" name="title" placeholder="Comic titel" required>
    <button type="submit">Toevoegen</button>
</form>

<h2>Mijn comics:</h2>

<ul>
    <?php foreach ($_SESSION['comics'] as $comic): ?>
        <li><?php echo htmlspecialchars($comic); ?></li>
    <?php endforeach; ?>
</ul>

</body>
</html>