<section>
      <?php if (isset($books)): ?>
         <?php if($book->count < 0): ?>
            no books to view
         <?php else: ?>
        
             <?php foreach($books as $book){
                
                echo "$book->volume";
                
             }
             ?>
         <?php endif; ?>


      <?php endif; ?>
</section>