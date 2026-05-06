<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Pedido.php';

class PedidoController {
    private $pedido;

    public function __construct() {
        $database = new Database();
        $db = $database->connect();
        $this->pedido = new Pedido($db);
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
                        $data = $this->pedido->buscar($id);
                        echo json_encode($data ?: ["erro" => "Não encontrado"]);
                    } else {
                        echo json_encode($this->pedido->listar());
                    }
                    break;

                case 'POST':
                    $ok = $this->pedido->criar($input['data'], $input['id_shaper'], $input['id_composicao'], $input['id_variacao'], $input['id_acabamento'], $input['id_configuracaoquilha'], $input['id_sistemaquilha'], $input['observacao'] ?? null, $input['tecidos'] ?? [], $input['cores'] ?? []);
                    echo json_encode($ok ? ["mensagem" => "Criado"] : ["erro" => "Falha"]);
                    break;

                case 'PUT':
                    $ok = $this->pedido->atualizar($id, $input['data'], $input['id_shaper'], $input['id_composicao'], $input['id_variacao'], $input['id_acabamento'], $input['id_configuracaoquilha'], $input['id_sistemaquilha'], $input['observacao'] ?? null, $input['tecidos'] ?? [], $input['cores'] ?? []);
                    echo json_encode($ok ? ["mensagem" => "Atualizado"] : ["erro" => "Falha"]);
                    break;

                case 'DELETE':
                    // 🔥 Correção: Agora usa $this->pedido que foi definido no construtor
                    $ok = $this->pedido->deletar($id);
                    if ($ok) {
                        echo json_encode(["mensagem" => "Excluído com sucesso"]);
                    } else {
                        http_response_code(400);
                        echo json_encode(["erro" => "Erro ao excluir ou pedido inexistente"]);
                    }
                    break;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["erro" => $e->getMessage()]);
        }
    }
}
