<section>

<?php if (isset($books) && is_array($books)): ?>
         <?php if(count($books) < 1): ?>
            no books to view
         <?php else: ?>
             <?php foreach($books as $book){?>

                <section>
                    <?php
                        echo "$book->serie </br>";
                        echo "$book->number </br>";
                        echo "$book->title </br>";
                    ?>
                </section>
            
                <?php
}
             ?>
         <?php endif; ?>


      <?php endif; ?>


      <section class="pagination"> 
        <form action="" method="post">
            <input type="submit" name="pagination" value="prev" />
            <?php echo $currentPage ?>
            <input type="submit" name="pagination" value="nxt" />
        </form>
    </section>
</section>