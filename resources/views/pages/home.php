<div class="container mt-5">
    <h1 class="mb-4">Comic Books Collection</h1>

    <?php if (isset($books) && is_array($books)): ?>
        <?php if (count($books) < 1): ?>
            <div class="alert alert-info" role="alert">
                No books to view
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Serie</th>
                            <th scope="col">Number</th>
                            <th scope="col">Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $i = 0;
                        foreach ($books as $book) {
                            $i++;
                        ?>
                            <tr>
                                <td><?php echo $i; ?></td>
                                <td><?php echo htmlspecialchars($book->serie); ?></td>
                                <td><?php echo htmlspecialchars($book->number); ?></td>
                                <td><?php echo htmlspecialchars($book->title); ?></td>
                            </tr>
                        <?php
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <nav aria-label="Book pagination" class="mt-4">
        <form action="" method="post" class="d-flex justify-content-center align-items-center gap-2">
            <button type="submit" name="pagination" value="first" class="btn btn-outline-secondary"<?php echo $currentPage <= 0 ? 'disabled' : ''; ?>>first</button>
            <input type="hidden" name="currentPage" value="<?php echo $currentPage; ?>">
            <button type="submit" name="pagination" value="prev" class="btn btn-outline-primary" <?php echo $currentPage <= 0 ? 'disabled' : ''; ?>>Previous</button>
            <span class="mx-3">Page <?php echo $currentPage + 1; ?> of <?php echo $maxPage + 1; ?></span>
            <button type="submit" name="pagination" value="next" class="btn btn-outline-primary" <?php echo $currentPage >= $maxPage ? 'disabled' : ''; ?>>Next</button>
            <button type="submit" name="pagination" value="last" class="btn btn-outline-secondary" <?php echo $currentPage >= $maxPage ? 'disabled' : ''; ?>>last</button>

        </form>
    </nav>
</div>