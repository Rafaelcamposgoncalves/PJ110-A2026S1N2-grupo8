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
        $input = json_decode($inputJSON, true);

        if (!is_array($input)) {
            $input = $_POST;
        }

        // suporte a _method
        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        try {

            switch ($method) {

                /* ================= LISTAR ================= */

                case 'GET':

                    if ($id) {

                        $data = $this->pedido->buscar($id);

                        if (!$data) {
                            http_response_code(404);
                            echo json_encode(["erro" => "Pedido não encontrado"]);
                            return;
                        }

                        echo json_encode($data);
                        return;
                    }

                    echo json_encode($this->pedido->listar());
                    break;


                /* ================= CRIAR ================= */

                case 'POST':

                    $camposObrigatorios = [
                        'data',
                        'id_shaper',
                        'id_composicao',
                        'id_variacao',
                        'id_acabamento',
                        'id_tecido',
                        'id_configuracaoquilha',
                        'id_sistemaquilha'
                    ];

                    foreach ($camposObrigatorios as $campo) {
                        if (empty($input[$campo])) {
                            http_response_code(400);
                            echo json_encode(["erro" => "Campo obrigatório faltando: $campo"]);
                            return;
                        }
                    }

                    $this->pedido->criar(
                        $input['data'],
                        $input['id_shaper'],
                        $input['id_composicao'],
                        $input['id_variacao'],
                        $input['id_acabamento'],
                        $input['id_tecido'],
                        $input['id_configuracaoquilha'],
                        $input['id_sistemaquilha'],
                        $input['observacao'] ?? null,
                        $input['cores'] ?? []
                    );

                    http_response_code(201);
                    echo json_encode(["mensagem" => "Pedido criado com sucesso"]);
                    break;


                /* ================= ATUALIZAR ================= */

                case 'PUT':

                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }

                    $updated = $this->pedido->atualizar(
                        $id,
                        $input['data'] ?? null,
                        $input['id_shaper'] ?? null,
                        $input['id_composicao'] ?? null,
                        $input['id_variacao'] ?? null,
                        $input['id_acabamento'] ?? null,
                        $input['id_tecido'] ?? null,
                        $input['id_configuracaoquilha'] ?? null,
                        $input['id_sistemaquilha'] ?? null,
                        $input['observacao'] ?? null,
                        $input['cores'] ?? []
                    );

                    if ($updated) {

                        echo json_encode(["mensagem" => "Pedido atualizado"]);

                    } else {

                        http_response_code(404);
                        echo json_encode(["erro" => "Pedido não encontrado"]);
                    }

                    break;


                /* ================= DELETE ================= */

                case 'DELETE':

                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }

                    $deleted = $this->pedido->deletar($id);

                    if ($deleted) {

                        echo json_encode(["mensagem" => "Pedido deletado"]);

                    } else {

                        http_response_code(404);
                        echo json_encode(["erro" => "Pedido não encontrado"]);
                    }

                    break;


                default:

                    http_response_code(405);
                    echo json_encode(["erro" => "Método não permitido"]);
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