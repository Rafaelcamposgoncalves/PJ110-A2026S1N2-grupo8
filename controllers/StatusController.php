<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Status.php';

class StatusController {
    private $model;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->model = new Status($db);
    }

    public function processRequest($method, $id = null) {
        header("Content-Type: application/json; charset=UTF-8");
        
        $inputJSON = file_get_contents("php://input");
        $input = json_decode($inputJSON, true) ?? $_POST;

        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        try {
            switch ($method) {
                case 'GET':
                    if (isset($_GET['id_atual'])) {
                        echo json_encode($this->model->buscarSequencia($_GET['id_atual']) ?: ["descricao" => "Fim", "id_status" => null]);
                    } elseif ($id) {
                        echo json_encode($this->model->buscar($id) ?: ["erro" => "Não encontrado"]);
                    } else {
                        echo json_encode($this->model->listar());
                    }
                    break;

                case 'POST':
                    // Caso 1: Reordenação em massa (Drag and Drop)
                    if (isset($input['ordens']) && is_array($input['ordens'])) {
                        $sucessoTotal = true;
                        foreach ($input['ordens'] as $item) {
                            if (!$this->model->atualizar($item['id'], null, $item['ordem'], true)) {
                                $sucessoTotal = false;
                            }
                        }
                        echo json_encode($sucessoTotal ? ["mensagem" => "Ordem atualizada"] : ["erro" => "Falha ao reordenar"]);
                        return;
                    }

                    // Caso 2: Cadastro Normal
                    if (empty($input['descricao'])) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Descrição é obrigatória"]);
                        return;
                    }
                    $ok = $this->model->criar($input['descricao'], $input['ordem'] ?? 0);
                    echo json_encode($ok ? ["mensagem" => "Criado"] : ["erro" => "Falha ao criar"]);
                    break;

                case 'PUT':
                    $finalId = $id ?? $input['id'] ?? null;
                    if (!$finalId) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }
                    // 🔥 CORREÇÃO: Passando o 4º parâmetro (false) para indicar que NÃO é somente ordem
                    $ok = $this->model->atualizar($finalId, $input['descricao'], $input['ordem'] ?? 0, false);
                    echo json_encode($ok ? ["mensagem" => "Atualizado"] : ["erro" => "Falha"]);
                    break;

                case 'DELETE':
                    $finalId = $id ?? $input['id'] ?? null;
                    $ok = $this->model->deletar($finalId);
                    echo json_encode($ok ? ["mensagem" => "Deletado"] : ["erro" => "Falha"]);
                    break;

                default:
                    http_response_code(405);
                    echo json_encode(["erro" => "Método não permitido"]);
                    break;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => $e->getMessage()]);
        }
    }
}
