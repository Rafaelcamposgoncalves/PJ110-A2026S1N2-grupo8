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
            // GET (LISTAR / PRÓXIMO)
            // =====================
            if ($method === "GET") {
                // VERIFICA SE É UMA BUSCA PELO PRÓXIMO STATUS NA SEQUÊNCIA
                if (isset($_GET['id_atual'])) {
                    // Nota: Certifica-te que o método buscarSequencia($id) existe no teu Model Status.php
                    $proximo = $this->model->buscarSequencia($_GET['id_atual']);
                    echo json_encode($proximo ? $proximo : ["descricao" => "Fim do fluxo", "id_status" => null]);
                    return;
                }

                if ($id) {
                    echo json_encode($this->model->buscar($id));
                } else {
                    echo json_encode($this->model->listar());
                }
                return;
            }

            // =====================
            // POST (CRIAR / PUT / DELETE via _method)
            // =====================
            if ($method === "POST") {
                // MODO ATUALIZAR
                if (isset($input["_method"]) && $input["_method"] === "PUT") {
                    $this->model->atualizar(
                        $input["id"],
                        $input["descricao"],
                        $input["ordem"]
                    );
                    echo json_encode(["mensagem" => "Atualizado com sucesso"]);
                    return;
                }

                // MODO ELIMINAR
                if (isset($input["_method"]) && $input["_method"] === "DELETE") {
                    $this->model->deletar($input["id"]);
                    echo json_encode(["mensagem" => "Deletado com sucesso"]);
                    return;
                }

                // MODO CRIAR NOVO TIPO DE STATUS
                $this->model->criar(
                    $input["descricao"],
                    $input["ordem"]
                );
                echo json_encode(["mensagem" => "Criado com sucesso"]);
                return;
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "erro" => "Erro interno no servidor",
                "detalhe" => $e->getMessage()
            ]);
        }
    }
}
