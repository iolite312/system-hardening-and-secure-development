<!DOCTYPE html>
<html>
<head>
    <title>Comic lijst</title>
</head>
<body>

<?php require __DIR__ . '/partials/navbar.php'; ?>

<h1>Voeg een comic toe</h1>

<form method="POST" action="/comics">
    <input type="text" name="title" placeholder="Comic titel" required>
    <button type="submit">Toevoegen</button>
</form>