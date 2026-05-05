<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Shaper.php';

class ShaperController {
    private $shaper;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->shaper = new Shaper($db);
    }

    public function processRequest($method, $id = null) {
        $input = json_decode(file_get_contents("php://input"), true);
        
        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        switch($method) {
            case 'GET':
                if ($id) {
                    if (is_numeric($id)) {
                        $data = $this->shaper->buscar($id);
                        if (!$data) {
                            http_response_code(404);
                            echo json_encode(["erro" => "Shaper não encontrado"]);
                            return;
                        }
                        echo json_encode($data);
                    } else {
                        $data = $this->shaper->buscarPorCampos($id);
                        echo json_encode($data);
                    }
                } else {
                    // 🔥 PADRONIZADO: Aceita somenteAtivos=1 (igual aos outros campos)
                    // Se vier qualquer um dos dois (ativos=true ou somenteAtivos=1), ele filtra
                    if ((isset($_GET['ativos']) && $_GET['ativos'] === 'true') || 
                        (isset($_GET['somenteAtivos']) && $_GET['somenteAtivos'] === '1')) {
                        $data = $this->shaper->listarAtivos();
                    } else {
                        $data = $this->shaper->listar();
                    }
                    echo json_encode($data);
                }
                break;


            case 'POST':
                if (!isset($input['nome'], $input['email'], $input['telefone'])) {
                    http_response_code(400);
                    echo json_encode(["erro" => "Dados incompletos"]);
                    return;
                }
                $this->shaper->criar($input['nome'], $input['email'], $input['telefone']);
                http_response_code(201);
                echo json_encode(["mensagem" => "Shaper criado"]);
                break;

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(["erro" => "ID não informado"]);
                    return;
                }

                // Caso 1: Alteração do Switch (Ativo/Inativo)
                if (isset($input['somenteAtivo'])) {
                    $ok = $this->shaper->atualizarAtivo($id, $input['ativo']);
                    echo json_encode($ok ? ["mensagem" => "Status atualizado"] : ["erro" => "Falha ao atualizar status"]);
                    return;
                }

                // Caso 2: Atualização normal do formulário
                if (!isset($input['nome'], $input['email'], $input['telefone'])) {
                    http_response_code(400);
                    echo json_encode(["erro" => "Dados incompletos"]);
                    return;
                }

                $updated = $this->shaper->atualizar($id, $input['nome'], $input['email'], $input['telefone']);
                echo json_encode($updated ? ["mensagem" => "Shaper atualizado"] : ["erro" => "Falha ou sem alterações"]);
                break;

case 'DELETE':
    if (!$id) {
        http_response_code(400);
        echo json_encode(["erro" => "ID não informado"]);
        return;
    }

    try {
        $deleted = $this->shaper->deletar($id);
        if ($deleted) {
            echo json_encode(["mensagem" => "Shaper deletado com sucesso"]);
        } else {
            http_response_code(404);
            echo json_encode(["erro" => "Shaper não encontrado"]);
        }
    } catch (PDOException $e) {
        // Erro 23000 ou 1451: Restrição de chave estrangeira (Shaper em uso)
        http_response_code(400); 
        echo json_encode([
            "erro" => "Não é possível excluir um Shaper em uso. Este Shaper possui vínculos com pedidos existentes. Para ocultá-lo, utilize a opção de desativar."
        ]);
    }
    break;


            default:
                http_response_code(405);
                echo json_encode(["erro" => "Método não permitido"]);
        }
    }
}