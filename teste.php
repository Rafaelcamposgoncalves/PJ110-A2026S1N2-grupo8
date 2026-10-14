<?php
// teste.php

// 1. Configura o cabeçalho para exibir caracteres especiais de forma correta (Acessibilidade)
header('Content-Type: text/html; charset=utf-8');

// 2. Ativa a exibição de erros na tela para facilitar o diagnóstico de desenvolvimento manual
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 3. Importa manualmente o seu arquivo Helper localizado na pasta helpers
require_once 'helpers/EmailHelper.php';

echo "<h2>Iniciando teste de envio de e-mail automatizado...</h2>";
echo "<p>Processando requisição de API via PHPMailer nativo...</p>";

// Simulação de dados fictícios de um usuário da oficina de laminação
$emailDeTeste = 'rafael@oficina.com.br'; 
$tokenFalso = bin2hex(random_bytes(16)); // Gera um token aleatório seguro e real de 32 caracteres

// 4. Executa a função estática de envio configurada com o seu Mailtrap
$sucesso = EmailHelper::enviarRecuperacaoSenha($emailDeTeste, $tokenFalso);

// 5. Exibe o resultado visual na tela
if ($sucesso) {
    echo "<div style='color: green; font-weight: bold; margin-top: 20px; font-family: sans-serif;'>";
    echo "✓ Sucesso! O PHPMailer processou a automação e disparou o e-mail corretamente.";
    echo "<br><br>👉 Acesse agora o seu painel do Mailtrap na aba 'Inboxes' para ver a mensagem entregue!";
    echo "</div>";
} else {
    echo "<div style='color: red; font-weight: bold; margin-top: 20px; font-family: sans-serif;'>";
    echo "✕ Erro! Falha crítica ao disparar o e-mail de redefinição.";
    echo "<br><br>💡 O que verificar:";
    echo "<ul style='font-weight: normal;'>";
    echo "<li>Se a pasta principal do <strong>PHPMailer</strong> foi colada com esse nome exato dentro da pasta <strong>lib/</strong>.</li>";
    echo "<li>Se os arquivos de conexão do Mailtrap foram colados sem erros no seu <strong>helpers/EmailHelper.php</strong>.</li>";
    echo "</ul>";
    echo "</div>";
}
