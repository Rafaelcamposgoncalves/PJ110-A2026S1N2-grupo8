<?php

require_once __DIR__ . '/../models/Status.php';

class StatusController {

    private $model;

    public function __construct($db) {
        $this->model = new Status($db);
    }

    public function processRequest($method, $id = null) {

        header("Content-Type: application/json");

        $input = json_decode(file_get_contents("php://input"), true);

        try {

            // =====================
            // GET (LISTAR TODOS)
            // =====================
            if ($method === "GET") {

                if ($id) {
                    echo json_encode($this->model->buscar($id));
                } else {
                    echo json_encode($this->model->listar());
                }

                return;
            }

            // =====================
            // POST (CRIAR)
            // =====================
            if ($method === "POST") {

                if (isset($input["_method"]) && $input["_method"] === "PUT") {

                    $this->model->atualizar(
                        $input["id"],
                        $input["descricao"],
                        $input["ordem"]
                    );

                    echo json_encode(["mensagem" => "Atualizado"]);
                    return;
                }

                if (isset($input["_method"]) && $input["_method"] === "DELETE") {

                    $this->model->deletar($input["id"]);

                    echo json_encode(["mensagem" => "Deletado"]);
                    return;
                }

                $this->model->criar(
                    $input["descricao"],
                    $input["ordem"]
                );

                echo json_encode(["mensagem" => "Criado"]);
                return;
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "erro" => "Erro interno",
                "detalhe" => $e->getMessage()
            ]);
        }
    }
}