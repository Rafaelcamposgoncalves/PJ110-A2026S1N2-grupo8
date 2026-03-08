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

        $input = json_decode(file_get_contents("php://input"), true);

        // Suporta fake methods via POST
        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        switch($method) {

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

                $data = $this->pedido->listar();
                echo json_encode($data);

                break;


            /* ================= CRIAR ================= */

            case 'POST':

                if (
                    !isset(
                        $input['data'],
                        $input['id_shaper'],
                        $input['id_composicao'],
                        $input['id_variacao'],
                        $input['id_acabamento'],
                        $input['id_tecido'],
                        $input['id_configuracaoquilha'],
                        $input['id_sistemaquilha']
                    )
                ) {
                    http_response_code(400);
                    echo json_encode(["erro" => "Dados incompletos"]);
                    return;
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
                    $input['cores'] ?? []   // ⭐ AQUI
                );

                http_response_code(201);
                echo json_encode(["mensagem" => "Pedido criado"]);

                break;


            /* ================= ATUALIZAR ================= */

            case 'PUT':

                if (!$id) {
                    http_response_code(400);
                    echo json_encode(["erro" => "ID não informado"]);
                    return;
                }

                if (
                    !isset(
                        $input['data'],
                        $input['id_shaper'],
                        $input['id_composicao'],
                        $input['id_variacao'],
                        $input['id_acabamento'],
                        $input['id_tecido'],
                        $input['id_configuracaoquilha'],
                        $input['id_sistemaquilha']
                    )
                ) {
                    http_response_code(400);
                    echo json_encode(["erro" => "Dados incompletos"]);
                    return;
                }

                $updated = $this->pedido->atualizar(
                    $id,
                    $input['data'],
                    $input['id_shaper'],
                    $input['id_composicao'],
                    $input['id_variacao'],
                    $input['id_acabamento'],
                    $input['id_tecido'],
                    $input['id_configuracaoquilha'],
                    $input['id_sistemaquilha'],
                    $input['observacao'] ?? null,
                    $input['cores'] ?? []  // ⭐ AQUI
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
    }
}