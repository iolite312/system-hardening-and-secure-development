<!-- <h1>Voeg een comic toe</h1>

<form method="POST" action="/comics">
    <input type="text" name="title" placeholder="Comic titel" required>
    <input type="text" name="serie" placeholder="Comic Serie" required>
    <input type="number" name="number" placeholder="Number">

    <button type="submit">Toevoegen</button>
</form> -->

<div class="container mt-5" style="max-width: 600px;">
    <h1 class="mb-4">Add Comic</h1>

    <form method="POST" action="/comics" class="p-4 border rounded bg-light shadow-sm">
        <div class="mb-3">
            <label class="form-label">Comic titel</label>
            <input type="text" name="title" class="form-control" placeholder="Comic titel" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Comic serie</label>
            <input type="text" name="serie" class="form-control" placeholder="Comic serie" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Number</label>
            <input type="number" name="number" class="form-control" placeholder="Number">
        </div>

        <button type="submit" class="btn btn-primary w-100">
            Toevoegen
        </button>
    </form>
</div>