<h1><?= $page ?></h1>

<form method="POST" action="/addUser">
    <div>
        <label>Email</label>
        <input type="email" name="email" required>
    </div>

    <div>
        <label>Wachtwoord</label>
        <input type="password" name="password" required>
    </div>

    <button type="submit">Toevoegen</button>
</form>