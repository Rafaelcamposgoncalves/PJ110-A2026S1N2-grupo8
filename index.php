<?php
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

// captura URL
$url = $_GET['url'] ?? '';
$url = trim($url, '/');
$uri = explode('/', $url);

$recurso = $uri[0] ?? null;

// separa API e WEB
if ($recurso === 'api') {
    require_once 'routes/api.php';
} else {
    require_once 'routes/web.php';
}