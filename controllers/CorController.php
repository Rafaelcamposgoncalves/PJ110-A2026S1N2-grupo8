<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Cor.php';

class CorController {

    private $cor;

    public function __construct($db) {
        $this->cor = new Cor($db);
    }

    public function processRequest($method, $id) {

        switch ($method) {

            case 'GET':
                $this->listar();
                break;

            default:
                http_response_code(405);
                echo json_encode(["mensagem" => "Método não permitido"]);
                break;
        }
    }

    private function listar() {

        $dados = $this->cor->listar();

        echo json_encode($dados);
    }
}