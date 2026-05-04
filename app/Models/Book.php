<?php
namespace App\Models;
class Book{
     public int $id;
    public string $title;
    public string $serie;
    public float $number;

    public function __construct(array $data)
    {
        $this->id = (int) ($data['id'] ?? 0);
        $this->title = $data['title'] ?? '';
        $this->serie = $data['serie'] ?? '';
        $this->number = (float) ($data['number'] ?? 0.0);
    }

}
?>