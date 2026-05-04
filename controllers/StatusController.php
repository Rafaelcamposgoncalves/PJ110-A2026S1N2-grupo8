<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Status.php';

class StatusController {
    private $model;

    public function __construct() {
        $database = new Database();
        $this->model = new Status($database->connect());
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
                    if (isset($_GET['id_atual'])) {
                        echo json_encode($this->model->buscarSequencia($_GET['id_atual']) ?: ["descricao" => "Fim", "id_status" => null]);
                    } else {
                        echo json_encode($id ? $this->model->buscar($id) : $this->model->listar());
                    }
                    break;

                case 'POST':
                    if (isset($input['ordens'])) {
                        foreach ($input['ordens'] as $item) {
                            $this->model->atualizar($item['id'], null, $item['ordem'], true);
                        }
                        echo json_encode(["mensagem" => "Reordenado"]);
                        return;
                    }
                    echo json_encode($this->model->criar($input['descricao'], $input['ordem'] ?? 0) ? ["mensagem" => "Criado"] : ["erro" => "Falha"]);
                    break;

                case 'PUT':
                    $finalId = $id ?? $input['id'] ?? null;
                    if (isset($input['somenteAtivo'])) {
                        $ok = $this->model->atualizarAtivo($finalId, $input['ativo']);
                    } else {
                        $ok = $this->model->atualizar($finalId, $input['descricao'], $input['ordem'] ?? 0, false);
                    }
                    echo json_encode($ok ? ["mensagem" => "Atualizado"] : ["erro" => "Falha"]);
                    break;

case 'DELETE':
    try {
        $finalId = $id ?? $input['id'] ?? null;
        $this->model->deletar($finalId);
        echo json_encode(["mensagem" => "Status excluído com sucesso!"]);
// No StatusController.php, dentro do case 'DELETE'
} catch (PDOException $e) {
    http_response_code(400); 
    echo json_encode([
        "erro" => "Não é possível excluir um status em uso. Este registro possui vínculos com pedidos existentes. Para ocultá-lo, utilize a opção de desativar."
    ]);
}

    break;


            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => $e->getMessage()]);
        }
    }
}
