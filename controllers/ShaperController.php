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

        // Suporta "fake methods" via POST
        if ($method === 'POST' && isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        }

        switch($method) {

            case 'GET':
                if ($id) {
                    // Se for número, busca por ID
                    if (is_numeric($id)) {
                        $data = $this->shaper->buscar($id);
                        if (!$data) {
                            http_response_code(404);
                            echo json_encode(["erro" => "Shaper não encontrado"]);
                            return;
                        }
                        echo json_encode($data);
                        return;
                    } 
                    // Se não for número, busca por todos os campos usando LIKE
                    $data = $this->shaper->buscarPorCampos($id);
                    echo json_encode($data);
                    return;
                } else {
                    $data = $this->shaper->listar();
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

                if (!isset($input['nome'], $input['email'], $input['telefone'])) {
                    http_response_code(400);
                    echo json_encode(["erro" => "Dados incompletos"]);
                    return;
                }

                $updated = $this->shaper->atualizar($id, $input['nome'], $input['email'], $input['telefone']);
                if ($updated) {
                    echo json_encode(["mensagem" => "Shaper atualizado"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["erro" => "Shaper não encontrado"]);
                }
                break;

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(["erro" => "ID não informado"]);
                    return;
                }

                $deleted = $this->shaper->deletar($id);
                if ($deleted) {
                    echo json_encode(["mensagem" => "Shaper deletado"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["erro" => "Shaper não encontrado"]);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["erro" => "Método não permitido"]);
        }
    }
}