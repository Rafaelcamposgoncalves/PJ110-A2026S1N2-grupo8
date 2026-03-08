<?php

require_once 'config/Database.php';

class Usuario {

    private $conn;

    public function __construct() {

        $database = new Database();
        $this->conn = $database->connect();
    }

    public function buscaUsuario($usuario) {

        $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE usuario = ?");
        $stmt->execute([$usuario]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}