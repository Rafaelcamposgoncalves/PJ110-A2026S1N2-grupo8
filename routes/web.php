<?php
// routes/web.php

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

/* RECUPERAR SENHA (TELA VISUAL .HTML) */
if ($recurso === 'recuperar-senha') {
    require_once 'views/auth/recuperar.html';
    exit;
}

/* DISPARAR RECUPERAÇÃO (BACK-END DE ENVIO VIA API) */
if ($recurso === 'disparar-recuperacao') {
    require_once 'disparar-recuperacao.php'; 
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
    require_once 'views/shaper/index.html'; // Corrigido erro de digitação de .hmtl para .html
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
    require_once 'views/home/index.php';
    exit;
}

/* 404 */
http_response_code(404);
echo "Página não encontrada";
