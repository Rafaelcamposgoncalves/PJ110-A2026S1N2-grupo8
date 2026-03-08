<?php

require_once 'config/database.php';

class ComposicaoController {

    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    public function processRequest($method, $id) {

        if ($method === "GET") {

            if ($id) {
                $stmt = $this->conn->prepare("SELECT * FROM composicao WHERE id_composicao = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            } else {

                $stmt = $this->conn->query("SELECT * FROM composicao ORDER BY descricao");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }

        }

    }

}