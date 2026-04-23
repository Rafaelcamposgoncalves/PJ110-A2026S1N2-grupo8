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
        $raw = file_get_contents("php://input"); 
        $input = json_decode($raw, true); 
        
        if (!is_array($input)) { $input = []; } 

        if ($method === 'POST' && isset($input['_method'])) { 
            $method = strtoupper($input['_method']); 
        } 

        try { 
            switch ($method) { 
                case 'GET': 
                    if (!$id) { 
                        http_response_code(400); 
                        echo json_encode(["erro" => "ID do pedido obrigatório"]); 
                        return; 
                    } 
                    echo json_encode($this->model->listarPorPedido($id)); 
                    break; 

                case 'POST': 
                    if ( empty($input['id_pedido']) || empty($input['id_status']) || empty($input['data']) ) { 
                        http_response_code(400); 
                        echo json_encode(["erro" => "Campos obrigatórios faltando"]); 
                        return; 
                    } 

                    // Captura os dados do input
                    $idPedido = (int)$input['id_pedido']; 
                    $idStatus = (int)$input['id_status']; 
                    $data     = $input['data']; 
                    $obs      = $input['observacao'] ?? null; 
                    
                    // 🔥 CORREÇÃO: Captura o id_usuario enviado pelo JS ou força o ID 1
                    $idUsuario = isset($input['id_usuario']) ? (int)$input['id_usuario'] : 1;

                    // 🔥 CORREÇÃO: Passa o $idUsuario como o 3º parâmetro (conforme a ordem da tabela)
                    $ok = $this->model->criar( 
                        $idPedido, 
                        $idStatus, 
                        $idUsuario, 
                        $data, 
                        $obs 
                    ); 

                    echo json_encode([ 
                        "mensagem" => $ok ? "Criado com sucesso" : "Erro ao criar" 
                    ]); 
                    break; 

                case 'PUT': 
                    if ( !$id || empty($input['id_status']) || empty($input['data']) ) { 
                        http_response_code(400); 
                        echo json_encode(["erro" => "Dados inválidos"]); 
                        return; 
                    } 
                    // Se o seu atualizar também exigir usuário, adicione aqui
                    $ok = $this->model->atualizar( 
                        $id, 
                        $input['id_status'], 
                        $input['data'], 
                        $input['observacao'] ?? null 
                    ); 
                    echo json_encode([ "mensagem" => $ok ? "Atualizado com sucesso" : "Erro ao atualizar" ]); 
                    break; 

                case 'DELETE': 
                    $idStatusPedido = $_GET['id_pedido_status'] ?? null; 
                    if (!$idStatusPedido) { 
                        http_response_code(400); 
                        echo json_encode(["erro" => "Dados incompletos"]); 
                        return; 
                    } 
                    $ok = $this->model->deletarPorPedidoStatus($idStatusPedido); 
                    echo json_encode([ "mensagem" => $ok ? "Deletado com sucesso" : "Erro ao deletar" ]); 
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
