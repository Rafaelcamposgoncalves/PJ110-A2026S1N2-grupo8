<?php

class Cor {

    private $conn;
    private $table = "cor";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function listar() {

        $query = "SELECT id_cor, descricao FROM {$this->table} ORDER BY descricao";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}