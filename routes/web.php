<?php

$subRecurso = $uri[1] ?? null;

function auth() {
    if (!isset($_SESSION['user'])) {
        header("Location: /teste/login");
        exit;
    }
}

/* LOGIN */
if ($recurso === 'login') {
    require_once 'views/auth/login.html';
    exit;
}

/* DASHBOARD */
if ($recurso === 'dashboard') {
    auth();
    require_once 'views/dashboard/index.html';
    exit;
}

/* SHAPER */
if ($recurso === 'shaper') {
    auth();
    require_once 'views/shaper/index.html';
    exit;
}

/* PEDIDO */
if ($recurso === 'pedido') {
    auth();
    require_once 'views/pedido/index.html';
    exit;
}

/* HOME */
if ($recurso === null || $recurso === '') {
    auth();
    require_once 'views/home/index.html';
    exit;
}

/* 404 */
http_response_code(404);
echo "Página não encontrada";