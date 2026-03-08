<?php
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

$recurso = null;
$subRecurso = null;
$id = null;

/* =========================
   CAPTURA URL AMIGÁVEL
========================= */
if (isset($_GET['url'])) {
    $url = trim($_GET['url'], '/');
    $uri = explode('/', $url);

    $recurso = $uri[0] ?? null;
    $subRecurso = $uri[1] ?? null;
    $id = $uri[2] ?? null;
}

/* =========================
   LOGIN VIEW (PÚBLICA)
========================= */
if ($recurso === 'login') {
    require_once 'views/auth/login.html';
    exit;
}

/* =========================
   VIEW SHAPER
========================= */
if ($recurso === 'shaper') {

    if (!isset($_SESSION['user'])) {
        header("Location: /teste/login");
        exit;
    }

    require_once 'views/shaper/index.html';
    exit;
}

/* =========================
   VIEW PEDIDO
========================= */
if ($recurso === 'pedido') {

    if (!isset($_SESSION['user'])) {
        header("Location: /teste/login");
        exit;
    }

    require_once 'views/pedido/index.html';
    exit;
}

/* =========================
   API
========================= */
if ($recurso === 'api') {

    header("Content-Type: application/json");

    if (!isset($_SESSION['user']) && $subRecurso !== 'login') {
        http_response_code(401);
        echo json_encode(["mensagem" => "Não autorizado"]);
        exit;
    }

    /* -------- LOGIN -------- */
    if ($subRecurso === 'login') {

        require_once 'controllers/AuthController.php';

        $controller = new AuthController();
        $controller->login();
        exit;
    }

    /* -------- LOGOUT -------- */
    if ($subRecurso === 'logout') {

        require_once 'controllers/AuthController.php';

        $controller = new AuthController();
        $controller->logout();
        exit;
    }

    /* -------- SHAPERS -------- */
    if ($subRecurso === 'shapers') {

        require_once 'controllers/ShaperController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            if (isset($input['_method'])) {
                $method = strtoupper($input['_method']);
            }
        }

        $controller = new ShaperController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- CORES -------- */
    if ($subRecurso === 'cores') {

        require_once 'config/database.php';
        require_once 'controllers/CorController.php';

        $database = new Database();
        $db = $database->connect();

        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            if (isset($input['_method'])) {
                $method = strtoupper($input['_method']);
            }
        }

        $controller = new CorController($db);
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- COMPOSICOES -------- */
    if ($subRecurso === 'composicoes') {

        require_once 'controllers/ComposicaoController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new ComposicaoController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- VARIACOES -------- */
    if ($subRecurso === 'variacoes') {

        require_once 'controllers/VariacaoController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new VariacaoController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- ACABAMENTOS -------- */
    if ($subRecurso === 'acabamentos') {

        require_once 'controllers/AcabamentoController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new AcabamentoController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- TECIDOS -------- */
    if ($subRecurso === 'tecidos') {

        require_once 'controllers/TecidoController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new TecidoController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- CONFIGURACAO QUILHA -------- */
    if ($subRecurso === 'configuracaoquilhas') {

        require_once 'controllers/ConfiguracaoQuilhaController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new ConfiguracaoQuilhaController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- SISTEMA QUILHA -------- */
    if ($subRecurso === 'sistemaquilhas') {

        require_once 'controllers/SistemaQuilhaController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        $controller = new SistemaQuilhaController();
        $controller->processRequest($method, $id);
        exit;
    }

    /* -------- PEDIDOS -------- */
    if ($subRecurso === 'pedidos') {

        require_once 'controllers/PedidoController.php';

        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            if (isset($input['_method'])) {
                $method = strtoupper($input['_method']);
            }
        }

        $controller = new PedidoController();
        $controller->processRequest($method, $id);
        exit;
    }
}

/* =========================
   HOME
========================= */
if ($recurso === null) {

    if (!isset($_SESSION['user'])) {
        header("Location: /teste/login");
        exit;
    }

    require_once 'views/home/index.html';
    exit;
}

/* =========================
   404
========================= */
http_response_code(404);
echo "Rota não encontrada";