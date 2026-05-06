<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Tecido.php';

class TecidoController {
    private $model;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->model = new Tecido($db);
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
                    if ($id) {
                        $data = $this->model->buscar($id);
                        if (!$data) {
                            http_response_code(404);
                            echo json_encode(["erro" => "Não encontrado"]);
                            return;
                        }
                        echo json_encode($data);
                    } else {
                        $apenasAtivos = isset($_GET['somenteAtivos']) && $_GET['somenteAtivos'] == '1';
                        echo json_encode($this->model->listar($apenasAtivos));
                    }
                    break;

                // 🔥 ADICIONADO: Bloco POST para criação
                case 'POST':
                    if (empty($input['descricao'])) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Descrição obrigatória"]);
                        return;
                    }
                    $ok = $this->model->criar($input['descricao']);
                    if ($ok) {
                        echo json_encode(["mensagem" => "Criado com sucesso", "id" => $ok]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["erro" => "Erro ao criar"]);
                    }
                    break;

                case 'PUT':
                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }
                    if (isset($input['somenteAtivo'])) {
                        $ok = $this->model->atualizarAtivo($id, $input['ativo']);
                        echo json_encode($ok ? ["mensagem" => "Status atualizado"] : ["erro" => "Falha"]);
                        return;
                    }
                    if (empty($input['descricao'])) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Dados inválidos"]);
                        return;
                    }
                    $ok = $this->model->atualizar($id, $input['descricao']);
                    echo json_encode($ok ? ["mensagem" => "Atualizado com sucesso"] : ["erro" => "Falha"]);
                    break;

                case 'DELETE':
                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }
                    try {
                        $ok = $this->model->deletar($id);
                        if ($ok) {
                            echo json_encode(["mensagem" => "Deletado com sucesso"]);
                        } else {
                            http_response_code(404);
                            echo json_encode(["erro" => "Registro não encontrado"]);
                        }
                    } catch (PDOException $e) {
                        if ($e->getCode() == "23000" || strpos($e->getMessage(), '1451') !== false) {
                            http_response_code(400);
                            echo json_encode([
                                "erro" => "Este tecido está vinculado a pedidos e não pode ser excluída. Use a opção de Ativ/Desat."
                            ]);
                        } else { throw $e; }
                    }
                    break;

                default:
                    http_response_code(405);
                    echo json_encode(["erro" => "Método não permitido"]);
                    break;
            } // Fim do Switch
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => "Erro interno", "detalhe" => $e->getMessage()]);
        }
    }
}
