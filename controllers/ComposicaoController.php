<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Composicao.php';

class ComposicaoController {
    private $model;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->model = new Composicao($db);
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
                        // ... busca por ID (mantém igual)
                    } else {
                        // Se na URL vier ?somenteAtivos=1, filtra a lista
                        $apenasAtivos = isset($_GET['somenteAtivos']) && $_GET['somenteAtivos'] == '1';
                        echo json_encode($this->model->listar($apenasAtivos));
                    }
                    break;


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

                    // 🔥 NOVO: Caso venha do Switch (Ativar/Desativar)
                    if (isset($input['somenteAtivo'])) {
                        $ok = $this->model->atualizarAtivo($id, $input['ativo']);
                        echo json_encode($ok ? ["mensagem" => "Status atualizado"] : ["erro" => "Falha ao atualizar status"]);
                        return;
                    }

                    if (empty($input['descricao'])) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Descrição obrigatória"]);
                        return;
                    }

                    $ok = $this->model->atualizar($id, $input['descricao']);
                    if ($ok) {
                        echo json_encode(["mensagem" => "Atualizado com sucesso"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["erro" => "Erro ao atualizar"]);
                    }
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
                                "erro" => "Impedimento de exclusão",
                                "mensagem" => "Esta composição está vinculada a pedidos e não pode ser excluída. Use a opção de desativar."
                            ]);
                        } else {
                            throw $e;
                        }
                    }
                    break;

                default:
                    http_response_code(405);
                    echo json_encode(["erro" => "Método não permitido"]);
                    break;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => "Erro interno", "detalhe" => $e->getMessage()]);
        }
    }
}
