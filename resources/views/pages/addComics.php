<div class="container mt-5" style="max-width: 600px;">
    <h1 class="mb-4">Add a Comic</h1>

    <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <?php foreach ($errors as $error): ?>
                <div><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="/comics" class="p-4 border rounded bg-light shadow-sm">
        <div class="mb-3">
            <label for="title" class="form-label">Comic Title</label>
            <input type="text" id="title" name="title" class="form-control" placeholder="Example: Spider-Man" required
                maxlength="255"
                value="<?= isset($old['title']) ? htmlspecialchars($old['title'], ENT_QUOTES, 'UTF-8') : '' ?>">
        </div>

        <div class="mb-3">
            <label for="serie" class="form-label">Comic Serie</label>
            <input type="text" id="serie" name="serie" class="form-control" placeholder="Example: Marvel" required
                maxlength="255"
                value="<?= isset($old['serie']) ? htmlspecialchars($old['serie'], ENT_QUOTES, 'UTF-8') : '' ?>">
        </div>

        <!-- NUMBER -->
        <div class="mb-3">
            <label for="number" class="form-label">Number (optional)</label>
            <input type="number" id="number" name="number" class="form-control" placeholder="Example: 1" min="1"
                step="1"
                value="<?= isset($old['number']) ? htmlspecialchars($old['number'], ENT_QUOTES, 'UTF-8') : '' ?>">
        </div>

        <button type="submit" class="btn btn-success w-100">
            Toevoegen
        </button>

    </form>
</div>