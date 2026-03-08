<?php

require_once 'config/database.php';

class ConfiguracaoquilhaController {

    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    public function processRequest($method, $id) {

        if ($method === "GET") {

            if ($id) {
                $stmt = $this->conn->prepare("SELECT * FROM configuracaoquilha WHERE id_configuracaoquilha = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            } else {

                $stmt = $this->conn->query("SELECT * FROM configuracaoquilha ORDER BY descricao");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }

        }

    }

}