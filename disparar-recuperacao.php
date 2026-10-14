<?php
// disparar-recuperacao.php
header('Content-Type: text/html; charset=utf-8');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'helpers/EmailHelper.php';

// Conexão PDO nativa com o banco 'teste'
$host = '127.0.0.1';
$db   = 'teste';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (\PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}

// Processa o disparo se receber o formulário via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    $emailInformado = $_POST['email'];

    // 1. Verifica se o e-mail pertence a algum usuário cadastrado
    $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = ? AND ativo = 1");
    $stmt->execute([$emailInformado]);
    $usuario = $stmt->fetch();

    if ($usuario) {
        // 2. Cria um token real seguro de 32 caracteres
        $tokenReal = bin2hex(random_bytes(16));
        
        // 3. Define a expiração do link para daqui a 1 hora
        $stmtUpdate = $pdo->prepare("UPDATE usuario SET recuperar_token = ?, recuperar_expira = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id_usuario = ?");
        $stmtUpdate->execute([$tokenReal, $usuario['id_usuario']]);

        // 4. Dispara a API através do nosso Helper
        $enviou = EmailHelper::enviarRecuperacaoSenha($emailInformado, $tokenReal);

        if ($enviou) {
            // CORREÇÃO: Alerta o usuário e força o redirecionamento para o caminho exato do seu login
            echo "<script>
                    alert('Sucesso! Verifique a caixa de entrada do seu e-mail e siga os passos para alteração da senha.'); 
                    window.location.href = '/teste/login';
                  </script>";
            exit; // Garante que o PHP pare a execução aqui
        } else {
            echo "<script>
                    alert('Erro técnico ao tentar automatizar o envio do e-mail.'); 
                    window.location.href = '/teste/recuperar-senha';
                  </script>";
            exit;
        }
    } else {
        // Alerta amigável caso o e-mail não exista, mandando também de volta para o login por segurança
        echo "<script>
                alert('Se este e-mail constar no sistema, um link foi enviado.'); 
                window.location.href = '/teste/login';
              </script>";
        exit;
    }
}

