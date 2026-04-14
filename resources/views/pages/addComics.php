<div class="container mt-5" style="max-width: 600px;">
    <h1 class="mb-4">Add a Comic</h1>

    <form method="POST" action="/comics" class="p-4 border rounded bg-light shadow-sm">

        <div class="mb-3">
            <label for="title" class="form-label">Comic Title</label>
            <input type="text" id="title" name="title" class="form-control" placeholder="Example: Spider-Man" required
                maxlength="255">
        </div>

        <div class="mb-3">
            <label for="serie" class="form-label">Comic Serie</label>
            <input type="text" id="serie" name="serie" class="form-control" placeholder="Example: Marvel" required
                maxlength="255">
        </div>

        <div class="mb-3">
            <label for="number" class="form-label">Number (optional)</label>
            <input type="number" id="number" name="number" class="form-control" placeholder="Example: 1" min="1" step="1">
        </div>

        <button type="submit" class="btn btn-success w-100">
            Toevoegen
        </button>
    </form>
</div>