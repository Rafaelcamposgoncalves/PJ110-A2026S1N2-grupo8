<?php
// criasenha.php
header('Content-Type: text/html; charset=utf-8');

// Ativa exibição de erros para desenvolvimento manual
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ==========================================
// 1. CONEXÃO COM O BANCO DE DADOS (PDO NATIVO)
// ==========================================
$host = '127.0.0.1';
$db   = 'teste'; // Nome do banco de dados do seu sql
$user = 'root';
$pass = ''; // Senha padrão do XAMPP geralmente é vazia
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Erro ao conectar com o banco de dados: " . $e->getMessage());
}

// ==========================================
// 2. VERIFICAÇÃO DO TOKEN ENVIADO POR E-MAIL
// ==========================================
$tokenValido = false;
$msgErro = "";
$token = isset($_GET['token']) ? $_GET['token'] : '';

if (!empty($token)) {
    // Busca se existe usuário com o token e se a expiração é maior que o horário atual (2026-10-14 08:16:00)
    $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE recuperar_token = ? AND recuperar_expira > NOW()");
    $stmt->execute([$token]);
    $usuarioEncontrado = $stmt->fetch();

    if ($usuarioEncontrado) {
        $tokenValido = true;
        $idUsuario = $usuarioEncontrado['id_usuario'];
    } else {
        $msgErro = "Este link de recuperação é inválido ou já expirou!";
    }
} else {
    $msgErro = "Nenhum token de segurança foi fornecido.";
}

// ==========================================
// 3. PROCESSAMENTO DO FORMULÁRIO DE NOVA SENHA
// ==========================================
$msgSucesso = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nova_senha']) && isset($_POST['id_user'])) {
    $novaSenha = $_POST['nova_senha'];
    $idUser = $_POST['id_user'];

    // Criptografia nativa do PHP (Igual ao seu código original)
    $senhaCriptografada = password_hash($novaSenha, PASSWORD_DEFAULT);

    // Atualiza a senha e limpa o token para não ser usado duas vezes
    $stmtUpdate = $pdo->prepare("UPDATE usuario SET senha = ?, recuperar_token = NULL, recuperar_expira = NULL WHERE id_usuario = ?");
    $stmtUpdate->execute([$senhaCriptografada, $idUser]);

    $msgSucesso = "Senha redefinida com sucesso! Você já pode entrar no sistema.";
    $tokenValido = false; // Esconde o formulário
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Nova Senha</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light d-flex align-items-center justify-content-center vh-100">

    <div class="card shadow p-4" style="width: 100%; max-width: 400px;" role="main">
        <h4 class="text-center mb-4">Nova Senha</h4>

        <!-- Mensagens de Feedback Acessíveis -->
        <?php if (!empty($msgErro) && !$tokenValido): ?>
            <div class="alert alert-danger" role="alert"><?php echo $msgErro; ?></div>
        <?php endif; ?>

        <?php if (!empty($msgSucesso)): ?>
            <div class="alert alert-success" role="alert"><?php echo $msgSucesso; ?></div>
            <div class="text-center mt-3">
                <a href="index.php" class="btn btn-primary w-100">Ir para o Login</a>
            </div>
        <?php endif; ?>

        <!-- Formulário Seguro de Criação de Senha -->
        <?php if ($tokenValido): ?>
            <form action="criasenha.php?token=<?php echo htmlspecialchars($token); ?>" method="POST">
                <input type="hidden" name="id_user" value="<?php echo $idUsuario; ?>">
                
                <div class="mb-3">
                    <label for="nova_senha" class="form-label">Digite a nova senha:</label>
                    <input type="password" id="nova_senha" name="nova_senha" class="form-control" required aria-required="true" minlength="6">
                    <div class="form-text">Mínimo de 6 caracteres.</div>
                </div>

                <button type="submit" class="btn btn-success w-100" aria-label="Salvar nova senha">Salvar Nova Senha</button>
            </form>
        <?php endif; ?>
    </div>

</body>
</html>
