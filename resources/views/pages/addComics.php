<h1>Voeg een comic toe</h1>

<form method="POST" action="/comics">
    <input type="text" name="title" placeholder="Comic titel" required>
    <input type="text" name="serie" placeholder="Comic Serie" required>
    <input type="number" name="number" placeholder="Number">

    <button type="submit">Toevoegen</button>
</form>