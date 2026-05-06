<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Acabamento.php';

class AcabamentoController {
    private $model;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->model = new Acabamento($db);
    }

    public function processRequest($method, $id = null) {
        header("Content-Type: application/json; charset=UTF-8");
        $input = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        try {
            switch ($method) {
                case 'GET':
                    if ($id) {
                        echo json_encode($this->model->buscar($id));
                    } else {
                        $apenasAtivos = isset($_GET['somenteAtivos']) && $_GET['somenteAtivos'] == '1';
                        echo json_encode($this->model->listar($apenasAtivos));
                    }
                    break;

                case 'POST':
                    $ok = $this->model->criar($input['descricao']);
                    echo json_encode($ok ? ["mensagem" => "Criado"] : ["erro" => "Falha"]);
                    break;

                case 'PUT':
                    if (isset($input['somenteAtivo'])) {
                        $ok = $this->model->atualizarAtivo($id, $input['ativo']);
                        echo json_encode($ok ? ["mensagem" => "Status atualizado"] : ["erro" => "Falha"]);
                    } else {
                        $ok = $this->model->atualizar($id, $input['descricao']);
                        echo json_encode($ok ? ["mensagem" => "Atualizado"] : ["erro" => "Falha"]);
                    }
                    break;

                case 'DELETE':
                    try {
                        $ok = $this->model->deletar($id);
                        echo json_encode($ok ? ["mensagem" => "Deletado"] : ["erro" => "Não encontrado"]);
                    } catch (PDOException $e) {
                        if ($e->getCode() == "23000") {
                            http_response_code(400);
                            echo json_encode(["erro" => "Este acabamento está vinculada a pedidos e não pode ser excluída. Use a opção de Ativ/Desat."]);
                        } else { throw $e; }
                    }
                    break;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => $e->getMessage()]);
        }
    }
}
