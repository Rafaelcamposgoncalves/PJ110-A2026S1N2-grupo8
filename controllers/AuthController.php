<?php

require_once 'models/Usuario.php';

class AuthController {

    public function login() {

        $data = json_decode(file_get_contents("php://input"), true);

        $usuario = $data['usuario'] ?? '';
        $senha = $data['senha'] ?? '';

        $usuarioModel = new Usuario();
        $user = $usuarioModel->buscaUsuario($usuario);

        if ($user && password_verify($senha, $user['senha'])) {

            $_SESSION['user'] = $user['usuario'];

            echo json_encode(["mensagem" => "Login realizado com sucesso"]);
        } else {
            http_response_code(401);
            echo json_encode(["mensagem" => "Credenciais inválidas"]);
        }
    }

    public function logout() {

        $_SESSION = [];
        session_destroy();

        echo json_encode(["mensagem" => "Logout realizado"]);
    }
}