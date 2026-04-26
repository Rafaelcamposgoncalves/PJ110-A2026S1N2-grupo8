<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. Carrega a configuração logo no início
$config_path = __DIR__ . '/config/config.json';
$base = '/teste'; // Fallback padrão

if (file_exists($config_path)) {
    $config = json_decode(file_get_contents($config_path), true);
    $base = $config['app']['base_path'] ?? $base;
}

// 2. Define uma constante para usar no PHP (opcional, mas ajuda muito)
define('BASE_PATH', $base);

// Captura URL
$url = $_GET['url'] ?? '';
$url = trim($url, '/');
$uri = explode('/', $url);
$recurso = $uri[0] ?? null;

// Separa API e WEB
if ($recurso === 'api') {
    require_once 'routes/api.php';
} else {
    // 3. Ao carregar a rota web, a variável $base estará disponível para a view
    require_once 'routes/web.php';
}
