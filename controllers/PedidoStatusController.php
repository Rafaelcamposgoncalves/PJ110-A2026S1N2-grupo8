<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Pedidostatus.php';

class PedidostatusController {

    private $model;

    public function __construct() {

        $database = new Database();
        $db = $database->connect();

        $this->model = new Pedidostatus($db);
    }

    public function processRequest($method, $id = null) {

        header("Content-Type: application/json; charset=UTF-8");

        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input)) $input = $_POST;

        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        try {

            switch ($method) {

                /* ================= LISTAR POR PEDIDO ================= */
                case 'GET':

                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID do pedido obrigatório"]);
                        return;
                    }

                    echo json_encode($this->model->listarPorPedido($id));
                    break;

                /* ================= CRIAR ================= */
                case 'POST':

                    if (
                        empty($input['id_pedido']) ||
                        empty($input['id_status']) ||
                        empty($input['data'])
                    ) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Campos obrigatórios faltando"]);
                        return;
                    }

                    $ok = $this->model->criar(
                        $input['id_pedido'],
                        $input['id_status'],
                        $input['data'],
                        $input['observacao'] ?? null
                    );

                    echo json_encode([
                        "mensagem" => $ok ? "Criado com sucesso" : "Erro ao criar"
                    ]);

                    break;

                /* ================= ATUALIZAR ================= */
                case 'PUT':

                    if (
                        !$id ||
                        empty($input['id_status']) ||
                        empty($input['data'])
                    ) {
                        http_response_code(400);
                        echo json_encode(["erro" => "Dados inválidos"]);
                        return;
                    }

                    $ok = $this->model->atualizar(
                        $id,
                        $input['id_status'],
                        $input['data'],
                        $input['observacao'] ?? null
                    );

                    echo json_encode([
                        "mensagem" => $ok ? "Atualizado com sucesso" : "Erro ao atualizar"
                    ]);

                    break;

                /* ================= DELETE ================= */
                case 'DELETE':

                    if (!$id) {
                        http_response_code(400);
                        echo json_encode(["erro" => "ID não informado"]);
                        return;
                    }

                    $ok = $this->model->deletar($id);

                    echo json_encode([
                        "mensagem" => $ok ? "Deletado com sucesso" : "Erro ao deletar"
                    ]);

                    break;

                default:
                    http_response_code(405);
                    echo json_encode(["erro" => "Método não permitido"]);
            }

        } catch (PDOException $e) {

            http_response_code(500);
            echo json_encode([
                "erro" => "Erro interno",
                "detalhe" => $e->getMessage()
            ]);
        }
    }
}