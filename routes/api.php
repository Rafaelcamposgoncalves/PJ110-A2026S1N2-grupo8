<?php

header("Content-Type: application/json");

/* =========================
   PEGA ROTA
========================= */
$subRecurso = $uri[1] ?? null;
$id = $uri[2] ?? null;

/* =========================
   AUTH API
========================= */
if (!isset($_SESSION['user']) && $subRecurso !== 'login') {
    http_response_code(401);
    echo json_encode(["mensagem" => "Não autorizado"]);
    exit;
}

/* =========================
   MÉTODO HTTP
========================= */
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['_method'])) {
        $method = strtoupper($input['_method']);
    }
}

/* =========================
   LOGIN
========================= */
if ($subRecurso === 'login') {
    require_once 'controllers/AuthController.php';
    (new AuthController())->login();
    exit;
}

/* =========================
   LOGOUT
========================= */
if ($subRecurso === 'logout') {
    require_once 'controllers/AuthController.php';
    (new AuthController())->logout();
    exit;
}

/* =========================
   USUARIO
========================= */
if ($subRecurso === 'usuario') {
    require_once 'models/Usuario.php';

    $usuarioModel = new Usuario();
    $usuario = $usuarioModel->buscaUsuario($_SESSION['user']);

    echo json_encode([
        "usuario" => $usuario['usuario'],
        "nome" => $usuario['nome']
    ]);
    exit;
}

/* =========================
   DATABASE (SÓ ISSO FOI ADICIONADO)
========================= */
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->connect();

/* =========================
   MAP CONTROLLERS
========================= */
$map = [
    'shapers' => 'ShaperController',
    'cores' => 'CorController',
    'composicoes' => 'ComposicaoController',
    'variacoes' => 'VariacaoController',
    'acabamentos' => 'AcabamentoController',
    'tecidos' => 'TecidoController',
    'configuracaoquilhas' => 'ConfiguracaoQuilhaController',
    'sistemaquilhas' => 'SistemaQuilhaController',
    'pedidos' => 'PedidoController',
    'pedidos-status' => 'PedidoStatusController',
    'status' => 'StatusController'
];

/* =========================
   EXECUÇÃO CONTROLLER
========================= */
if (isset($map[$subRecurso])) {

    require_once "controllers/{$map[$subRecurso]}.php";

    $controllerName = $map[$subRecurso];

    /* 🔥 ÚNICA CORREÇÃO REAL */
    $controller = new $controllerName($db);

    $controller->processRequest($method, $id);

    exit;
}

/* =========================
   404
========================= */
http_response_code(404);
echo json_encode(["erro" => "Rota não encontrada"]);